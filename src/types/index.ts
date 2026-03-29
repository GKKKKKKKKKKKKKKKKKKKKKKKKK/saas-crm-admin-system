import type { ReactNode } from 'react'

export type PermissionCode =
  | 'dashboard.view'
  | 'customers.read'
  | 'customers.create'
  | 'customers.update'
  | 'customers.delete'
  | 'customers.export'
  | 'customers.batch'
  | 'orders.read'
  | 'orders.create'
  | 'orders.update'
  | 'orders.delete'
  | 'orders.status'
  | 'orders.export'
  | 'orders.batch'
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'users.export'
  | 'users.batch'
  | 'roles.read'
  | 'roles.create'
  | 'roles.update'
  | 'roles.delete'
  | 'roles.export'
  | 'roles.batch'
  | 'profile.read'
  | 'profile.update'
  | 'permissionPreset.read'
  | 'permissionPreset.create'
  | 'permissionPreset.update'
  | 'permissionPreset.delete'
  | 'customer_followups.view'
  | 'customer_followups.read'
  | 'customer_followups.create'
  | 'customer_followups.update'
  | 'customer_followups.delete'
  | 'contracts.view'
  | 'contracts.read'
  | 'contracts.create'
  | 'contracts.update'
  | 'contracts.delete'
  | 'payments.view'
  | 'payments.read'
  | 'payments.create'
  | 'payments.update'
  | 'payments.delete'
  | 'notifications.view'
  | 'notifications.read'



export interface PermissionTreeRawNode {
  id?: number | string
  code: string
  name?: string
  label?: string
  module?: string
  children?: PermissionTreeRawNode[]
}

export interface PermissionTreeNode {
  key: string
  value: string
  title: string
  children?: PermissionTreeNode[]
}

export type PermissionDisplayMap = Record<string, string>

export interface UserProfile {
  id: number
  name: string
  username: string
  email: string
  mobile: string
  role: string
  avatar: string
  title?: string | null
  department?: string | null
  position?: string | null
  permissions: PermissionCode[]
}

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: UserProfile
  permissions: PermissionCode[]
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginationParams {
  current: number
  pageSize: number
}

export interface PaginationResult<T> {
  list: T[]
  total: number
  current: number
  pageSize: number
}

export interface CustomerItem {
  id: number
  name: string
  company: string
  phone: string
  email: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  owner: string
  remark: string
}

export interface OrderItem {
  id: number
  orderNo: string
  customerId: number
  customerName: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  createdAt: string
  product: string
  owner: string
}

export interface SystemUser {
  id: number
  name: string
  username: string
  email: string
  mobile: string
  department?: string | null
  position?: string | null
  status: boolean
  roleIds: number[]
  createdAt: string
}

export interface RoleItem {
  id: number
  name: string
  code: string
  description: string
  permissions: PermissionCode[]
  createdAt: string
}

export interface CustomerFollowUpItem {
  id: number
  customerId: number
  customerName: string
  followUpType: string
  content: string
  result: string
  nextFollowUpAt: string
  createdBy: string
  createdAt: string
}

export interface ContractItem {
  id: number
  contractNo: string
  customerId: number
  customerName: string
  orderId?: number
  orderNo: string
  title: string
  amount: number
  status: 'draft' | 'active' | 'expired' | 'terminated'
  signDate: string
  startDate: string
  endDate: string
  ownerUserId?: number
  ownerName: string
  creatorName: string
  remark: string
  createdAt: string
  totalPaidAmount?: number
  unpaidAmount?: number
  paymentProgress?: number
  paymentStatusText?: '未回款' | '部分回款' | '已回款'
}

export interface PaymentItem {
  id: number
  contractId: number
  contractNo: string
  orderId?: number
  orderNo: string
  customerId: number
  customerName: string
  amount: number
  paymentDate: string
  paymentMethod: string
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled' | 'unknown'
  remark: string
  createdBy: string
  createdAt: string
}

export interface DashboardStats {
  customerTotal: number
  orderTotal: number
  monthlyCustomers: number
  dealAmount: number
  trend: Array<{ month: string; amount: number; orders: number }>
  recentOrders: OrderItem[]
}

export interface MenuItemConfig {
  key: string
  label: string
  path: string
  icon?: ReactNode
  permission?: PermissionCode
  children?: MenuItemConfig[]
}

export interface SearchField {
  name: string
  label: string
  type?: 'input' | 'select' | 'dateRange' | 'numberRange'
  placeholder?: string
  options?: Array<{ label: string; value: string | number | boolean }>
}

export interface OperationLogItem {
  id: number
  actor: string
  module: 'customers' | 'orders' | 'users' | 'roles' | 'customer_follow_ups' | 'contracts' | 'payments' | 'notifications'
  action: 'delete' | 'batch_delete' | 'status_update' | 'export' | 'edit_save' | 'batch_status_update' | 'create' | 'update' | 'read' | 'read_all'
  target: string
  description: string
  createdAt: string
}
