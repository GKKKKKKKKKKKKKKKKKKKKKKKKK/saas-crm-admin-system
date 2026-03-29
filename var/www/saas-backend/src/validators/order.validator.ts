import { z } from "zod";

export const orderStatusValues = ["pending", "processing", "completed", "cancelled"] as const;

export const orderSchema = z.object({
  order_no: z.string().min(1).max(50),
  customer_id: z.coerce.bigint(),
  amount: z.coerce.number().min(0),
  status: z.enum(orderStatusValues).default("pending"),
  description: z.string().optional(),
});

export const orderQuerySchema = z.object({
  keyword: z.string().optional(),
  status: z.string().optional(),
  customer_id: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.enum(["created_at", "updated_at", "amount", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
