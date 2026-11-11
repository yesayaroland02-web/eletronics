
import { Request, Response, NextFunction } from "express";
import * as productService from "../services/product.service";
import prisma from "../config/db";
import { uploadToCloudinary } from "../services/cloudinary.service";
import { MulterRequest } from "../middlewares/upload.middleware";

export async function createProductHandler(
  req: MulterRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("=== DEBUG CREATE PRODUCT ===");
    console.log("BODY:", req.body);
    console.log(
      "FILE:",
      req.file
        ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
          }
        : "FILE TIDAK DITERIMA",
    );

    const { title, category, description, stock, price } = req.body;

    let imageUrl: string | undefined;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "warmad-products",
      );

      imageUrl = uploadResult.secure_url;
      console.log("CLOUDINARY URL:", imageUrl);
    }

    const product = await productService.createProduct({
      title,
      category,
      description,
      imageUrl,
      stock: Number(stock),
      price: Number(price),
    });

    console.log("PRODUCT SAVED:", product);

    return res.status(201).json({
      message: "Produk berhasil dibuat",
      data: product,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    next(error);
  }
}

export async function getAllProductsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const products = await productService.getAllProducts();

    return res.status(200).json({
      source: products.source,
      responseTime: products.responseTime,
      data: products.data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const product = await productService.getProductById(String(id));

    if (!product) {
      return res.status(404).json({
        message: "Produk tidak ditemukan.",
      });
    }

    return res.status(200).json({
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProductHandler(
  req: MulterRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const existingProduct = await productService.getProductById(String(id));

    if (!existingProduct) {
      return res.status(404).json({
        message: "Produk tidak ditemukan.",
      });
    }

    const { title, category, description, stock, price } = req.body;

    const updateData: productService.UpdateProductInput = {};

    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (stock !== undefined) updateData.stock = Number(stock);
    if (price !== undefined) updateData.price = Number(price);

    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "warmad-products",
      );

      updateData.imageUrl = uploadResult.secure_url;
    }

    const updatedProduct = await productService.updateProduct(
      String(id),
      updateData,
    );

    return res.status(200).json({
      message: "Produk berhasil diperbarui",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    next(error);
  }
}

export async function deleteProductHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const existingProduct = await productService.getProductById(String(id));

    if (!existingProduct) {
      return res.status(404).json({
        message: "Produk tidak ditemukan.",
      });
    }

    await productService.softDeleteProduct(String(id));

    return res.status(200).json({
      message: "Produk berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    next(error);
  }
}

export async function restoreProductHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findFirst({
      where: {
        id: String(id),
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Produk tidak ditemukan.",
      });
    }

    await productService.restoreProduct(String(id));

    return res.status(200).json({
      message: "Produk berhasil dikembalikan.",
    });
  } catch (error) {
    console.error("RESTORE PRODUCT ERROR:", error);
    next(error);
  }
}