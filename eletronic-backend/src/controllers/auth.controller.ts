import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";

/**
 * Controller: Register Customer
 */
export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // data req.body sudah pasti tervalidasi di level router
    const { email, password } = req.body;

    const user = await authService.registerCustomer({ email, password });

    return res.status(201).send({
      message: "Registrasi akun customer berhasil.",
      data: user,
    });
  } catch (error: any) {
    // TODO 5: Teruskan error ke Global Error Middleware
    next(error);
  }
}

/**
 * Controller: Login User
 */
export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body;

    const user = await authService.loginUser({ email, password });

    return res.status(200).send({
      message: "Login berhasil",
      data: user,
    });
  } catch (error: any) {
    next(error);
  }
}