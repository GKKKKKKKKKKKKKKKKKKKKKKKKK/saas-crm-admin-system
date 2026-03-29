import { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import type { OperationLogItem } from '@/types'
import { addOperationLog, listOperationLogs } from '@/utils/operationLog'

export const useOperationLog = (module?: OperationLogItem['module']) => {
  const user = useAuthStore((state) => state.user)
  const [logs, setLogs] = useState<OperationLogItem[]>([])

  const refreshLogs = useCallback(() => {
    setLogs(listOperationLogs(module))
  }, [module])

  useEffect(() => {
    refreshLogs()
  }, [refreshLogs])

  const recordLog = (payload: Omit<OperationLogItem, 'id' | 'createdAt' | 'actor'>) => {
    addOperationLog({
      ...payload,
      actor: user?.name ?? user?.username ?? '未知用户',
    })
    refreshLogs()
  }

  return { logs, recordLog, refreshLogs }
}
