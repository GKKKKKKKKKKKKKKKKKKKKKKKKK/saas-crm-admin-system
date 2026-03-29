import type { Request, Response } from "express";
import { orderService } from "../services/order.service.js";
import { parseIdParam } from "../utils/request.js";
import { getPagination, paginatedResponse, successResponse } from "../utils/response.js";
import { orderQuerySchema, orderSchema } from "../validators/order.validator.js";

export const orderController = {
  async list(req: Request, res: Response) {
    const query = orderQuerySchema.parse(req.query);
    const { page, pageSize } = getPagination(query);
    const data = await orderService.list({ ...query, page, pageSize });
    return paginatedResponse(res, data.list, data.total, data.page, data.pageSize);
  },

  async detail(req: Request, res: Response) {
    const data = await orderService.detail(parseIdParam(req.params.id));
    return successResponse(res, data);
  },

  async create(req: Request, res: Response) {
    const payload = orderSchema.parse(req.body);
    const data = await orderService.create({ ...payload, operatorId: BigInt(req.user!.userId) });
    return successResponse(res, data);
  },

  async update(req: Request, res: Response) {
    const payload = orderSchema.partial().parse(req.body);
    const data = await orderService.update(parseIdParam(req.params.id), { ...payload, operatorId: BigInt(req.user!.userId) });
    return successResponse(res, data);
  },

  async remove(req: Request, res: Response) {
    await orderService.remove(parseIdParam(req.params.id), BigInt(req.user!.userId));
    return successResponse(res, null);
  },
};
