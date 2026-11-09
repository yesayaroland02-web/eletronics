import prisma from "../config/db.js";
import { redis } from "../config/redis.js";
import { enqueueLowStockNotification } from "../utils/queues/stockQueue.js";

/**
 * Interface untuk data input pembuatan produk baru
 */
export interface CreateProductInput {
  title: string;
  category: string;
  description?: string;
  imageUrl?: string;
  stock: number;
  price: number;
}

/**
 * Interface untuk data input pembaharuan produk (semua field bersifat opsional)
 */
export interface UpdateProductInput {
  title?: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  stock?: number;
  price?: number;
}

export async function createProduct(data: CreateProductInput) {
  const product = await prisma.product.create({
    data: {
      title: data.title,
      category: data.category,
      description: data.description,
      imageUrl: data.imageUrl,
      stock: data.stock,
      price: data.price,
    },
  });

  if (product.stock <= 5) {
    await enqueueLowStockNotification(product.title, product.stock);
  }

  // hapus/invalisasi cache: setiap ada produk baru, cache getAllProducts wajib dihapus
  // notes: harus dilakukan juga di fitur Update
  // supaya data terbaru langsung muncul saat user melakukan get all berikutnya
  await redis.del("products:all");
  return product;
}

export async function getAllProducts() {
  const startTime = performance.now(); // mulai hitung waktu
  const cacheKey = "products:all";

  // cek apakah data sudah ada di Redis Cache
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    // untuk mendefinisikan berapa lama/cepat redis ini bekerja
    const endTime = performance.now();
    const responseTime = `${(endTime - startTime).toFixed(2)} ms`;

    // kembalikan data dari cache beserta metadata bukti
    return {
      source: "cache (Redis)",
      responseTime,
      data: cachedData,
    };
  }

  // jika tidak ada di cache (Cache Miss), ambil dari Database
  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // simpan data ke redis cache dengan masa aktif (TTL) misal 60 detik
  await redis.set(cacheKey, products, { ex: 60 });

  const endTime = performance.now();
  const responseTime = `${(endTime - startTime).toFixed(2)} ms`;

  return {
    source: "database",
    responseTime,
    data: products,
  };
}

export async function getProductById(id: string) {
  return await prisma.product.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
}

export async function updateProduct(id: string, data: UpdateProductInput) {
  return await prisma.product.update({
    where: { id },
    data,
  });
}

export async function softDeleteProduct(id: string) {
  return await prisma.product.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

export async function restoreProduct(id: string) {
  return await prisma.product.update({
    where: { id },
    data: {
      deletedAt: null,
    },
  });
}