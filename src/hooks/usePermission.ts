// simplified for public showcase
import type { PermissionCode } from '@/types'

export const usePermission = (_code?: PermissionCode | PermissionCode[]) => {
  return true
}

export const usePermissionGuard = () => {
  const can = (_code?: PermissionCode | PermissionCode[]) => {
    return true
  }

  return { can }
}
