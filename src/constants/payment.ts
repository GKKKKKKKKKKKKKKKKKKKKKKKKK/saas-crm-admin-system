export const paymentMethodOptions = [
  { label: '银行转账', value: 'bank_transfer' },
  { label: '现金', value: 'cash' },
  { label: '支付宝', value: 'alipay' },
  { label: '微信', value: 'wechat' },
  { label: '支票', value: 'cheque' },
  { label: '其他', value: 'other' },
] as const

const paymentMethodLabelMap: Record<string, string> = {
  bank_transfer: '银行转账',
  cash: '现金',
  alipay: '支付宝',
  wechat: '微信',
  cheque: '支票',
  other: '其他',
}

export const getPaymentMethodLabel = (value?: string | null) => {
  if (!value) {
    return '未知'
  }
  return paymentMethodLabelMap[value] ?? '未知'
}

export const paymentStatusOptions = [
  { label: '已确认', value: 'confirmed' },
  { label: '待确认', value: 'pending' },
  { label: '已取消', value: 'cancelled' },
  { label: '失败', value: 'failed' },
] as const

const paymentStatusLabelMap: Record<string, string> = {
  confirmed: '已确认',
  pending: '待确认',
  cancelled: '已取消',
  failed: '失败',
}

export const paymentStatusColorMap: Record<string, string> = {
  confirmed: 'green',
  pending: 'default',
  cancelled: 'orange',
  failed: 'red',
}

export const getPaymentStatusLabel = (value?: string | null) => {
  if (!value) {
    return '未知'
  }
  return paymentStatusLabelMap[value] ?? '未知'
}
