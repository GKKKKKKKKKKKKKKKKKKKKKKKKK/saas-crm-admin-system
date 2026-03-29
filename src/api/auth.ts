import request from '@/api/request'
import type { LoginPayload, LoginResponse, PermissionCode, UserProfile } from '@/types'

type BackendAuthUser = {
  id: number | string
  username: string
  email: string
  phone?: string | null
  mobile?: string | null
  name?: string
  department?: string | null
  position?: string | null
  status?: string
  role?: {
    id: number | string
    name: string
    code: string
  } | string
  permissions?: string[]
  avatar_url?: string | null
}

type BackendLoginResponse = {
  token: string
  user: BackendAuthUser
}

type AcceptInvitePayload = {
  token: string
  password: string
}

type ForgotPasswordPayload = {
  email: string
}

type ResetPasswordPayload = {
  token: string
  new_password: string
}

type InviteOrResetLinkResponse = {
  invite_link?: string
  reset_link?: string
  expires_at?: string
}

const allPermissions: PermissionCode[] = [
  'dashboard.view',
  'customers.read',
  'customers.create',
  'customers.update',
  'customers.delete',
  'customers.export',
  'customers.batch',
  'orders.read',
  'orders.create',
  'orders.update',
  'orders.delete',
  'orders.status',
  'orders.export',
  'orders.batch',
  'users.read',
  'users.create',
  'users.update',
  'users.delete',
  'users.export',
  'users.batch',
  'roles.read',
  'roles.create',
  'roles.update',
  'roles.delete',
  'roles.export',
  'roles.batch',
  'profile.read',
  'profile.update',
  'permissionPreset.read',
  'permissionPreset.create',
  'permissionPreset.update',
  'permissionPreset.delete',
  'customer_followups.view',
  'customer_followups.read',
  'customer_followups.create',
  'customer_followups.update',
  'customer_followups.delete',
  'contracts.view',
  'contracts.read',
  'contracts.create',
  'contracts.update',
  'contracts.delete',
  'payments.view',
  'payments.read',
  'payments.create',
  'payments.update',
  'payments.delete',
  'notifications.view',
  'notifications.read',
]


const normalizeAvatar = (avatar?: string | null): string => {
  if (!avatar) {
    return ''
  }
  const normalized = avatar.replace(/\\/g, '/')
  if (normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('/')) {
    return normalized
  }
  const uploadIndex = normalized.indexOf('/uploads/')
  if (uploadIndex >= 0) {
    return normalized.slice(uploadIndex)
  }
  if (normalized.startsWith('uploads/')) {
    return `/${normalized}`
  }
  return `/${normalized}`
}

const mapPermissions = (permissions?: string[], roleCode?: string): PermissionCode[] => {
  const mapper: Record<string, PermissionCode> = {
    'dashboard.view': 'dashboard.view',
    'customers.read': 'customers.read',
    'customers.create': 'customers.create',
    'customers.update': 'customers.update',
    'customers.delete': 'customers.delete',
    'customers.export': 'customers.export',
    'customers.batch': 'customers.batch',
    'customer.read': 'customers.read',
    'customer.create': 'customers.create',
    'customer.update': 'customers.update',
    'customer.delete': 'customers.delete',
    'orders.read': 'orders.read',
    'orders.create': 'orders.create',
    'orders.update': 'orders.update',
    'orders.delete': 'orders.delete',
    'orders.status': 'orders.status',
    'orders.export': 'orders.export',
    'orders.batch': 'orders.batch',
    'order.read': 'orders.read',
    'order.create': 'orders.create',
    'order.update': 'orders.update',
    'order.delete': 'orders.delete',
    'order.status': 'orders.status',
    'users.read': 'users.read',
    'users.create': 'users.create',
    'users.update': 'users.update',
    'users.delete': 'users.delete',
    'users.export': 'users.export',
    'users.batch': 'users.batch',
    'user.read': 'users.read',
    'user.create': 'users.create',
    'user.update': 'users.update',
    'user.delete': 'users.delete',
    'roles.read': 'roles.read',
    'roles.create': 'roles.create',
    'roles.update': 'roles.update',
    'roles.delete': 'roles.delete',
    'roles.export': 'roles.export',
    'roles.batch': 'roles.batch',
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
    'customer_followups.view': 'customer_followups.view',
    'customer_followups.read': 'customer_followups.view',
    'customer_followups.create': 'customer_followups.create',
    'customer_followups.update': 'customer_followups.update',
    'customer_followups.delete': 'customer_followups.delete',
    'contracts.view': 'contracts.view',
    'contracts.read': 'contracts.view',
    'contracts.create': 'contracts.create',
    'contracts.update': 'contracts.update',
    'contracts.delete': 'contracts.delete',
    'payments.view': 'payments.view',
    'payments.read': 'payments.view',
    'payments.create': 'payments.create',
    'payments.update': 'payments.update',
    'payments.delete': 'payments.delete',
    'notifications.view': 'notifications.view',
    'notifications.read': 'notifications.view',
    'notification.view': 'notifications.view',
    'notification.read': 'notifications.view',
  }

  const normalized = (permissions ?? []).map((item) => mapper[item]).filter(Boolean) as PermissionCode[]
  const deduped = Array.from(new Set(normalized))

  if (roleCode === 'admin') {
    return allPermissions
  }

  return deduped
}

const mapUser = (user: BackendAuthUser): UserProfile => {
  const roleCode = typeof user.role === 'object' ? user.role?.code : undefined
  const roleName = typeof user.role === 'object' ? user.role?.name : (user.role ?? '')
  const permissions = mapPermissions(user.permissions, roleCode)
  return {
    id: Number(user.id),
    name: user.name ?? user.username,
    username: user.username,
    email: user.email,
    mobile: user.phone ?? user.mobile ?? '',
    role: roleName,
    avatar: normalizeAvatar(user.avatar_url),
    title: user.position ?? roleCode ?? '',
    department: user.department ?? '',
    position: user.position ?? '',
    permissions,
  }
}

export const loginApi = async (payload: LoginPayload): Promise<LoginResponse> => {
  const result = await request.post<never, BackendLoginResponse>('/auth/login', {
    username: payload.username,
    password: payload.password,
  })
  const user = mapUser(result.user)
  return {
    token: result.token,
    user,
    permissions: user.permissions,
  }
}

export const getProfileApi = async (): Promise<LoginResponse['user']> => {
  const result = await request.get<never, BackendAuthUser>('/auth/me')
  return mapUser(result)
}

type UpdateProfilePayload = {
  name: string
  email: string
  phone: string
  department?: string | null
  position?: string | null
}

export const updateProfileApi = async (id: number, payload: UpdateProfilePayload): Promise<LoginResponse['user']> => {
  const result = await request.put<never, BackendAuthUser>(`/users/${id}`, payload)
  return mapUser(result)
}

export const acceptInviteApi = async (payload: AcceptInvitePayload): Promise<boolean> => {
  await request.post<never, { success?: boolean }>('/auth/accept-invite', payload)
  return true
}

export const forgotPasswordApi = async (payload: ForgotPasswordPayload): Promise<InviteOrResetLinkResponse> => {
  return request.post<never, InviteOrResetLinkResponse>('/auth/forgot-password', payload)
}

export const resetPasswordApi = async (payload: ResetPasswordPayload): Promise<boolean> => {
  await request.post<never, { success?: boolean }>('/auth/reset-password', payload)
  return true
}
