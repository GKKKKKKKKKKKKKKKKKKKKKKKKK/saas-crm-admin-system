import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { AppError, successResponse } from "../utils/response.js";
import {
  acceptInviteSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "../validators/auth.validator.js";

export const authController = {
  async login(req: Request, res: Response) {
    const payload = loginSchema.parse(req.body);
    const result = await authService.login(payload.username, payload.password);
    return successResponse(res, result);
  },

  async me(req: Request, res: Response) {
    const result = await authService.me(BigInt(req.user!.userId));
    return successResponse(res, result);
  },

  async updateProfile(req: Request, res: Response) {
    if ("username" in req.body) {
      throw new AppError("username 不允许修改", 400, 400);
    }
    const payload = updateProfileSchema.parse(req.body);
    const result = await authService.updateProfile(BigInt(req.user!.userId), payload);
    return successResponse(res, result);
  },

  async acceptInvite(req: Request, res: Response) {
    const payload = acceptInviteSchema.parse(req.body);
    const result = await authService.acceptInvite(payload.token, payload.password);
    return successResponse(res, result);
  },

  async forgotPassword(req: Request, res: Response) {
    const payload = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(payload.email);
    return successResponse(res, result, "如果该邮箱已注册，我们已发送重置链接");
  },

  async resetPassword(req: Request, res: Response) {
    const payload = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(payload.token, payload.new_password);
    return successResponse(res, result);
  },
};
