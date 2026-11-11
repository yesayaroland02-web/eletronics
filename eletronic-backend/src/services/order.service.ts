import prisma from "../config/db";

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  userId?: string;
  items: OrderItemInput[];
}

export interface UpdateOrderStatusInput {
  status: "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";
}

/**
 * 1. Membuat Order Baru (Menggunakan Interactive Transaction)
 */
export async function createOrder(data: CreateOrderInput) {
  if (!data.items || data.items.length === 0) {
    const error: any = new Error("Pesanan harus memiliki minimal 1 item produk.");
    error.statusCode = 400;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    const orderItemsToCreate: any[] = [];

    for (const item of data.items) {
      const product = await tx.product.findFirst({
        where: {
          id: item.productId,
          deletedAt: null,
        },
      });

      if (!product) {
        throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Stok produk "${product.title}" tidak mencukupi (Tersisa: ${product.stock})`,
        );
      }

      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      const itemPrice = Number(product.price);
      totalAmount += itemPrice * item.quantity;

      orderItemsToCreate.push({
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    const order = await tx.order.create({
      data: {
        userId: data.userId || null,
        totalAmount,
        status: "PENDING",
        items: {
          create: orderItemsToCreate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    return order;
  });
}

/**
 * 2. Upload Bukti Bayar oleh User
 */
export async function uploadOrderPaymentProof(orderId: string, paymentProofUrl: string, userId?: string) {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    const error: any = new Error("Pesanan tidak ditemukan.");
    error.statusCode = 404;
    throw error;
  }

  // Jika order milik user tertentu, pastikan hanya pemilik (atau tanpa userId check jika admin) yang bisa upload
  if (userId && existingOrder.userId && existingOrder.userId !== userId) {
    const error: any = new Error("Anda tidak memiliki izin mengunggah bukti bayar untuk pesanan ini.");
    error.statusCode = 403;
    throw error;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentProof: paymentProofUrl,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  return updatedOrder;
}

/**
 * 3. Mengambil Riwayat Pesanan Saya (User History)
 */
export async function getMyOrders(userId: string) {
  return await prisma.order.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });
}

/**
 * 4. Memperbarui Status Order & Restock jika Dibatalkan
 */
export async function updateOrderStatus(
  orderId: string,
  status: UpdateOrderStatusInput["status"],
) {
  return await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existingOrder) {
      const error: any = new Error("Pesanan tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    if (status === "CANCELLED" && existingOrder.status !== "CANCELLED") {
      for (const item of existingOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    return updatedOrder;
  });
}

/**
 * 5. Mengambil Detail Order Berdasarkan ID
 */
export async function getOrderById(id: string) {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });
}

/**
 * 6. Mengambil Semua Daftar Order (Untuk Admin)
 */
export async function getAllOrders() {
  return await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });
}