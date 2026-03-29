import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { createRateLimitMiddleware } from "../middlewares/rate-limit.middleware.js";

const router = Router();

router.post(
  "/invite-user",
  createRateLimitMiddleware({
    key: "invite_user",
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: "邀请请求过于频繁，请稍后重试",
  }),
  requirePermission("user.manage"),
  adminController.inviteUser,
);

export default router;
