import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // tangani error spesifik dari Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        // unique constraint failed
        const targetList = Array.isArray(err.meta?.target)
          ? err.meta.target.join(", ")
          : (err.meta?.target as string) || "Field";
        return res.status(409).send({
          message: `Data dengan ${targetList} tersebut sudah ada / terdaftar.`,
        });
      }
      case "P2025": {
        // record to update/delete not found
        return res.status(404).send({
          message: "Data yang dicari tidak ditemukan",
        });
      }
      case "P2003": {
        // foreign key constraint failed
        return res.status(400).send({
          message:
            "Relasi data tidak valid atau referensi data tidak ditemukan.",
        });
      }
      default: {
        // kode error Prisma lainnya
        return res.status(400).send({
          message: "Terjadi kesalahan pada permintaan data.",
        });
      }
    }
  }

  // tangani error validasi/prisma initialization
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).send({
      message: "Format data yang dikirimkan tidak sesuai.",
    });
  }

  // return pesan umum (sinyal jelek, maintenance server, dll.)
  return res.status(500).send({
    message: "Terjadi kesalahan internal pada server",
  });
}
