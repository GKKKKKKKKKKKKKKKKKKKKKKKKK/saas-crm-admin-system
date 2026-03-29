import request from '@/api/request'
import { formatDateTime } from '@/utils/datetime'
import type { OrderItem, PaginationResult } from '@/types'

type BackendOrderItem = {
  id: number | string
  order_no: string
  customer_id: number | string
  amount: number | string
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | string
  description?: string | null
  created_at?: string | null
  customers?: {
    id: number | string
    name: string
  } | null
  users?: {
    username?: string
  } | null
}

type BackendOrderPayload = {
  list?: BackendOrderItem[]
  total?: number
  current?: number
  page?: number
  pageSize?: number
}

const toNumber = (value: number | string) => (typeof value === 'number' ? value : Number(value))

const mapOrder = (item: BackendOrderItem): OrderItem => ({
  id: Number(item.id),
  orderNo: item.order_no,
  customerId: Number(item.customer_id),
  customerName: item.customers?.name ?? '',
  amount: toNumber(item.amount),
  status: item.status === 'pending' || item.status === 'processing' || item.status === 'completed' || item.status === 'cancelled' ? item.status : 'pending',
  createdAt: formatDateTime(item.created_at),
  product: item.description ?? '',
  owner: item.users?.username ?? '',
})

const toOrderPayload = (payload: Partial<OrderItem>) => ({
  order_no: payload.orderNo,
  customer_id: payload.customerId,
  amount: payload.amount,
  status: payload.status,
  description: payload.product,
})

export const getOrdersApi = async (params: Record<string, unknown>): Promise<PaginationResult<OrderItem>> => {
  const result = await request.get<never, BackendOrderPayload>('/orders', { params })
  return {
    list: (result.list ?? []).map(mapOrder),
    total: result.total ?? 0,
    current: (result.current as number | undefined) ?? (result.page ?? 1),
    pageSize: result.pageSize ?? 10,
  }
}

export const createOrderApi = async (payload: Partial<OrderItem>): Promise<OrderItem> => {
  const result = await request.post<never, BackendOrderItem>('/orders', toOrderPayload(payload))
  return mapOrder(result)
}

export const updateOrderApi = async (id: number, payload: Partial<OrderItem>): Promise<OrderItem> => {
  const result = await request.put<never, BackendOrderItem>(`/orders/${id}`, toOrderPayload(payload))
  return mapOrder(result)
}

export const deleteOrderApi = async (id: number): Promise<boolean> => {
  await request.delete<never, null>(`/orders/${id}`)
  return true
}

export const updateOrderStatusApi = async (id: number, status: OrderItem['status']): Promise<OrderItem> => {
  const current = await request.get<never, BackendOrderItem>(`/orders/${id}`)
  const result = await request.put<never, BackendOrderItem>(`/orders/${id}`, {
    order_no: current.order_no,
    customer_id: current.customer_id,
    amount: current.amount,
    status,
    description: current.description ?? '',
  })
  return mapOrder(result)
}
