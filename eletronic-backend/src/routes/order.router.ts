import { Router } from "express";
import {
  createOrderHandler,
  updateOrderStatusHandler,
  getOrderByIdHandler,
  getAllOrdersHandler,
  uploadPaymentProofHandler,
  getMyOrdersHandler,
} from "../controllers/order.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";
import { uploadPaymentProof } from "../middlewares/upload.middleware";

const orderRouter = Router();

// Membuat pesanan (checkout) - wajib login
orderRouter.post("/", authenticate, createOrderHandler);

// Mengambil riwayat pesanan user yang sedang login
orderRouter.get("/my-orders", authenticate, getMyOrdersHandler);

// Upload bukti bayar untuk pesanan tertentu
orderRouter.post("/:id/payment-proof", authenticate, uploadPaymentProof, uploadPaymentProofHandler);

// Admin melihat semua pesanan
orderRouter.get("/", authenticate, authorizeRoles("ADMIN"), getAllOrdersHandler);

// Detail order berdasarkan ID
orderRouter.get("/:id", authenticate, getOrderByIdHandler);

// Admin mengupdate status order (PAID, COMPLETED, CANCELLED)
orderRouter.patch("/:id/status", authenticate, authorizeRoles("ADMIN"), updateOrderStatusHandler);

export default orderRouter;