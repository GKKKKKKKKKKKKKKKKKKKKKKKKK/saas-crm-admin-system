import request from '@/api/request'
import { formatDateTime } from '@/utils/datetime'
import type { DashboardStats, OrderItem } from '@/types'

type DashboardSummaryResponse = {
  customerTotal: number
  orderTotal: number
  monthCustomerTotal: number
  monthOrderAmount: number | string
}

type DashboardChartsResponse = {
  orderTrend7Days: Array<{
    date: string
    amount: number | string
    count: number
  }>
}

type DashboardRecentOrderItem = {
  id: number | string
  order_no: string
  customer_id: number | string
  customer_name: string
  amount: number | string
  status: OrderItem['status']
  created_at: string
}

const toNumber = (value: number | string | undefined) => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  return 0
}

const formatMonthLabel = (dateText: string) => {
  const date = new Date(dateText)
  const month = date.getUTCMonth() + 1
  return `${month}月`
}

const mapRecentOrder = (item: DashboardRecentOrderItem): OrderItem => ({
  id: Number(item.id),
  orderNo: item.order_no,
  customerId: Number(item.customer_id),
  customerName: item.customer_name,
  amount: toNumber(item.amount),
  status: item.status,
  createdAt: formatDateTime(item.created_at),
  product: '',
  owner: '',
})

export const getDashboardApi = async (): Promise<DashboardStats> => {
  const [summary, charts, recentOrders] = await Promise.all([
    request.get<never, DashboardSummaryResponse>('/dashboard/summary'),
    request.get<never, DashboardChartsResponse>('/dashboard/charts'),
    request.get<never, DashboardRecentOrderItem[]>('/dashboard/recent-orders'),
  ])

  return {
    customerTotal: summary.customerTotal,
    orderTotal: summary.orderTotal,
    monthlyCustomers: summary.monthCustomerTotal,
    dealAmount: toNumber(summary.monthOrderAmount),
    trend: (charts.orderTrend7Days ?? []).map((item) => ({
      month: formatMonthLabel(item.date),
      amount: toNumber(item.amount),
      orders: item.count,
    })),
    recentOrders: (recentOrders ?? []).map(mapRecentOrder),
  }
}
