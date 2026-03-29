import request from '@/api/request'
import { formatDateTime } from '@/utils/datetime'
import type { CustomerFollowUpItem, PaginationResult } from '@/types'

type BackendCustomerFollowUpItem = {
  id: number | string
  customer_id: number | string
  follow_up_type: string
  content?: string | null
  result?: string | null
  next_follow_up_at?: string | null
  created_at?: string | null
  users?: {
    name?: string | null
    username?: string
  } | null
  customers?: {
    name?: string
  } | null
  creator_name?: string | null
  creatorName?: string | null
  createByName?: string | null
}

type BackendCustomerFollowUpPayload = {
  list?: BackendCustomerFollowUpItem[]
  total?: number
  current?: number
  page?: number
  pageSize?: number
}

const mapCustomerFollowUp = (item: BackendCustomerFollowUpItem): CustomerFollowUpItem => ({
  id: Number(item.id),
  customerId: Number(item.customer_id),
  customerName: item.customers?.name ?? '',
  followUpType: item.follow_up_type,
  content: item.content ?? '',
  result: item.result ?? '',
  nextFollowUpAt: formatDateTime(item.next_follow_up_at),
  createdBy: item.creator_name ?? item.creatorName ?? item.createByName ?? item.users?.name ?? item.users?.username ?? '',
  createdAt: formatDateTime(item.created_at),
})

const toPayload = (payload: Partial<CustomerFollowUpItem>) => ({
  customer_id: payload.customerId,
  follow_up_type: payload.followUpType,
  content: payload.content,
  result: payload.result,
  next_follow_up_at: payload.nextFollowUpAt || undefined,
})

export const getCustomerFollowUpsApi = async (params: Record<string, unknown>): Promise<PaginationResult<CustomerFollowUpItem>> => {
  const result = await request.get<never, BackendCustomerFollowUpPayload>('/customer-follow-ups', { params })
  return {
    list: (result.list ?? []).map(mapCustomerFollowUp),
    total: result.total ?? 0,
    current: (result.current as number | undefined) ?? (result.page ?? 1),
    pageSize: result.pageSize ?? 10,
  }
}

export const getCustomerFollowUpsByCustomerApi = async (customerId: number): Promise<CustomerFollowUpItem[]> => {
  const result = await request.get<never, BackendCustomerFollowUpItem[]>(`/customers/${customerId}/follow-ups`)
  return result.map(mapCustomerFollowUp)
}

export const createCustomerFollowUpApi = async (payload: Partial<CustomerFollowUpItem>): Promise<CustomerFollowUpItem> => {
  const result = await request.post<never, BackendCustomerFollowUpItem>('/customer-follow-ups', toPayload(payload))
  return mapCustomerFollowUp(result)
}

export const updateCustomerFollowUpApi = async (id: number, payload: Partial<CustomerFollowUpItem>): Promise<CustomerFollowUpItem> => {
  const result = await request.put<never, BackendCustomerFollowUpItem>(`/customer-follow-ups/${id}`, toPayload(payload))
  return mapCustomerFollowUp(result)
}

export const deleteCustomerFollowUpApi = async (id: number): Promise<boolean> => {
  await request.delete<never, null>(`/customer-follow-ups/${id}`)
  return true
}
