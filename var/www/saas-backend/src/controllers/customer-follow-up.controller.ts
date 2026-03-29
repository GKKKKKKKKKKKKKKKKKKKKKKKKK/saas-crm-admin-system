import type { Request, Response } from "express";
import { customerFollowUpService } from "../services/customer-follow-up.service.js";
import { parseIdParam } from "../utils/request.js";
import { getPagination, paginatedResponse, successResponse } from "../utils/response.js";
import { customerFollowUpQuerySchema, customerFollowUpSchema } from "../validators/customer-follow-up.validator.js";

export const customerFollowUpController = {
  async list(req: Request, res: Response) {
    const query = customerFollowUpQuerySchema.parse(req.query);
    const { page, pageSize } = getPagination(query);
    const data = await customerFollowUpService.list({ ...query, page, pageSize });
    return paginatedResponse(res, data.list, data.total, data.page, data.pageSize);
  },

  async timelineByCustomer(req: Request, res: Response) {
    const data = await customerFollowUpService.timelineByCustomer(parseIdParam(req.params.id));
    return successResponse(res, data);
  },

  async create(req: Request, res: Response) {
    const payload = customerFollowUpSchema.parse(req.body);
    const data = await customerFollowUpService.create({ ...payload, operatorId: BigInt(req.user!.userId) });
    return successResponse(res, data);
  },

  async update(req: Request, res: Response) {
    const payload = customerFollowUpSchema.partial().parse(req.body);
    const data = await customerFollowUpService.update(parseIdParam(req.params.id), { ...payload, operatorId: BigInt(req.user!.userId) });
    return successResponse(res, data);
  },

  async remove(req: Request, res: Response) {
    await customerFollowUpService.remove(parseIdParam(req.params.id), BigInt(req.user!.userId));
    return successResponse(res, null);
  },
};
