import { Router } from "express";
import {
  registerHandler,
  loginHandler,
} from "../controllers/auth.controller.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { validate } from "../middlewares/validate.middleware.js";

const authRouter = Router();

// Endpoint Registrasi khusus Customer
authRouter.post("/register", validate(registerSchema), registerHandler);

// Endpoint Login
authRouter.post("/login", validate(loginSchema), loginHandler);

export default authRouter;