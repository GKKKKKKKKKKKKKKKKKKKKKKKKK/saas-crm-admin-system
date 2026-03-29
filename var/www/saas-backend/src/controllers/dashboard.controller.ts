import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service.js";
import { successResponse } from "../utils/response.js";

export const dashboardController = {
  async summary(_req: Request, res: Response) {
    const data = await dashboardService.summary();
    return successResponse(res, data);
  },

  async charts(_req: Request, res: Response) {
    const data = await dashboardService.charts();
    return successResponse(res, data);
  },

  async recentOrders(req: Request, res: Response) {
    const limitRaw = Number(req.query.limit ?? 6);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.trunc(limitRaw), 1), 50) : 6;
    const data = await dashboardService.recentOrders(limit);
    return successResponse(res, data);
  },
};
