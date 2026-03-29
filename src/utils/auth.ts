import type { PermissionCode } from '@/types'

export const hasPermission = (permissions: PermissionCode[], code?: PermissionCode) => {
  if (!code) return true
  return permissions.includes(code)
}
