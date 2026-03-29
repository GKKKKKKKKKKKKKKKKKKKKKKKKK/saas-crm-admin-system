import request from '@/api/request'
import type { Permission } from '@/types/permissionPreset'

type BackendPermission = {
  id: number | string
  name?: string | null
  code: string
  module?: string | null
}

const mapPermission = (item: BackendPermission): Permission => ({
  id: Number(item.id),
  name: item.name ?? item.code,
  code: item.code,
  module: item.module ?? 'default',
})

export const getPermissionsApi = async (): Promise<Permission[]> => {
  const result = await request.get<never, BackendPermission[]>('/permissions')
  return result.map(mapPermission)
}
