import fs from "node:fs";
import type { Request, Response } from "express";
import { fileService } from "../services/file.service.js";
import { parseIdParam } from "../utils/request.js";
import { AppError, getPagination, paginatedResponse, successResponse } from "../utils/response.js";
import { fileListQuerySchema, fileUploadBodySchema } from "../validators/file.validator.js";

const encodeFilename = (filename: string) => encodeURIComponent(filename).replace(/['()]/g, escape).replace(/\*/g, "%2A");

export const fileController = {
  async upload(req: Request, res: Response) {
    if (!req.file) {
      throw new AppError("请选择要上传的文件", 400, 400);
    }

    const payload = fileUploadBodySchema.parse(req.body);
    const result = await fileService.createFile({
      uploadedFile: req.file,
      businessType: payload.businessType,
      businessId: payload.businessId,
      remark: payload.remark,
      usage: payload.usage,
      operatorId: BigInt(req.user!.userId),
      roleCode: req.user?.roleCode,
    });

    return successResponse(res, result);
  },

  async list(req: Request, res: Response) {
    const query = fileListQuerySchema.parse(req.query);
    const { page, pageSize } = getPagination(query);
    const result = await fileService.list({
      businessType: query.businessType,
      businessId: query.businessId,
      page,
      pageSize,
    });
    return paginatedResponse(res, result.list, result.total, result.page, result.pageSize);
  },

  async detail(req: Request, res: Response) {
    const result = await fileService.detail(parseIdParam(req.params.id));
    return successResponse(res, result);
  },

  async download(req: Request, res: Response) {
    const result = await fileService.getDownloadFile(
      parseIdParam(req.params.id),
      BigInt(req.user!.userId),
      req.user?.roleCode,
    );

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeFilename(result.filename)}`);

    return new Promise<void>((resolve, reject) => {
      const stream = fs.createReadStream(result.absolutePath);
      stream.on("error", reject);
      res.on("close", resolve);
      stream.pipe(res);
    });
  },

  async remove(req: Request, res: Response) {
    await fileService.remove(parseIdParam(req.params.id), BigInt(req.user!.userId), req.user?.roleCode);
    return successResponse(res, null);
  },
};
