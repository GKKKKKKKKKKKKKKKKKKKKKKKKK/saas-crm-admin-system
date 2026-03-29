import dayjs from 'dayjs'
import type { OperationLogItem } from '@/types'
import { storage } from '@/utils/storage'

const LOG_KEY = 'saasshow_operation_logs'

const getLogs = () => {
  const raw = storage.get(LOG_KEY)
  if (!raw) {
    return [] as OperationLogItem[]
  }
  try {
    return JSON.parse(raw) as OperationLogItem[]
  } catch {
    return [] as OperationLogItem[]
  }
}

const setLogs = (logs: OperationLogItem[]) => {
  storage.set(LOG_KEY, JSON.stringify(logs))
}

export const listOperationLogs = (module?: OperationLogItem['module']) => {
  const logs = getLogs()
  if (!module) {
    return logs
  }
  return logs.filter((item) => item.module === module)
}

export const addOperationLog = (payload: Omit<OperationLogItem, 'id' | 'createdAt'>) => {
  const logs = getLogs()
  const item: OperationLogItem = {
    ...payload,
    id: Date.now(),
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  }
  setLogs([item, ...logs].slice(0, 500))
}
