import request from '@/api/request'
import { formatDateTime } from '@/utils/datetime'
import type { CustomerItem, PaginationResult } from '@/types'

type BackendCustomerItem = {
  id: number | string
  name: string
  company_name?: string | null
  phone?: string | null
  email?: string | null
  status?: 'active' | 'inactive' | 'pending' | string
  created_at?: string | null
  remark?: string | null
  owner_user_id?: number | string | null
  users?: {
    username?: string
  } | null
}

type BackendCustomerPayload = {
  list?: BackendCustomerItem[]
  total?: number
  current?: number
  page?: number
  pageSize?: number
}

const mapCustomer = (item: BackendCustomerItem): CustomerItem => ({
  id: Number(item.id),
  name: item.name,
  company: item.company_name ?? '',
  phone: item.phone ?? '',
  email: item.email ?? '',
  status: item.status === 'active' || item.status === 'inactive' || item.status === 'pending' ? item.status : 'pending',
  createdAt: formatDateTime(item.created_at),
  owner: item.users?.username ?? '',
  remark: item.remark ?? '',
})

const toCustomerPayload = (payload: Partial<CustomerItem>) => ({
  name: payload.name,
  company_name: payload.company,
  phone: payload.phone,
  email: payload.email,
  status: payload.status,
  remark: payload.remark,
})

export const getCustomersApi = async (params: Record<string, unknown>): Promise<PaginationResult<CustomerItem>> => {
  const result = await request.get<never, BackendCustomerPayload>('/customers', { params })
  return {
    list: (result.list ?? []).map(mapCustomer),
    total: result.total ?? 0,
    current: (result.current as number | undefined) ?? (result.page ?? 1),
    pageSize: result.pageSize ?? 10,
  }
}

export const createCustomerApi = async (payload: Partial<CustomerItem>): Promise<CustomerItem> => {
  const result = await request.post<never, BackendCustomerItem>('/customers', toCustomerPayload(payload))
  return mapCustomer(result)
}

export const updateCustomerApi = async (id: number, payload: Partial<CustomerItem>): Promise<CustomerItem> => {
  const result = await request.put<never, BackendCustomerItem>(`/customers/${id}`, toCustomerPayload(payload))
  return mapCustomer(result)
}

export const deleteCustomerApi = async (id: number): Promise<boolean> => {
  await request.delete<never, null>(`/customers/${id}`)
  return true
}

export const getCustomerDetailApi = async (id: number): Promise<CustomerItem> => {
  const result = await request.get<never, BackendCustomerItem>(`/customers/${id}`)
  return mapCustomer(result)
}
