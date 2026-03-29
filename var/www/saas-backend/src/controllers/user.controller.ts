import type { Request, Response } from "express";
import { userService } from "../services/user.service.js";
import { parseIdParam } from "../utils/request.js";
import { AppError, successResponse } from "../utils/response.js";
import { createUserSchema, updateUserSchema } from "../validators/user.validator.js";

export const userController = {
  async list(_req: Request, res: Response) {
    const data = await userService.list();
    return successResponse(res, data);
  },

  async create(req: Request, res: Response) {
    const payload = createUserSchema.parse(req.body);
    const data = await userService.create({ ...payload, operatorId: BigInt(req.user!.userId) });
    return successResponse(res, data);
  },

  async update(req: Request, res: Response) {
    if ("username" in req.body) {
      throw new AppError("username 不允许修改", 400, 400);
    }
    const payload = updateUserSchema.parse(req.body);
    const data = await userService.update(parseIdParam(req.params.id), { ...payload, operatorId: BigInt(req.user!.userId) });
    return successResponse(res, data);
  },

  async remove(req: Request, res: Response) {
    await userService.remove(parseIdParam(req.params.id), BigInt(req.user!.userId));
    return successResponse(res, null);
  },
};
