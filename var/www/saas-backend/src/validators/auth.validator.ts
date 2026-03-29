import { z } from "zod";

const phoneRegex = /^1[3-9]\d{9}$/;

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
});

export const updateProfileSchema = z
  .object({
    name: z.string().min(2, "姓名至少 2 个字符").max(50).optional(),
    email: z.email().optional(),
    phone: z.string().regex(phoneRegex, "手机号格式不正确").optional().or(z.literal("")),
    department: z.string().optional().nullable(),
    position: z.string().optional().nullable(),
  })
  .refine((value: Record<string, unknown>) => Object.keys(value).length > 0, {
    message: "至少提供一个可更新字段",
  });

export const acceptInviteSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(6).max(50),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32),
  new_password: z.string().min(6).max(50),
});

export const inviteUserSchema = z.object({
  email: z.email(),
  role_id: z.coerce.bigint(),
});
