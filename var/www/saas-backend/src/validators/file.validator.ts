import { z } from "zod";

export const fileUploadBodySchema = z.object({
  businessType: z.enum(["user", "customer", "order"]),
  businessId: z
    .string()
    .optional()
    .transform((value: string | undefined) => (value ? BigInt(value) : undefined)),
  remark: z.string().max(255).optional(),
  usage: z.enum(["avatar", "attachment"]).optional(),
});

export const fileListQuerySchema = z.object({
  businessType: z.enum(["user", "customer", "order"]).optional(),
  businessId: z
    .string()
    .optional()
    .transform((value: string | undefined) => (value ? BigInt(value) : undefined)),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});
