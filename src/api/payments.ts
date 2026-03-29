import request from '@/api/request'
import { formatDateTime } from '@/utils/datetime'
import type { PaginationResult, PaymentItem } from '@/types'

type BackendPaymentItem = {
  id: number | string
  contract_id: number | string
  order_id?: number | string | null
  customer_id: number | string
  amount: number | string
  payment_date?: string | null
  payment_method?: string | null
  status?: PaymentItem['status'] | string | null
  remark?: string | null
  created_at?: string | null
  contracts?: { contract_no?: string } | null
  orders?: { order_no?: string } | null
  customers?: { name?: string } | null
  users?: { username?: string } | null
  creator_name?: string | null
  creatorName?: string | null
  createByName?: string | null
}

type BackendPaymentPayload = {
  list?: BackendPaymentItem[]
  total?: number
  current?: number
  page?: number
  pageSize?: number
}

const toNumber = (value: number | string) => (typeof value === 'number' ? value : Number(value))

const mapPayment = (item: BackendPaymentItem): PaymentItem => ({
  id: Number(item.id),
  contractId: Number(item.contract_id),
  contractNo: item.contracts?.contract_no ?? '',
  orderId: item.order_id ? Number(item.order_id) : undefined,
  orderNo: item.orders?.order_no ?? '',
  customerId: Number(item.customer_id),
  customerName: item.customers?.name ?? '',
  amount: toNumber(item.amount),
  paymentDate: item.payment_date ? formatDateTime(item.payment_date) : '',
  paymentMethod: item.payment_method ?? '',
  status: item.status === 'confirmed' || item.status === 'failed' || item.status === 'cancelled' || item.status === 'pending' ? item.status : 'unknown',
  remark: item.remark ?? '',
  createdBy: item.creator_name ?? item.creatorName ?? item.createByName ?? item.users?.username ?? '',
  createdAt: formatDateTime(item.created_at),
})

const toPayload = (payload: Partial<PaymentItem>) => ({
  contract_id: payload.contractId,
  order_id: payload.orderId,
  customer_id: payload.customerId,
  amount: payload.amount,
  payment_date: payload.paymentDate || undefined,
  payment_method: payload.paymentMethod,
  status: payload.status,
  remark: payload.remark,
})

export const getPaymentsApi = async (params: Record<string, unknown>): Promise<PaginationResult<PaymentItem>> => {
  const result = await request.get<never, BackendPaymentPayload>('/payments', { params })
  return {
    list: (result.list ?? []).map(mapPayment),
    total: result.total ?? 0,
    current: (result.current as number | undefined) ?? (result.page ?? 1),
    pageSize: result.pageSize ?? 10,
  }
}

export const getPaymentDetailApi = async (id: number): Promise<PaymentItem> => {
  const result = await request.get<never, BackendPaymentItem>(`/payments/${id}`)
  return mapPayment(result)
}

export const createPaymentApi = async (payload: Partial<PaymentItem>): Promise<PaymentItem> => {
  const result = await request.post<never, BackendPaymentItem>('/payments', toPayload(payload))
  return mapPayment(result)
}

export const updatePaymentApi = async (id: number, payload: Partial<PaymentItem>): Promise<PaymentItem> => {
  const result = await request.put<never, BackendPaymentItem>(`/payments/${id}`, toPayload(payload))
  return mapPayment(result)
}

export const deletePaymentApi = async (id: number): Promise<boolean> => {
  await request.delete<never, null>(`/payments/${id}`)
  return true
}
