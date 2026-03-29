import { z } from "zod";

export const contractStatusValues = ["draft", "active", "expired", "terminated"] as const;

export const contractSchema = z.object({
  contract_no: z.string().min(1).max(50),
  customer_id: z.coerce.bigint(),
  order_id: z.coerce.bigint().optional(),
  title: z.string().max(200).optional(),
  amount: z.coerce.number().min(0),
  status: z.enum(contractStatusValues).default("draft"),
  sign_date: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  owner_user_id: z.coerce.bigint().optional(),
  remark: z.string().optional(),
});

export const contractQuerySchema = z.object({
  contract_no: z.string().optional(),
  customer_id: z.string().optional(),
  status: z.string().optional(),
  end_date_start: z.string().optional(),
  end_date_end: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.enum(["created_at", "updated_at", "amount", "end_date"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
