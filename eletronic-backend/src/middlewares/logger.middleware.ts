import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const start = process.hrtime(); // Mulai hitung waktu

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(); // format konversi ke milidetik
    const currentDate = new Date()
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);

    const method = req.method;
    const endpoint = req.originalUrl;
    const statusCode = res.statusCode;

    // catat ke winston log
    logger.info(
      `Tanggal: ${currentDate} | Method: ${method} | Endpoint: ${endpoint} | Status: ${statusCode} | Waktu: ${timeInMs} ms`,
    );
  });

  next();
}