import { Router } from "express";
import {
  createProductHandler,
  getAllProductsHandler,
  getProductByIdHandler,
  updateProductHandler,
  deleteProductHandler,
  restoreProductHandler,
} from "../controllers/product.controller.js";

import { createProductSchema } from "../schemas/product.schema.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";

import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const productRouter = Router();

// public routes (bisa diakses siapa aja)
productRouter.get("/", getAllProductsHandler);
productRouter.get("/:id", getProductByIdHandler);

// admin only routes (membutuhkan login dan role ADMIN)
productRouter.post(
  "/",
  authenticate,
  authorizeRoles(Role.ADMIN),
  uploadSingleImage, // middleware multer ditempatkan sebelum validasi/handler
  validate(createProductSchema),
  createProductHandler,
);
productRouter.put(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN),
  updateProductHandler,
);
productRouter.delete(
  "/:id/soft-delete",
  authenticate,
  authorizeRoles(Role.ADMIN),
  deleteProductHandler,
);
productRouter.put(
  "/:id/restore",
  authenticate,
  authorizeRoles(Role.ADMIN),
  restoreProductHandler,
);

export default productRouter;
