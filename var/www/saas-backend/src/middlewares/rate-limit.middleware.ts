import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/response.js";
import { logService } from "../services/log.service.js";

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  windowMs: number;
  max: number;
  message: string;
};

const bucketStore = new Map<string, Bucket>();

const getIp = (req: Request) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0]!.trim();
  }
  return req.ip || "unknown";
};

const buildBucketKey = (options: RateLimitOptions, req: Request) => {
  return `${options.key}:${getIp(req)}`;
};

export const createRateLimitMiddleware = (options: RateLimitOptions) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const now = Date.now();
    const bucketKey = buildBucketKey(options, req);
    const current = bucketStore.get(bucketKey);

    if (!current || current.resetAt <= now) {
      bucketStore.set(bucketKey, {
        count: 1,
        resetAt: now + options.windowMs,
      });
      next();
      return;
    }

    current.count += 1;

    if (current.count > options.max) {
      if (req.user?.userId) {
        void logService.createLog({
          userId: BigInt(req.user.userId),
          module: "security",
          action: "rate_limit",
          detail: `${options.key} limited ip=${getIp(req)}`,
        });
      }
      next(new AppError(options.message, 429, 429));
      return;
    }

    next();
  };
};
