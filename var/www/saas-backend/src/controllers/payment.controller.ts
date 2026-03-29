import type { Request, Response } from "express";
import { paymentService } from "../services/payment.service.js";
import { parseIdParam } from "../utils/request.js";
import { getPagination, paginatedResponse, successResponse } from "../utils/response.js";
import { paymentQuerySchema, paymentSchema } from "../validators/payment.validator.js";

export const paymentController = {
  async list(req: Request, res: Response) {
    const query = paymentQuerySchema.parse(req.query);
    const { page, pageSize } = getPagination(query);
    const data = await paymentService.list({ ...query, page, pageSize });
    return paginatedResponse(res, data.list, data.total, data.page, data.pageSize);
  },

  async detail(req: Request, res: Response) {
    const data = await paymentService.detail(parseIdParam(req.params.id));
    return successResponse(res, data);
  },

  async create(req: Request, res: Response) {
    const payload = paymentSchema.parse(req.body);
    const data = await paymentService.create({ ...payload, operatorId: BigInt(req.user!.userId) });
    return successResponse(res, data);
  },

  async update(req: Request, res: Response) {
    const payload = paymentSchema.partial().parse(req.body);
    const data = await paymentService.update(parseIdParam(req.params.id), { ...payload, operatorId: BigInt(req.user!.userId) });
    return successResponse(res, data);
  },

  async remove(req: Request, res: Response) {
    await paymentService.remove(parseIdParam(req.params.id), BigInt(req.user!.userId));
    return successResponse(res, null);
  },
};
