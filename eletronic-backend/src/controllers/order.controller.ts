import { Request, Response, NextFunction } from "express";
import * as orderService from "../services/order.service";
import { uploadToCloudinary } from "../services/cloudinary.service";
import { MulterRequest } from "../middlewares/upload.middleware";

/**
 * 1. Handler untuk membuat order baru (Checkout)
 */
export async function createOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { items } = req.body;
    const userId = req.user?.id;

    const newOrder = await orderService.createOrder({ userId, items });

    return res.status(201).send({
      message: "Order berhasil dibuat.",
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 2. Handler untuk upload bukti bayar
 */
export async function uploadPaymentProofHandler(
  req: MulterRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.id;

    if (!req.file) {
      return res.status(400).send({
        message: "File gambar bukti bayar wajib diunggah.",
      });
    }

    // Upload ke Cloudinary atau jadikan Base64 fallback jika Cloudinary belum di-setup
    let imageUrl = "";
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "warmad-payment-proofs");
      imageUrl = uploadResult.secure_url;
    } else {
      imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    const updatedOrder = await orderService.uploadOrderPaymentProof(id, imageUrl, userId);

    return res.status(200).send({
      message: "Bukti bayar berhasil diunggah.",
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 3. Handler untuk mengambil riwayat pesanan user yang sedang login
 */
export async function getMyOrdersHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).send({
        message: "Sesi tidak valid.",
      });
    }

    const orders = await orderService.getMyOrders(userId);

    return res.status(200).send({
      message: "Berhasil mengambil riwayat pesanan.",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 4. Handler untuk memperbarui status order (Admin)
 */
export async function updateOrderStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status } = req.body;

    const allowedStatus = ["PENDING", "PAID", "CANCELLED", "COMPLETED"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).send({
        message: "Status tidak valid. Pilihan: PENDING, PAID, CANCELLED, COMPLETED",
      });
    }

    const updatedOrder = await orderService.updateOrderStatus(id, status);

    return res.status(200).send({
      message: "Status order berhasil diperbarui.",
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 5. Handler untuk mengambil detail order berdasarkan ID
 */
export async function getOrderByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const order = await orderService.getOrderById(id);

    if (!order) {
      return res.status(404).send({
        message: "Order tidak ditemukan.",
      });
    }

    return res.status(200).send({
      message: "Berhasil mengambil detail order.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 6. Handler untuk mengambil seluruh daftar order (Admin)
 */
export async function getAllOrdersHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const orders = await orderService.getAllOrders();

    return res.status(200).send({
      message: "Berhasil mengambil semua pesanan.",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}