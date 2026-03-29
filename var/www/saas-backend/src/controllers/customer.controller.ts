import type { Request, Response } from "express";
import { customerService } from "../services/customer.service.js";
import { parseIdParam } from "../utils/request.js";
import { getPagination, paginatedResponse, successResponse } from "../utils/response.js";
import { customerQuerySchema, customerSchema } from "../validators/customer.validator.js";

export const customerController = {
  async list(req: Request, res: Response) {
    const query = customerQuerySchema.parse(req.query);
    const { page, pageSize } = getPagination(query);
    const data = await customerService.list({ ...query, page, pageSize });
    return paginatedResponse(res, data.list, data.total, data.page, data.pageSize);
  },

  async detail(req: Request, res: Response) {
    const data = await customerService.detail(parseIdParam(req.params.id));
    return successResponse(res, data);
  },

  async create(req: Request, res: Response) {
    const payload = customerSchema.parse(req.body);
    const data = await customerService.create({ ...payload, operatorId: BigInt(req.user!.userId) });
    return successResponse(res, data);
  },

  async update(req: Request, res: Response) {
    const payload = customerSchema.partial().parse(req.body);
    const data = await customerService.update(parseIdParam(req.params.id), { ...payload, operatorId: BigInt(req.user!.userId) });
    return successResponse(res, data);
  },

  async remove(req: Request, res: Response) {
    await customerService.remove(parseIdParam(req.params.id), BigInt(req.user!.userId));
    return successResponse(res, null);
  },
};
