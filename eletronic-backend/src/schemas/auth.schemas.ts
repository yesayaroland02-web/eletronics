import { z as zod } from "zod";

export const registerSchema = zod.object({
  body: zod.object({
    name: zod.string().min(1, "Nama lengkap wajib diisi"),
    email: zod.email({ message: "Format email tidak valid" }),
    password: zod.string().min(6, "Password minimal 6 karakter"),
  }),
});

export const loginSchema = zod.object({
  body: zod.object({
    email: zod.email({ message: "Format email tidak valid" }),
    password: zod.string().min(1, "Password wajib diisi"),
  }),
});

export type RegisterInput = zod.infer<typeof registerSchema>["body"];
export type LoginInput = zod.infer<typeof loginSchema>["body"];