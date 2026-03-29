import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { createRateLimitMiddleware } from "../middlewares/rate-limit.middleware.js";

const router = Router();

router.post("/login", authController.login);
router.get("/me", authenticate, authController.me);
router.put("/profile", authenticate, authController.updateProfile);
router.post(
  "/accept-invite",
  createRateLimitMiddleware({
    key: "accept_invite",
    windowMs: 10 * 60 * 1000,
    max: 12,
    message: "邀请验证请求过于频繁，请稍后重试",
  }),
  authController.acceptInvite,
);
router.post(
  "/forgot-password",
  createRateLimitMiddleware({
    key: "forgot_password",
    windowMs: 15 * 60 * 1000,
    max: 6,
    message: "重置请求过于频繁，请稍后重试",
  }),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  createRateLimitMiddleware({
    key: "reset_password",
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: "重置操作过于频繁，请稍后重试",
  }),
  authController.resetPassword,
);

export default router;
