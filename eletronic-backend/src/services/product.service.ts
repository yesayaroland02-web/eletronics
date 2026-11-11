
import prisma from "../config/db";
import { redis } from "../config/redis";
import { enqueueLowStockNotification } from "../utils/queue/stockQueue";

export interface CreateProductInput {
  title: string;
  category: string;
  description?: string;
  imageUrl?: string;
  stock: number;
  price: number;
}

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

  await redis.del("products:all");

  return product;
}

export async function getAllProducts() {
  const startTime = performance.now();
  const cacheKey = "products:all";

  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    const endTime = performance.now();

    return {
      source: "cache (Redis)",
      responseTime: `${(endTime - startTime).toFixed(2)} ms`,
      data: cachedData,
    };
  }

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  await redis.set(cacheKey, products, { ex: 60 });

  const endTime = performance.now();

  return {
    source: "database",
    responseTime: `${(endTime - startTime).toFixed(2)} ms`,
    data: products,
  };
}

export async function getProductById(id: string) {
  return prisma.product.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
}

export async function updateProduct(
  id: string,
  data: UpdateProductInput,
) {
  const product = await prisma.product.update({
    where: { id },
    data,
  });

  await redis.del("products:all");

  return product;
}

export async function softDeleteProduct(id: string) {
  const product = await prisma.product.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  await redis.del("products:all");

  return product;
}

export async function restoreProduct(id: string) {
  const product = await prisma.product.update({
    where: { id },
    data: {
      deletedAt: null,
    },
  });

  await redis.del("products:all");

  return product;
}