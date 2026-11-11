
import express, { Request, Response } from "express";
import prisma from "./config/db";
import cors from "cors";
import http from "http";

import productRouter from "./routes/product.router";
import orderRouter from "./routes/order.router";
import authRouter from "./routes/auth.router";
import checkoutRouter from "./routes/checkout.router";

import { errorHandler } from "./middlewares/error.middleware";
import { loggerMiddleware } from "./middlewares/logger.middleware";

import { handleStockNotification } from "./utils/workers/stockWorker";
import { initSocket } from "./config/socket";

const app = express();

// Mengikuti port dari hosting, default 8000 untuk lokal
const PORT = Number(process.env.PORT) || 8000;

// Daftar domain frontend yang diizinkan
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://eletronic-frontend.vercel.app/",
];

// CORS configuration
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware JSON
app.use(express.json());

// HTTP Server
const server = http.createServer(app);

// Inisialisasi Socket.IO
initSocket(server);

// Logger
app.use(loggerMiddleware);

// Health check
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Eletronic API is running",
  });
});

app.get("/api/test", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API connected successfully",
  });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/checkout", checkoutRouter);

// Stock notification
app.use("/api/queues/stock-notification", handleStockNotification);

// Error handler harus paling akhir
app.use(errorHandler);

// Test koneksi database
async function testDbConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    console.log("Database Neon berhasil terhubung!");
  } catch (error) {
    console.error("Gagal terhubung ke database:", error);
    throw error;
  }
}

// Menjalankan server
async function startServer() {
  try {
    await testDbConnection();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server berjalan di port "${PORT}"`);
    });
  } catch (error) {
    console.error("Server gagal dijalankan:", error);
    process.exit(1);
  }
}

startServer();