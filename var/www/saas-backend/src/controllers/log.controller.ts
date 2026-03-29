import type { Request, Response } from "express";
import { logService } from "../services/log.service.js";
import { getPagination, paginatedResponse } from "../utils/response.js";

export const logController = {
  async list(req: Request, res: Response) {
    const { page, pageSize } = getPagination(req.query as { page?: string; pageSize?: string });
    const data = await logService.list(page, pageSize);
    return paginatedResponse(res, data.list, data.total, data.page, data.pageSize);
  },
};
