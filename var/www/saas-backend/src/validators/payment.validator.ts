import { z } from "zod";

export const paymentStatusValues = ["pending", "confirmed", "failed", "cancelled"] as const;

export const paymentSchema = z.object({
  contract_id: z.coerce.bigint(),
  order_id: z.coerce.bigint().optional(),
  customer_id: z.coerce.bigint(),
  amount: z.coerce.number().min(0),
  payment_date: z.string().optional(),
  payment_method: z.string().max(50).optional(),
  status: z.enum(paymentStatusValues).default("pending"),
  remark: z.string().optional(),
});

export const paymentQuerySchema = z.object({
  customer_id: z.string().optional(),
  contract_id: z.string().optional(),
  status: z.string().optional(),
  payment_method: z.string().optional(),
  payment_date_start: z.string().optional(),
  payment_date_end: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.enum(["created_at", "updated_at", "amount", "payment_date"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
