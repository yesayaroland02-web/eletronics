
import { Router } from "express";
import {
  createProductHandler,
  getAllProductsHandler,
  getProductByIdHandler,
  updateProductHandler,
  deleteProductHandler,
  restoreProductHandler,
} from "../controllers/product.controller.js";

import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

import { uploadSingleImage } from "../middlewares/upload.middleware.js";
import { Role } from "@prisma/client";

const productRouter = Router();

productRouter.get("/", getAllProductsHandler);
productRouter.get("/:id", getProductByIdHandler);

productRouter.post(
  "/",
  authenticate,
  authorizeRoles(Role.ADMIN),
  uploadSingleImage,
  createProductHandler,
);

productRouter.put(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN),
  uploadSingleImage,
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
