import { Router } from "express";
import {
  registerHandler,
  loginHandler,
} from "../controllers/auth.controller";
import {
  registerSchema,
  loginSchema,
} from "../schemas/auth.schemas";
import { validate } from "../middlewares/validate.middleware";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), registerHandler);
authRouter.post("/login", validate(loginSchema), loginHandler);

export default authRouter;