import { z } from "zod";

const phoneRegex = /^1[3-9]\d{9}$/;

export const customerSchema = z.object({
  name: z.string().min(1).max(100),
  company_name: z.string().max(100).optional(),
  phone: z.string().regex(phoneRegex, "手机号格式不正确").optional().or(z.literal("")),
  email: z.email().optional().or(z.literal("")),
  status: z.string().max(20).default("potential"),
  remark: z.string().optional(),
  owner_user_id: z.coerce.bigint().optional(),
});

export const customerQuerySchema = z.object({
  keyword: z.string().optional(),
  status: z.string().optional(),
  owner_user_id: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.enum(["created_at", "updated_at", "name", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
