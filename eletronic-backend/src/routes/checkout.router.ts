
import { Router } from "express";

import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware";

import {
  uploadPaymentProof,
} from "../middlewares/upload.middleware";

import {
  createCheckoutHandler,
  uploadPaymentProofHandler,
  verifyCheckoutHandler,
} from "../controllers/checkout.controller";

const router = Router();

// Customer membuat checkout
router.post(
  "/",
  authenticate,
  authorizeRoles("CUSTOMER"),
  createCheckoutHandler,
);

// Customer upload bukti pembayaran
router.post(
  "/:orderId/payment-proof",
  authenticate,
  authorizeRoles("CUSTOMER"),
  uploadPaymentProof,
  uploadPaymentProofHandler,
);

// Admin verifikasi pembayaran
router.patch(
  "/:orderId/verify",
  authenticate,
  authorizeRoles("ADMIN"),
  verifyCheckoutHandler,
);

export default router;