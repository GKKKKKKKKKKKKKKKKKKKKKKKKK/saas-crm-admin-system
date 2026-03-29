// simplified for public showcase
import type { NextFunction, Request, Response } from "express";

export type UploadedFile = {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export const fileUploadSingle = (fieldName: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.file = {
      fieldname: fieldName,
      originalname: "public-showcase.txt",
      mimetype: "text/plain",
      size: 0,
      buffer: Buffer.from("simplified for portfolio version"),
    };
    next();
  };
};
