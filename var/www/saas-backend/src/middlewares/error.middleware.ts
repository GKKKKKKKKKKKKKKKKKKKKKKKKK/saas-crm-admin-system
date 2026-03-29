import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError, errorResponse } from "../utils/response.js";

const getCauseDetail = (cause: unknown, depth = 0): unknown => {
  if (depth >= 3) {
    return "[cause depth limit]";
  }
  const maybeCause = typeof cause === "object" && cause !== null ? cause as Record<string, unknown> : null;
  const nested = cause instanceof Error ? cause.cause : maybeCause?.cause;
  return {
    name: cause instanceof Error ? cause.name : (maybeCause?.name as string | undefined) ?? "UnknownError",
    message: cause instanceof Error ? cause.message : String(cause),
    code: maybeCause?.code,
    meta: maybeCause?.meta,
    stack: cause instanceof Error ? cause.stack : undefined,
    cause: nested !== undefined ? getCauseDetail(nested, depth + 1) : undefined,
  };
};

const getErrorDetail = (error: unknown) => {
  const maybeError = typeof error === "object" && error !== null ? error as Record<string, unknown> : null;
  const rawCause = error instanceof Error ? error.cause : maybeError?.cause;
  return {
    name: error instanceof Error ? error.name : (maybeError?.name as string | undefined) ?? "UnknownError",
    message: error instanceof Error ? error.message : String(error),
    code: maybeError?.code,
    meta: maybeError?.meta,
    stack: error instanceof Error ? error.stack : undefined,
    cause: rawCause !== undefined ? getCauseDetail(rawCause) : undefined,
  };
};

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError("资源不存在", 404, 404));
};

export const errorHandler = (error: unknown, req: Request, res: Response, _next: NextFunction) => {
  const detail = getErrorDetail(error);
  console.error("[errorHandler] request failed", {
    method: req.method,
    path: req.originalUrl,
    error: detail,
  });

  if (error instanceof ZodError) {
    return errorResponse(res, 400, 400, "参数错误", (error as any).flatten?.() ?? null);
  }

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      return errorResponse(res, 500, 500, "服务器异常", null);
    }
    return errorResponse(res, error.statusCode, error.code, error.message, null);
  }

  return errorResponse(res, 500, 500, "服务器异常", null);
};
