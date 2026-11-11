import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error("========== SERVER ERROR ==========");
  console.error("URL:", req.method, req.originalUrl);
  console.error("ERROR:", err);

  if (err instanceof Error) {
    console.error("MESSAGE:", err.message);
    console.error("STACK:", err.stack);
  }

  console.error("==================================");

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return res.status(409).json({
          message: "Data sudah terdaftar.",
        });

      case "P2025":
        return res.status(404).json({
          message: "Data tidak ditemukan.",
        });

      case "P2003":
        return res.status(400).json({
          message: "Relasi data tidak valid.",
        });

      default:
        return res.status(400).json({
          message: "Terjadi kesalahan pada permintaan database.",
          code: err.code,
        });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: "Format data yang dikirim tidak sesuai.",
    });
  }

  return res.status(500).json({
    message: "Terjadi kesalahan internal pada server.",
  });
}