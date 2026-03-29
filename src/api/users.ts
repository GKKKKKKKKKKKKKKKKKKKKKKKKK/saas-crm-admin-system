import request from '@/api/request'
import { formatDateTime } from '@/utils/datetime'
import type { PaginationResult, SystemUser } from '@/types'

type BackendUserItem = {
  id: number | string
  name?: string
  username: string
  email: string
  phone?: string | null
  department?: string | null
  position?: string | null
  status?: 'active' | 'disabled' | string
  role_id?: number | string
  created_at?: string | null
}

type BackendRole = {
  id: number | string
  code?: string
  name?: string
}

type BackendUserWithRole = BackendUserItem & {
  roles?: BackendRole | null
}

type BackendUserListResponse =
  | BackendUserWithRole[]
  | {
      list?: BackendUserWithRole[]
      total?: number
      page?: number
      current?: number
      pageSize?: number
    }


type InviteUserPayload = {
  email: string
  role_id: number
}

type InviteUserResponse = {
  invite_link: string
  expires_at?: string
}

type UserQueryParams = {
  keyword?: string
  status?: boolean
  roleId?: number
  createdAtStart?: string
  createdAtEnd?: string
  page?: number
  current?: number
  pageSize?: number
}

const mapUser = (item: BackendUserWithRole): SystemUser => ({
  id: Number(item.id),
  name: item.name ?? item.username,
  username: item.username,
  email: item.email,
  mobile: item.phone ?? '',
  department: item.department ?? '',
  position: item.position ?? '',
  status: item.status === 'active',
  roleIds: item.roles?.id !== undefined ? [Number(item.roles.id)] : item.role_id !== undefined ? [Number(item.role_id)] : [],
  createdAt: formatDateTime(item.created_at),
})

const toCreateUserPayload = (payload: Partial<SystemUser>) => ({
  username: payload.username,
  name: payload.name,
  email: payload.email,
  phone: payload.mobile,
  department: payload.department,
  position: payload.position,
  roleId: payload.roleIds?.[0],
  status: payload.status === false ? 'disabled' : 'active',
})

const toUpdateUserPayload = (payload: Partial<SystemUser>) => ({
  name: payload.name,
  email: payload.email,
  phone: payload.mobile,
  department: payload.department,
  position: payload.position,
  roleId: payload.roleIds?.[0],
  status: payload.status === false ? 'disabled' : 'active',
})

const toDateValue = (value?: string | null) => {
  if (!value) {
    return null
  }
  const ts = new Date(value).getTime()
  if (Number.isNaN(ts)) {
    return null
  }
  return ts
}

const filterUsers = (list: BackendUserWithRole[], params: UserQueryParams) => {
  const keyword = String(params.keyword ?? '').trim().toLowerCase()
  const createdAtStart = toDateValue(params.createdAtStart)
  const createdAtEnd = toDateValue(params.createdAtEnd)

  return list.filter((item) => {
    if (keyword) {
      const name = (item.name ?? '').toLowerCase()
      const username = (item.username ?? '').toLowerCase()
      const email = (item.email ?? '').toLowerCase()
      const matched = [name, username, email].some((value) => value.includes(keyword))
      if (!matched) {
        return false
      }
    }

    if (typeof params.status === 'boolean') {
      const active = item.status === 'active'
      if (active !== params.status) {
        return false
      }
    }

    if (params.roleId !== undefined) {
      const roleId = item.roles?.id !== undefined ? Number(item.roles.id) : item.role_id !== undefined ? Number(item.role_id) : undefined
      if (roleId !== params.roleId) {
        return false
      }
    }

    if (createdAtStart !== null || createdAtEnd !== null) {
      const createdAt = toDateValue(item.created_at)
      if (createdAt === null) {
        return false
      }
      if (createdAtStart !== null && createdAt < createdAtStart) {
        return false
      }
      if (createdAtEnd !== null && createdAt > createdAtEnd) {
        return false
      }
    }

    return true
  })
}

export const getUsersApi = async (params: Record<string, unknown>): Promise<PaginationResult<SystemUser>> => {
  const result = await request.get<never, BackendUserListResponse>('/users', { params })
  const query = params as UserQueryParams

  if (Array.isArray(result)) {
    const filtered = filterUsers(result, query)
    const mapped = filtered.map(mapUser)
    const page = Number(query.page ?? query.current ?? 1)
    const pageSize = Number(query.pageSize ?? 10)
    const safePage = page > 0 ? page : 1
    const safePageSize = pageSize > 0 ? pageSize : 10
    const start = (safePage - 1) * safePageSize
    return {
      list: mapped.slice(start, start + safePageSize),
      total: mapped.length,
      current: safePage,
      pageSize: safePageSize,
    }
  }

  return {
    list: (result.list ?? []).map(mapUser),
    total: result.total ?? (result.list?.length ?? 0),
    current: result.current ?? result.page ?? 1,
    pageSize: result.pageSize ?? Number((params.pageSize as number | undefined) ?? 10),
  }
}

export const createUserApi = async (payload: Partial<SystemUser>): Promise<SystemUser> => {
  const result = await request.post<never, BackendUserWithRole>('/users', toCreateUserPayload(payload))
  return mapUser(result)
}

export const updateUserApi = async (id: number, payload: Partial<SystemUser>): Promise<SystemUser> => {
  const result = await request.put<never, BackendUserWithRole>(`/users/${id}`, toUpdateUserPayload(payload))
  return mapUser(result)
}

export const deleteUserApi = async (id: number): Promise<boolean> => {
  await request.delete<never, null>(`/users/${id}`)
  return true
}

export const inviteUserApi = async (payload: InviteUserPayload): Promise<InviteUserResponse> => {
  return request.post<never, InviteUserResponse>('/admin/invite-user', payload)
}
