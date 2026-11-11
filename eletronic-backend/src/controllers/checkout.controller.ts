
import { Request, Response, NextFunction } from "express";
import {
  createCheckout,
  uploadPaymentProof,
  verifyCheckout,
  CheckoutError,
} from "../services/checkout.service";
import { MulterRequest } from "../middlewares/upload.middleware";

// ======================================================
// CREATE CHECKOUT
// POST /api/checkout
// ======================================================

export async function createCheckoutHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Silakan login terlebih dahulu.",
      });
    }

    const result = await createCheckout(
      req.body,
      req.user.id,
    );

    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof CheckoutError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    next(error);
  }
}

// ======================================================
// UPLOAD PAYMENT PROOF
// POST /api/checkout/:orderId/payment-proof
// ======================================================

export async function uploadPaymentProofHandler(
  req: MulterRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Silakan login terlebih dahulu.",
      });
    }

    const orderId = req.params.orderId;

    if (typeof orderId !== "string") {
      return res.status(400).json({
        message: "ID transaksi tidak valid.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Silakan pilih bukti pembayaran.",
      });
    }

    const result = await uploadPaymentProof(
      orderId,
      req.file.buffer,
      req.user.id,
    );

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof CheckoutError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    next(error);
  }
}

// ======================================================
// ADMIN VERIFY PAYMENT
// PATCH /api/checkout/:orderId/verify
// ======================================================

export async function verifyCheckoutHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const orderId = req.params.orderId;

    if (typeof orderId !== "string") {
      return res.status(400).json({
        message: "ID transaksi tidak valid.",
      });
    }

    const { status } = req.body;

    if (status !== "PAID" && status !== "CANCELLED") {
      return res.status(400).json({
        message: "Status harus PAID atau CANCELLED.",
      });
    }

    const result = await verifyCheckout(orderId, status);

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof CheckoutError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    next(error);
  }
}