import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { authLimiter, authSlowDown } from "../middlewares/rateLimiters.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validators/authSchemas.js";

export const authRouter = Router();

// Credential endpoints: slow-down + strict rate limit + validation.
authRouter.post(
  "/register",
  authSlowDown,
  authLimiter,
  validate({ body: registerSchema }),
  authController.register,
);
authRouter.post(
  "/login",
  authSlowDown,
  authLimiter,
  validate({ body: loginSchema }),
  authController.login,
);
authRouter.post(
  "/forgot-password",
  authSlowDown,
  authLimiter,
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword,
);
authRouter.post(
  "/reset-password",
  authSlowDown,
  authLimiter,
  validate({ body: resetPasswordSchema }),
  authController.resetPassword,
);

authRouter.get("/me", requireAuth, authController.me);
authRouter.post("/refresh", validate({ body: refreshSchema }), authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.post("/logout-all", requireAuth, authController.logoutAll);
authRouter.post(
  "/change-password",
  requireAuth,
  validate({ body: changePasswordSchema }),
  authController.changePassword,
);
authRouter.post(
  "/verify-email/request",
  requireAuth,
  authController.requestEmailVerification,
);
authRouter.post(
  "/verify-email",
  validate({ body: verifyEmailSchema }),
  authController.verifyEmail,
);
