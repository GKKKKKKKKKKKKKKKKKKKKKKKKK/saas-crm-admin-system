export const customerFollowUpTypeOptions = [
  { label: '电话', value: 'phone' },
  { label: '面谈', value: 'meeting' },
  { label: '微信', value: 'wechat' },
  { label: '邮件', value: 'email' },
] as const

const followUpTypeLabelMap: Record<string, string> = {
  phone: '电话',
  meeting: '面谈',
  wechat: '微信',
  email: '邮件',
}

export const getCustomerFollowUpTypeLabel = (value?: string) => {
  if (!value) {
    return '未知'
  }
  return followUpTypeLabelMap[value] ?? '未知'
}
