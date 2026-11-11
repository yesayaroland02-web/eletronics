import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, email, password } = req.body;

    const user = await authService.registerCustomer({
      name,
      email,
      password,
    });

    return res.status(201).json({
      message: "Registrasi akun berhasil.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser({
      email,
      password,
    });

    return res.status(200).json({
      message: "Login berhasil.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}