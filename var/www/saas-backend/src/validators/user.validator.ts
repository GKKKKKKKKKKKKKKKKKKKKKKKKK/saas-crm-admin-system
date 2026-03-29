import { z } from "zod";

const phoneRegex = /^1[3-9]\d{9}$/;

export const createUserSchema = z.object({
  name: z.string().min(2, "姓名至少 2 个字符").max(50),
  username: z.string().min(2, "用户名至少 2 个字符").max(50),
  email: z.email(),
  phone: z.string().regex(phoneRegex, "手机号格式不正确").optional().or(z.literal("")),
  department: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  password: z.string().min(6).max(50),
  roleId: z.coerce.bigint(),
  status: z.enum(["active", "disabled"]).default("active"),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "姓名至少 2 个字符").max(50).optional(),
  email: z.email().optional(),
  phone: z.string().regex(phoneRegex, "手机号格式不正确").optional().or(z.literal("")),
  department: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  roleId: z.coerce.bigint().optional(),
  status: z.enum(["active", "disabled"]).optional(),
  password: z.string().min(6).max(50).optional(),
});
