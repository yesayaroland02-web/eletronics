import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { RegisterInput, LoginInput } from "../interfaces/auth.interfaces.js";
import { Role } from "@prisma/client";

/**
 * Service: Registrasi User (Support role CUSTOMER / ADMIN & nama lengkap)
 */
export async function registerCustomer(data: RegisterInput) {
  // cek apakah email sudah terdaftar atau belum
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    const error: any = new Error("Email sudah terdaftar");
    error.statusCode = 400;
    throw error;
  }

  // kalau lolos pengecekan, lanjut ke hash password menggunakan bcrypt
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // default role CUSTOMER jika tidak ditentukan
  const roleToAssign = data.role === "ADMIN" ? Role.ADMIN : Role.CUSTOMER;

  const newUser = await prisma.user.create({
    data: {
      name: data.name || data.email.split("@")[0],
      email: data.email,
      password: hashedPassword,
      role: roleToAssign,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return newUser;
}

/**
 * Service: Login User
 */
export async function loginUser(data: LoginInput) {
  // cek apakah email sudah terdaftar atau belum
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    const error: any = new Error("Email atau password salah");
    error.statusCode = 401;
    throw error;
  }

  // verifikasi password dengan hash di DB
  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    const error: any = new Error("Password tidak sesuai");
    error.statusCode = 401;
    throw error;
  }

  // buat jwt access token
  const secretKey = process.env.JWT_SECRET || "default_jwt_secret_key_123456";
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name || user.email.split("@")[0],
      email: user.email,
      role: user.role,
    },
    secretKey,
    { expiresIn: "1d" },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name || user.email.split("@")[0],
      email: user.email,
      role: user.role,
    },
  };
}
