import express, { Request, Response } from "express";
import prisma from "./config/db.js";
import cors from "cors";
import http from "http";

import productRouter from "./routes/product.router.js";
import orderRouter from "./routes/order.router.js";
import authRouter from "./routes/auth.router.js";

import { errorHandler } from "./middlewares/error.middleware.js";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import { initStockChecker } from "./utils/cron/stockChecker.js";
import { handleStockNotification } from "./utils/workers/stockWorker.js";

import { initSocket } from "./config/socket.js";

const app = express();
const PORT = 8000;

// CORS -> Cross Origin Resource Sharing
// tugasnya untuk membatasi akses ke API (whitelist untuk beberapa address tertentu aja)
// bisa multiple address

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173",  "https://warmad-mart-fe.vercel.app"],
  }),
);

app.use(express.json());

// buat http server untuk konfigurasi socket
const server = http.createServer(app);

// inisialisasi socket.IO di atas HTTP Server
initSocket(server);

// logger haruus dipasang paling atas untuk merecord semua aktivitas di app
app.use(loggerMiddleware);

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
// app.use("/api/ai", aiRouter);

app.use("/api/test", (req: Request, res: Response) => {
  res.status(200).send({
    message: "ok",
  });
});

app.use("/api/queues/stock-notification", handleStockNotification);

// initStockChecker();

// error middleware HARUS diletakkan di akhir semua router
app.use(errorHandler);

/**
 * Fungsi untuk menguji koneksi ke database sebelum server berjalan
 */
async function testDbConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Koneksi ke database Neon berhasil terhubung!");
  } catch (error) {
    console.error("❌ Gagal terhubung ke database Neon: ", error);
    process.exit(1);
  }
}

/**
 * Fungsi untuk menjalankan server Express dan melakukan verifikasi koneksi DB
 */
async function startServer() {
  await testDbConnection();

  // jika ingin tes socketio harus pake server
  // jika sudah selesai, kemablikan ke app.listen
  server.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

startServer();