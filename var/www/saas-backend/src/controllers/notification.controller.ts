import type { Request, Response } from "express";
import { parseIdParam } from "../utils/request.js";
import { getPagination, paginatedResponse, successResponse } from "../utils/response.js";
import { notificationService } from "../services/notification.service.js";
import { notificationQuerySchema } from "../validators/notification.validator.js";

export const notificationController = {
  async list(req: Request, res: Response) {
    const query = notificationQuerySchema.parse(req.query);
    const { page, pageSize } = getPagination(query);
    const data = await notificationService.list({
      userId: BigInt(req.user!.userId),
      page,
      pageSize,
      is_read: query.is_read,
      type: query.type,
    });
    return paginatedResponse(res, data.list, data.total, data.page, data.pageSize);
  },

  async unreadCount(req: Request, res: Response) {
    const data = await notificationService.unreadCount(BigInt(req.user!.userId));
    return successResponse(res, data);
  },

  async readOne(req: Request, res: Response) {
    const data = await notificationService.markAsRead(parseIdParam(req.params.id), BigInt(req.user!.userId));
    return successResponse(res, data);
  },

  async readAll(req: Request, res: Response) {
    const data = await notificationService.markAllAsRead(BigInt(req.user!.userId));
    return successResponse(res, data);
  },
};
