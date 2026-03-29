import { message } from 'antd'
import { useRef } from 'react'

type EmptyResultPayload = {
  listLength: number
  total: number
  page: number
}

const normalizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeValue)
  }
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = normalizeValue((value as Record<string, unknown>)[key])
        return acc
      }, {})
  }
  return value
}

const buildQueryKey = (query: Record<string, unknown>) => JSON.stringify(normalizeValue(query ?? {}))

export const useEmptyResultPrompt = (text = '未找到符合条件的数据，请调整筛选条件后重试') => {
  const pendingQueryKeyRef = useRef<string | null>(null)
  const lastPromptedQueryKeyRef = useRef<string>('')

  const markTriggered = (query: Record<string, unknown>) => {
    pendingQueryKeyRef.current = buildQueryKey(query)
  }

  const onFetchSuccess = ({ listLength, total, page }: EmptyResultPayload) => {
    const pendingQueryKey = pendingQueryKeyRef.current
    if (!pendingQueryKey) {
      return
    }

    pendingQueryKeyRef.current = null

    if (page !== 1) {
      return
    }

    if (total === 0 && listLength === 0 && lastPromptedQueryKeyRef.current !== pendingQueryKey) {
      lastPromptedQueryKeyRef.current = pendingQueryKey
      void message.info(text)
    }

    if (total > 0) {
      lastPromptedQueryKeyRef.current = ''
    }
  }

  return {
    markTriggered,
    onFetchSuccess,
  }
}
