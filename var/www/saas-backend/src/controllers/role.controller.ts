import type { Request, Response } from "express";
import { z } from "zod";
import { roleService } from "../services/role.service.js";
import { parseIdParam } from "../utils/request.js";
import { successResponse } from "../utils/response.js";

const roleSchemaBase = z.object({
  name: z.string().min(1).max(50),
  code: z.string().min(1).max(50),
  description: z.string().max(255).optional(),
  permissionIds: z.array(z.coerce.bigint()).optional(),
  permissionCodes: z.array(z.string().trim().min(1)).optional(),
});

const roleSchema = roleSchemaBase.superRefine((value: any, ctx: any) => {
  if (value.permissionIds && value.permissionCodes) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "permissionIds 与 permissionCodes 不能同时传递",
      path: ["permissionIds"],
    });
  }
});

const roleUpdateSchema = roleSchemaBase.partial().superRefine((value: any, ctx: any) => {
  if (value.permissionIds && value.permissionCodes) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "permissionIds 与 permissionCodes 不能同时传递",
      path: ["permissionIds"],
    });
  }
});

export const roleController = {
  async list(_req: Request, res: Response) {
    const data = await roleService.list();
    return successResponse(res, data);
  },

  async permissions(_req: Request, res: Response) {
    const data = await roleService.permissions();
    return successResponse(res, data);
  },

  async create(req: Request, res: Response) {
    const payload = roleSchema.parse(req.body);
    const data = await roleService.create({ ...payload, operatorId: BigInt(req.user!.userId) });
    return successResponse(res, data);
  },

  async update(req: Request, res: Response) {
    const payload = roleUpdateSchema.parse(req.body);
    const data = await roleService.update(parseIdParam(req.params.id), { ...payload, operatorId: BigInt(req.user!.userId) });
    return successResponse(res, data);
  },

  async remove(req: Request, res: Response) {
    await roleService.remove(parseIdParam(req.params.id), BigInt(req.user!.userId));
    return successResponse(res, null);
  },
};
