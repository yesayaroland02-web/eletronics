import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET belum ditemukan di file .env");
}

const prisma = new PrismaClient();

export default prisma;