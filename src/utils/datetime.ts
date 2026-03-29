import dayjs from 'dayjs'

export const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return ''
  }
  const parsed = dayjs(value)
  if (!parsed.isValid()) {
    return value
  }
  return parsed.format('YYYY-MM-DD HH:mm:ss')
}
