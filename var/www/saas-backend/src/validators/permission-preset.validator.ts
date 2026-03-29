import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  keyword: z.string().trim().max(100).optional(),
});

const upsertPermissionPresetSchemaBase = z.object({
  name: z.string().trim().min(1).max(100),
  code: z.string().trim().min(1).max(100),
  description: z.string().trim().max(255).optional().or(z.literal("")),
  permissionIds: z.array(z.coerce.bigint()).min(1).optional(),
  permissionCodes: z.array(z.string().trim().min(1)).min(1).optional(),
});

export const listPermissionPresetQuerySchema = paginationSchema;

export const createPermissionPresetSchema = upsertPermissionPresetSchemaBase.superRefine((value: any, ctx: any) => {
  const hasIds = Array.isArray(value.permissionIds);
  const hasCodes = Array.isArray(value.permissionCodes);

  if (!hasIds && !hasCodes) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "permissionIds 或 permissionCodes 至少提供一个",
      path: ["permissionIds"],
    });
  }

  if (hasIds && value.permissionIds && value.permissionIds.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "permissionIds 不能为空",
      path: ["permissionIds"],
    });
  }

  if (hasCodes && value.permissionCodes && value.permissionCodes.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "permissionCodes 不能为空",
      path: ["permissionCodes"],
    });
  }
});

export const updatePermissionPresetSchema = upsertPermissionPresetSchemaBase.partial().superRefine((value: any, ctx: any) => {
  if (Object.keys(value).length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "至少提供一个更新字段",
      path: ["name"],
    });
  }

  const hasIds = Array.isArray(value.permissionIds);
  const hasCodes = Array.isArray(value.permissionCodes);
  if (hasIds && value.permissionIds && value.permissionIds.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "permissionIds 不能为空",
      path: ["permissionIds"],
    });
  }

  if (hasCodes && value.permissionCodes && value.permissionCodes.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "permissionCodes 不能为空",
      path: ["permissionCodes"],
    });
  }
});
