import { AppError } from "./response.js";

export const parseIdParam = (value: string | string[] | undefined) => {
  const normalized = Array.isArray(value) ? value[0] : value;
  if (!normalized) {
    throw new AppError("参数错误", 400, 400);
  }
  return BigInt(normalized);
};
