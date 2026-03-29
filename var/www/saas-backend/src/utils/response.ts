import type { Response } from "express";
import { serializeData } from "./serializer.js";

export class AppError extends Error {
  statusCode: number;
  code: number;

  constructor(message: string, statusCode = 500, code = statusCode, options?: { cause?: unknown }) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export const successResponse = <T>(res: Response, data: T, message = "success") => {
  return res.json({
    code: 0,
    message,
    data: serializeData(data),
  });
};

export const paginatedResponse = <T>(
  res: Response,
  list: T[],
  total: number,
  page: number,
  pageSize: number,
) => {
  return successResponse(res, { list, total, page, pageSize });
};

export const errorResponse = <T>(res: Response, statusCode: number, code: number, message: string, data: T) => {
  return res.status(statusCode).json({
    code,
    message,
    data: serializeData(data),
  });
};

export const getPagination = (query: { page?: string; pageSize?: string }) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(query.pageSize) || 10, 1), 100);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
};
