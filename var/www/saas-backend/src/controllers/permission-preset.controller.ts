import type { Request, Response } from "express";
import { parseIdParam } from "../utils/request.js";
import { getPagination, successResponse } from "../utils/response.js";
import { permissionPresetService } from "../services/permission-preset.service.js";
import {
  createPermissionPresetSchema,
  listPermissionPresetQuerySchema,
  updatePermissionPresetSchema,
} from "../validators/permission-preset.validator.js";

export const permissionPresetController = {
  async list(req: Request, res: Response) {
    const query = listPermissionPresetQuerySchema.parse(req.query);
    const pagination = getPagination({
      page: query.page?.toString(),
      pageSize: query.pageSize?.toString(),
    });

    const data = await permissionPresetService.list({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: query.keyword,
    });

    return successResponse(res, data);
  },

  async detail(req: Request, res: Response) {
    const data = await permissionPresetService.detail(parseIdParam(req.params.id));
    return successResponse(res, data);
  },

  async options(_req: Request, res: Response) {
    const data = await permissionPresetService.options();
    return successResponse(res, data);
  },

  async create(req: Request, res: Response) {
    const payload = createPermissionPresetSchema.parse(req.body);
    const data = await permissionPresetService.create({
      ...payload,
      operatorId: BigInt(req.user!.userId),
    });
    return successResponse(res, data);
  },

  async update(req: Request, res: Response) {
    const payload = updatePermissionPresetSchema.parse(req.body);
    const data = await permissionPresetService.update(parseIdParam(req.params.id), {
      ...payload,
      operatorId: BigInt(req.user!.userId),
    });
    return successResponse(res, data);
  },

  async remove(req: Request, res: Response) {
    await permissionPresetService.remove(parseIdParam(req.params.id), BigInt(req.user!.userId));
    return successResponse(res, null);
  },
};
