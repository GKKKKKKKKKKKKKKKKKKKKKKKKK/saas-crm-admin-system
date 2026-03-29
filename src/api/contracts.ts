import request from '@/api/request'
import { formatDateTime } from '@/utils/datetime'
import type { ContractItem, PaginationResult } from '@/types'

type BackendContractItem = {
  id: number | string
  contract_no: string
  customer_id: number | string
  order_id?: number | string | null
  title?: string | null
  amount: number | string
  status: ContractItem['status'] | string
  sign_date?: string | null
  start_date?: string | null
  end_date?: string | null
  owner_user_id?: number | string | null
  remark?: string | null
  created_at?: string | null
  customers?: { name?: string } | null
  orders?: { order_no?: string } | null
  owner_user?: { username?: string } | null
  creator_user?: { username?: string } | null
  owner_name?: string | null
  ownerName?: string | null
  responsible_name?: string | null
  responsibleName?: string | null
  creator_name?: string | null
  creatorName?: string | null
  totalPaidAmount?: number | string
  unpaidAmount?: number | string
  paymentProgress?: number
  paymentStatusText?: ContractItem['paymentStatusText']
}

type BackendContractPayload = {
  list?: BackendContractItem[]
  total?: number
  current?: number
  page?: number
  pageSize?: number
}

const toNumber = (value?: number | string | null) => {
  if (value === null || value === undefined || value === '') {
    return 0
  }
  return typeof value === 'number' ? value : Number(value)
}

const mapContract = (item: BackendContractItem): ContractItem => ({
  id: Number(item.id),
  contractNo: item.contract_no,
  customerId: Number(item.customer_id),
  customerName: item.customers?.name ?? '',
  orderId: item.order_id ? Number(item.order_id) : undefined,
  orderNo: item.orders?.order_no ?? '',
  title: item.title ?? '',
  amount: toNumber(item.amount),
  status: item.status === 'active' || item.status === 'expired' || item.status === 'terminated' || item.status === 'draft' ? item.status : 'draft',
  signDate: item.sign_date ? formatDateTime(item.sign_date) : '',
  startDate: item.start_date ? formatDateTime(item.start_date) : '',
  endDate: item.end_date ? formatDateTime(item.end_date) : '',
  ownerUserId: item.owner_user_id ? Number(item.owner_user_id) : undefined,
  ownerName: item.owner_name ?? item.ownerName ?? item.responsible_name ?? item.responsibleName ?? item.owner_user?.username ?? '',
  creatorName: item.creator_name ?? item.creatorName ?? item.creator_user?.username ?? '',
  remark: item.remark ?? '',
  createdAt: formatDateTime(item.created_at),
  totalPaidAmount: item.totalPaidAmount === undefined ? undefined : toNumber(item.totalPaidAmount),
  unpaidAmount: item.unpaidAmount === undefined ? undefined : toNumber(item.unpaidAmount),
  paymentProgress: item.paymentProgress,
  paymentStatusText: item.paymentStatusText,
})

const toPayload = (payload: Partial<ContractItem>) => ({
  contract_no: payload.contractNo,
  customer_id: payload.customerId,
  order_id: payload.orderId,
  title: payload.title,
  amount: payload.amount,
  status: payload.status,
  sign_date: payload.signDate || undefined,
  start_date: payload.startDate || undefined,
  end_date: payload.endDate || undefined,
  owner_user_id: payload.ownerUserId,
  remark: payload.remark,
})

export const getContractsApi = async (params: Record<string, unknown>): Promise<PaginationResult<ContractItem>> => {
  const result = await request.get<never, BackendContractPayload>('/contracts', { params })
  return {
    list: (result.list ?? []).map(mapContract),
    total: result.total ?? 0,
    current: (result.current as number | undefined) ?? (result.page ?? 1),
    pageSize: result.pageSize ?? 10,
  }
}

export const getContractDetailApi = async (id: number): Promise<ContractItem> => {
  const result = await request.get<never, BackendContractItem>(`/contracts/${id}`)
  return mapContract(result)
}

export const createContractApi = async (payload: Partial<ContractItem>): Promise<ContractItem> => {
  const result = await request.post<never, BackendContractItem>('/contracts', toPayload(payload))
  return mapContract(result)
}

export const updateContractApi = async (id: number, payload: Partial<ContractItem>): Promise<ContractItem> => {
  const result = await request.put<never, BackendContractItem>(`/contracts/${id}`, toPayload(payload))
  return mapContract(result)
}

export const deleteContractApi = async (id: number): Promise<boolean> => {
  await request.delete<never, null>(`/contracts/${id}`)
  return true
}
