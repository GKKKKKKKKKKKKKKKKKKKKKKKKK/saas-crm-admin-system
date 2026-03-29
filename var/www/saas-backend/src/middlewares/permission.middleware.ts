// simplified for public showcase
import type { NextFunction, Request, Response } from "express";

export const requirePermission = (_permission: string) => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
};

export const requireAnyPermission = (_permissions: string[]) => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
};
