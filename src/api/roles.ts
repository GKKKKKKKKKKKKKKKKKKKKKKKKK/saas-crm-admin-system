import request from '@/api/request'
import { formatDateTime } from '@/utils/datetime'
import type { PaginationResult, PermissionCode, RoleItem } from '@/types'

type BackendPermissionEntry = {
  id?: number | string
  code: string
  name?: string
  module?: string
}

type BackendRolePermissionRelation = {
  permissions?: BackendPermissionEntry
}

type BackendRoleItem = {
  id: number | string
  name: string
  code: string
  description?: string | null
  created_at?: string | null
  permissions?: BackendPermissionEntry[]
  role_permissions?: BackendRolePermissionRelation[]
}

type BackendRoleListResponse =
  | BackendRoleItem[]
  | {
      list?: BackendRoleItem[]
      total?: number
      page?: number
      current?: number
      pageSize?: number
    }

const mapPermission = (code: string): PermissionCode => {
  const mapper: Record<string, PermissionCode> = {
    'dashboard.view': 'dashboard.view',
    'customer.read': 'customers.read',
    'customer.create': 'customers.create',
    'customer.update': 'customers.update',
    'customer.delete': 'customers.delete',
    'customer.export': 'customers.export',
    'customer.batch': 'customers.batch',
    'order.export': 'orders.export',
    'order.batch': 'orders.batch',
    'user.export': 'users.export',
    'user.batch': 'users.batch',
    'role.export': 'roles.export',
    'role.batch': 'roles.batch',
    'customers.export': 'customers.export',
    'customers.batch': 'customers.batch',
    'orders.export': 'orders.export',
    'orders.batch': 'orders.batch',
    'users.export': 'users.export',
    'users.batch': 'users.batch',
    'roles.export': 'roles.export',
    'roles.batch': 'roles.batch',
    'order.read': 'orders.read',
    'order.create': 'orders.create',
    'order.update': 'orders.update',
    'order.delete': 'orders.delete',
    'order.status': 'orders.status',
    'user.read': 'users.read',
    'user.create': 'users.create',
    'user.update': 'users.update',
    'user.delete': 'users.delete',
    'role.read': 'roles.read',
    'role.create': 'roles.create',
    'role.update': 'roles.update',
    'role.delete': 'roles.delete',
    'profile.read': 'profile.read',
    'profile.update': 'profile.update',
    'permissionPreset.read': 'permissionPreset.read',
    'permissionPreset.create': 'permissionPreset.create',
    'permissionPreset.update': 'permissionPreset.update',
    'permissionPreset.delete': 'permissionPreset.delete',
    'notifications.view': 'notifications.view',
    'notifications.read': 'notifications.view',
    'notification.view': 'notifications.view',
    'notification.read': 'notifications.view',
  }
  return mapper[code] ?? (code as PermissionCode)
}

const mapRole = (item: BackendRoleItem): RoleItem => {
  const permissionCodes = (item.permissions ?? item.role_permissions?.map((entry) => entry.permissions).filter(Boolean) ?? [])
    .map((entry) => mapPermission(entry?.code ?? ''))

  return {
    id: Number(item.id),
    name: item.name,
    code: item.code,
    description: item.description ?? '',
    permissions: Array.from(new Set(permissionCodes)),
    createdAt: formatDateTime(item.created_at),
  }
}

const toRolePayload = (payload: Partial<RoleItem>) => ({
  name: payload.name,
  code: payload.code,
  description: payload.description,
  permissionCodes: payload.permissions,
})

export const getRolesApi = async (params: Record<string, unknown>): Promise<PaginationResult<RoleItem>> => {
  const result = await request.get<never, BackendRoleListResponse>('/roles', { params })

  if (Array.isArray(result)) {
    const mapped = result.map(mapRole)
    const page = Number((params.page as number | undefined) ?? (params.current as number | undefined) ?? 1)
    const pageSize = Number((params.pageSize as number | undefined) ?? 10)
    const start = (page - 1) * pageSize
    return {
      list: mapped.slice(start, start + pageSize),
      total: mapped.length,
      current: page,
      pageSize,
    }
  }

  return {
    list: (result.list ?? []).map(mapRole),
    total: result.total ?? (result.list?.length ?? 0),
    current: result.current ?? result.page ?? 1,
    pageSize: result.pageSize ?? Number((params.pageSize as number | undefined) ?? 10),
  }
}

export const createRoleApi = async (payload: Partial<RoleItem>): Promise<RoleItem> => {
  const result = await request.post<never, BackendRoleItem>('/roles', toRolePayload(payload))
  return mapRole(result)
}

export const updateRoleApi = async (id: number, payload: Partial<RoleItem>): Promise<RoleItem> => {
  const result = await request.put<never, BackendRoleItem>(`/roles/${id}`, toRolePayload(payload))
  return mapRole(result)
}

export const deleteRoleApi = async (id: number): Promise<boolean> => {
  await request.delete<never, null>(`/roles/${id}`)
  return true
}
