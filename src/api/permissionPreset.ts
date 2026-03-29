import request from '@/api/request'
import { formatDateTime } from '@/utils/datetime'
import type { PaginationResult } from '@/types'
import type { Permission, PermissionPreset, PermissionPresetListItem, PermissionPresetOption } from '@/types/permissionPreset'

type BackendPermission = {
  id: number | string
  name?: string | null
  code: string
  module?: string | null
}

type BackendPermissionPreset = {
  id: number | string
  name: string
  code: string
  description?: string | null
  permissions: BackendPermission[]
  createdAt?: string
  updatedAt?: string
  created_at?: string
  updated_at?: string
}

type BackendPermissionPresetListItem = {
  id: number | string
  name: string
  code: string
  description?: string | null
  permissionCount: number
  createdAt?: string
  updatedAt?: string
  created_at?: string
  updated_at?: string
}

type BackendListResponse = {
  list: BackendPermissionPresetListItem[]
  total: number
  page?: number
  current?: number
  pageSize: number
}

type UpsertPermissionPresetPayload = {
  name: string
  code: string
  description?: string
  permissionCodes: string[]
}

const mapPermission = (item: BackendPermission): Permission => ({
  id: Number(item.id),
  name: item.name ?? item.code,
  code: item.code,
  module: item.module ?? 'default',
})

const mapPreset = (item: BackendPermissionPreset): PermissionPreset => ({
  id: Number(item.id),
  name: item.name,
  code: item.code,
  description: item.description ?? undefined,
  permissions: item.permissions.map(mapPermission),
  permissionCodes: item.permissions.map((permission) => permission.code),
  permissionIds: item.permissions.map((permission) => Number(permission.id)),
  createdAt: formatDateTime(item.createdAt ?? item.created_at),
  updatedAt: formatDateTime(item.updatedAt ?? item.updated_at),
})

const mapListItem = (item: BackendPermissionPresetListItem): PermissionPresetListItem => ({
  id: Number(item.id),
  name: item.name,
  code: item.code,
  description: item.description ?? undefined,
  permissionCount: Number(item.permissionCount ?? 0),
  createdAt: formatDateTime(item.createdAt ?? item.created_at),
  updatedAt: formatDateTime(item.updatedAt ?? item.updated_at),
})

export const getPermissionPresetsApi = async (params: { current: number; pageSize: number; keyword?: string }): Promise<PaginationResult<PermissionPresetListItem>> => {
  const result = await request.get<never, BackendListResponse>('/permission-presets', { params })
  return {
    list: (result.list ?? []).map(mapListItem),
    total: result.total ?? 0,
    current: result.current ?? result.page ?? params.current,
    pageSize: result.pageSize ?? params.pageSize,
  }
}

export const getPermissionPresetDetailApi = async (id: number): Promise<PermissionPreset> => {
  const result = await request.get<never, BackendPermissionPreset>(`/permission-presets/${id}`)
  return mapPreset(result)
}

export const createPermissionPresetApi = async (payload: UpsertPermissionPresetPayload): Promise<PermissionPreset> => {
  const result = await request.post<never, BackendPermissionPreset>('/permission-presets', payload)
  return mapPreset(result)
}

export const updatePermissionPresetApi = async (id: number, payload: Partial<UpsertPermissionPresetPayload>): Promise<PermissionPreset> => {
  const result = await request.put<never, BackendPermissionPreset>(`/permission-presets/${id}`, payload)
  return mapPreset(result)
}

export const deletePermissionPresetApi = async (id: number): Promise<boolean> => {
  await request.delete<never, null>(`/permission-presets/${id}`)
  return true
}

export const getPermissionPresetOptionsApi = async (): Promise<PermissionPresetOption[]> => {
  return request.get<never, PermissionPresetOption[]>('/permission-presets/options')
}
