import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface UserPayload {
  id: string;
  name?: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

/**
 * Middleware: Authentication (Cek & Verifikasi Token)
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({
        message: "Akses ditolak. Token tidak ditemukan.",
      });
    }

    const token = authHeader.split(" ")[1];
    const secretKey = process.env.JWT_SECRET || "default_jwt_secret_key_123456";

    const decoded = jwt.verify(token, secretKey) as unknown as UserPayload;
    req.user = decoded;

    next();
  } catch (error) {
    return res
      .status(401)
      .send({ message: "Token tidak valid atau kadaluarsa" });
  }
}

/**
 * Middleware: Authorize Roles
 */
export function authorizeRoles(...allowedRoles: Array<"CUSTOMER" | "ADMIN">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).send({
        message: "Akses terlarang. Anda tidak memiliki izin untuk tindakan ini.",
      });
    }
    next();
  };
}