import { Request, Response, NextFunction } from "express";
import * as productService from "../services/product.service.js";
import prisma from "../config/db.js";

import { uploadToCloudinary } from "../services/cloudinary.service.js";
import { sendNewProductNotification } from "../services/email.service.js";

import { MulterRequest } from "../middlewares/upload.middleware.js";

// catatan: validasi dimatikan untuk uji error handler

export async function createProductHandler(
  req: MulterRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { title, category, description, stock, price } = req.body;

    let imageUrl: string | undefined;

    // jika ada file yang diunggah lewat Multer
    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "warmad-products",
      );
      imageUrl = uploadResult.secure_url;
    }

    // setelah dapat gambar produk, baru dicatat ke database
    const product = await productService.createProduct({
      title,
      category,
      description,
      imageUrl: imageUrl,
      stock: stock,
      price: price,
    });

    // kirim notifikasi email ke admin secara asynchronous
    const adminEmail = process.env.EMAIL_USER;
    if (adminEmail) {
      sendNewProductNotification({
        to: adminEmail,
        productTitle: product.title,
        category: product.category,
        price: Number(product.price),
        stock: product.stock,
        imageUrl: product.imageUrl || undefined,
      }).catch((error) => {
        console.error("Gagal mengirim email notifikasi: ", error.message);
      });
    }

    // setelah sukses, lempar response
    return res
      .status(201)
      .json({ message: "Produk berhasil dibuat", data: product });
  } catch (error: any) {
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
  } catch (error: any) {
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
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    return res.status(200).json({ data: product });
  } catch (error: any) {
    next(error);
  }
}

export async function updateProductHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const existingProduct = await productService.getProductById(String(id));

    if (!existingProduct) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    const updatedProduct = await productService.updateProduct(
      String(id),
      req.body,
    );
    return res
      .status(200)
      .json({ message: "Produk berhasil diperbarui", data: updatedProduct });
  } catch (error: any) {
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

    // if (!existingProduct) {
    //   return res.status(404).json({ message: "Produk tidak ditemukan." });
    // }

    await productService.softDeleteProduct(String(id));
    return res.status(200).json({ message: "Produk berhasil dihapus." });
  } catch (error: any) {
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

    // pengecekan barang yang mau direstore
    // better disimpan di layer SERVICE - ini hanya contoh logic
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: String(id),
      },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    await productService.restoreProduct(String(id));
    return res.status(200).json({ message: "Produk berhasil dikembalikan." });
  } catch (error: any) {
    next(error);
  }
}