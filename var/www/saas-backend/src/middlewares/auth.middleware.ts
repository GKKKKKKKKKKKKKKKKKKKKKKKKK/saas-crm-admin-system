// simplified for public showcase
import type { NextFunction, Request, Response } from "express";

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  req.user = {
    userId: "1",
    username: "demo-admin",
    roleCode: "showcase",
    permissions: ["dashboard.view", "customers.read", "orders.read", "users.read", "roles.read", "profile.read"],
    notice: "simplified for portfolio version",
  };
  next();
};
