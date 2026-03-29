import { z } from "zod";

export const customerFollowUpSchema = z.object({
  customer_id: z.coerce.bigint(),
  follow_up_type: z.string().min(1).max(50),
  content: z.string().optional(),
  result: z.string().optional(),
  next_follow_up_at: z.string().optional(),
});

export const customerFollowUpQuerySchema = z.object({
  customer_id: z.string().optional(),
  follow_up_type: z.string().optional(),
  next_follow_up_at_start: z.string().optional(),
  next_follow_up_at_end: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.enum(["created_at", "updated_at", "next_follow_up_at"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
