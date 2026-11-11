
import prisma from "../config/db";
import cloudinary from "../config/cloudinary";
import { OrderStatus, Prisma } from "@prisma/client";
import { Readable } from "stream";

export class CheckoutError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

interface CreateCheckoutInput {
  items: CheckoutItemInput[];
}

// ======================================================
// AGREGASI ITEM
// ======================================================

function aggregateItems(items: CheckoutItemInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new CheckoutError(
      "Minimal harus memilih satu barang.",
    );
  }

  const quantities = new Map<string, number>();

  for (const item of items) {
    if (
      !item.productId ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      throw new CheckoutError(
        "Data produk atau jumlah pembelian tidak valid.",
      );
    }

    quantities.set(
      item.productId,
      (quantities.get(item.productId) || 0) + item.quantity,
    );
  }

  return Array.from(quantities.entries()).map(
    ([productId, quantity]) => ({
      productId,
      quantity,
    }),
  );
}

// ======================================================
// 1. CREATE CHECKOUT
// ======================================================

export async function createCheckout(
  data: CreateCheckoutInput,
  userId: string,
) {
  const items = aggregateItems(data.items);

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: items.map((item) => item.productId),
      },
      deletedAt: null,
    },
  });

  if (products.length !== items.length) {
    throw new CheckoutError(
      "Salah satu produk tidak ditemukan.",
      404,
    );
  }

  let totalAmount = new Prisma.Decimal(0);

  for (const item of items) {
    const product = products.find(
      (p) => p.id === item.productId,
    );

    if (!product) {
      throw new CheckoutError(
        "Produk tidak ditemukan.",
        404,
      );
    }

    if (product.stock < item.quantity) {
      throw new CheckoutError(
        `Stok produk ${product.title} tidak mencukupi.`,
      );
    }

    // Total harga = harga produk x jumlah pembelian.
    totalAmount = totalAmount.add(
      product.price.mul(item.quantity),
    );
  }

  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      status: OrderStatus.PENDING,
      stockDeducted: false,

      items: {
        create: items.map((item) => {
          const product = products.find(
            (p) => p.id === item.productId,
          )!;

          return {
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
          };
        }),
      },
    },

    include: {
      items: {
        include: {
          product: true,
        },
      },

      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return {
    message: "Checkout berhasil dibuat.",
    order,
  };
}

// ======================================================
// 2. CLOUDINARY UPLOAD HELPER
// ======================================================

function uploadBufferToCloudinary(buffer: Buffer) {
  return new Promise<{
    url: string;
    publicId: string;
  }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "electronic/payment-proofs",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          return reject(
            error || new Error("Upload Cloudinary gagal."),
          );
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    Readable.from([buffer]).pipe(uploadStream);
  });
}

// ======================================================
// 3. UPLOAD PAYMENT PROOF + DEDUCT STOCK
// ======================================================

export async function uploadPaymentProof(
  orderId: string,
  buffer: Buffer,
  userId: string,
) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
  });

  if (!order) {
    throw new CheckoutError(
      "Transaksi tidak ditemukan.",
      404,
    );
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new CheckoutError(
      "Transaksi tidak dapat menerima bukti pembayaran.",
    );
  }

  if (order.paymentProof || order.stockDeducted) {
    throw new CheckoutError(
      "Bukti pembayaran sudah pernah diunggah.",
    );
  }

  if (!buffer || buffer.length === 0) {
    throw new CheckoutError(
      "File bukti pembayaran tidak ditemukan.",
    );
  }

  const uploaded = await uploadBufferToCloudinary(buffer);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Claim transaksi secara atomik.
      const claim = await tx.order.updateMany({
        where: {
          id: orderId,
          userId,
          status: OrderStatus.PENDING,
          paymentProof: null,
          stockDeducted: false,
        },

        data: {
          paymentProof: uploaded.url,
        },
      });

      if (claim.count !== 1) {
        throw new CheckoutError(
          "Transaksi sudah diproses atau bukti pembayaran sudah diunggah.",
          409,
        );
      }

      const orderItems = await tx.orderItem.findMany({
        where: {
          orderId,
        },
      });

      if (orderItems.length === 0) {
        throw new CheckoutError(
          "Detail barang pada transaksi tidak ditemukan.",
        );
      }

      const quantities = new Map<string, number>();

      for (const item of orderItems) {
        quantities.set(
          item.productId,
          (quantities.get(item.productId) || 0) +
            item.quantity,
        );
      }

      // Kurangi stok secara atomik.
      for (const [productId, quantity] of quantities) {
        const updated = await tx.product.updateMany({
          where: {
            id: productId,
            deletedAt: null,
            stock: {
              gte: quantity,
            },
          },

          data: {
            stock: {
              decrement: quantity,
            },
          },
        });

        if (updated.count !== 1) {
          throw new CheckoutError(
            "Stok barang tidak mencukupi. Silakan hubungi admin.",
            409,
          );
        }
      }

      // Tandai bahwa stok sudah dikurangi.
      await tx.order.update({
        where: {
          id: orderId,
        },

        data: {
          stockDeducted: true,
        },
      });

      return tx.order.findUnique({
        where: {
          id: orderId,
        },

        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    return {
      message: "Bukti pembayaran berhasil diunggah.",
      order: result,
    };
  } catch (error) {
    // Hapus gambar Cloudinary jika transaksi database gagal.
    await cloudinary.uploader
      .destroy(uploaded.publicId)
      .catch((cleanupError) => {
        console.error(
          "Gagal menghapus file Cloudinary:",
          cleanupError,
        );
      });

    throw error;
  }
}

// ======================================================
// 4. ADMIN VERIFY PAYMENT
// ======================================================

export async function verifyCheckout(
  orderId: string,
  status: "PAID" | "CANCELLED",
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: {
        id: orderId,
      },

      include: {
        items: true,
      },
    });

    if (!order) {
      throw new CheckoutError(
        "Transaksi tidak ditemukan.",
        404,
      );
    }

    if (
      order.status !== OrderStatus.PENDING ||
      !order.paymentProof ||
      !order.stockDeducted
    ) {
      throw new CheckoutError(
        "Transaksi belum memiliki bukti pembayaran atau sudah diproses.",
        409,
      );
    }

    const updated = await tx.order.updateMany({
      where: {
        id: orderId,
        status: OrderStatus.PENDING,
        paymentProof: {
          not: null,
        },
        stockDeducted: true,
      },

      data: {
        status:
          status === "PAID"
            ? OrderStatus.PAID
            : OrderStatus.CANCELLED,

        stockDeducted:
          status === "PAID" ? true : false,
      },
    });

    if (updated.count !== 1) {
      throw new CheckoutError(
        "Transaksi sudah diproses oleh admin lain.",
        409,
      );
    }

    // Jika pembayaran ditolak, kembalikan stok.
    if (status === "CANCELLED") {
      const quantities = new Map<string, number>();

      for (const item of order.items) {
        quantities.set(
          item.productId,
          (quantities.get(item.productId) || 0) +
            item.quantity,
        );
      }

      for (const [productId, quantity] of quantities) {
        await tx.product.update({
          where: {
            id: productId,
          },

          data: {
            stock: {
              increment: quantity,
            },
          },
        });
      }
    }

    return {
      message:
        status === "PAID"
          ? "Pembayaran berhasil disetujui."
          : "Pembayaran ditolak dan stok barang dikembalikan.",
    };
  });
}
