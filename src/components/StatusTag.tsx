import { Tag } from 'antd'

interface StatusTagProps {
  status: string | boolean
  text: string
  className?: string
}

const getStatusClassName = (status: string | boolean) => {
  if (typeof status === 'boolean') {
    return status ? 'is-success' : 'is-default'
  }

  const normalized = status.toLowerCase().trim()
  if (['active', 'enabled', 'success', 'completed'].includes(normalized)) {
    return 'is-success'
  }
  if (['启用', '已完成'].includes(normalized)) {
    return 'is-success'
  }
  if (['inactive', 'disabled', 'cancelled'].includes(normalized)) {
    return 'is-default'
  }
  if (['禁用', '停用', '已取消'].includes(normalized)) {
    return 'is-default'
  }
  if (['pending', 'processing'].includes(normalized)) {
    return 'is-processing'
  }
  if (['待处理', '处理中', '待跟进'].includes(normalized)) {
    return 'is-processing'
  }
  if (normalized === 'warning') {
    return 'is-warning'
  }
  if (['error', 'failed'].includes(normalized)) {
    return 'is-danger'
  }
  return 'is-default'
}

const StatusTag = ({ status, text, className }: StatusTagProps) => {
  const classes = ['status-tag', getStatusClassName(status), className].filter(Boolean).join(' ')
  return <Tag className={classes}>{text}</Tag>
}

export default StatusTag
