import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { successResponse } from "../utils/response.js";
import { inviteUserSchema } from "../validators/auth.validator.js";

export const adminController = {
  async inviteUser(req: Request, res: Response) {
    const payload = inviteUserSchema.parse(req.body);
    const result = await authService.inviteUser({
      email: payload.email,
      roleId: payload.role_id,
      invitedBy: BigInt(req.user!.userId),
    });
    return successResponse(res, result);
  },
};
