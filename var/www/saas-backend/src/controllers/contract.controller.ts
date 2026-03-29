import type { Request, Response } from "express";
import { contractService } from "../services/contract.service.js";
import { parseIdParam } from "../utils/request.js";
import { getPagination, paginatedResponse, successResponse } from "../utils/response.js";
import { contractQuerySchema, contractSchema } from "../validators/contract.validator.js";

export const contractController = {
  async list(req: Request, res: Response) {
    const query = contractQuerySchema.parse(req.query);
    const { page, pageSize } = getPagination(query);
    const data = await contractService.list({ ...query, page, pageSize });
    return paginatedResponse(res, data.list, data.total, data.page, data.pageSize);
  },

  async detail(req: Request, res: Response) {
    const data = await contractService.detail(parseIdParam(req.params.id));
    return successResponse(res, data);
  },

  async create(req: Request, res: Response) {
    const payload = contractSchema.parse(req.body);
    const data = await contractService.create({ ...payload, operatorId: BigInt(req.user!.userId) });
    return successResponse(res, data);
  },

  async update(req: Request, res: Response) {
    const payload = contractSchema.partial().parse(req.body);
    const data = await contractService.update(parseIdParam(req.params.id), { ...payload, operatorId: BigInt(req.user!.userId) });
    return successResponse(res, data);
  },

  async remove(req: Request, res: Response) {
    await contractService.remove(parseIdParam(req.params.id), BigInt(req.user!.userId));
    return successResponse(res, null);
  },
};
