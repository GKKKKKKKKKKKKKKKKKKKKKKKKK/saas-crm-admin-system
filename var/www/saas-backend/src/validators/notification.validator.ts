import { z } from "zod";

export const notificationTypeValues = ["system", "order", "customer", "contract", "followup", "payment"] as const;
export const notificationLevelValues = ["info", "success", "warning", "error"] as const;

export const notificationQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  is_read: z.enum(["0", "1"]).optional(),
  type: z.enum(notificationTypeValues).optional(),
});

export const createNotificationSchema = z.object({
  type: z.enum(notificationTypeValues),
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1),
  level: z.enum(notificationLevelValues).default("info"),
  recipient_user_id: z.coerce.bigint(),
  sender_user_id: z.coerce.bigint().optional(),
  business_type: z.string().trim().max(50).optional(),
  business_id: z.coerce.bigint().optional(),
});
