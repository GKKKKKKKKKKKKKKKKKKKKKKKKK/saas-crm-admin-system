import { Modal } from 'antd'

type GlobalErrorOptions = {
  title?: string
  message?: string
  detail?: string
  status?: number
  rawError?: unknown
  dedupeKey?: string
}

type FetchLikeInit = RequestInit & {
  skipGlobalError?: boolean
}

const LOGIN_PATH = '/login'
const DEDUPE_WINDOW_MS = 3000

let lastErrorKey = ''
let lastShownAt = 0
let activeModalKey = ''
let activeModalDestroy: (() => void) | null = null
let pendingModal: GlobalErrorOptions | null = null

const isNetworkErrorText = (text: string) => {
  const normalized = text.toLowerCase()
  return normalized.includes('network error') || normalized.includes('failed to fetch') || normalized.includes('networkerror')
}

const normalizeMessage = (options: GlobalErrorOptions) => {
  if (options.status === 401) {
    return '登录状态已失效，请重新登录'
  }
  if (options.status === 403) {
    return '您暂无权限执行此操作'
  }
  if (options.status === 404) {
    return '请求的资源不存在'
  }
  if (options.status === 500) {
    return '服务器异常，请稍后重试'
  }

  const rawMessage = options.message ?? ''
  if (isNetworkErrorText(rawMessage)) {
    return '网络连接异常，请稍后重试'
  }

  if (options.title === '页面渲染异常') {
    return '页面运行出错，请刷新页面后重试'
  }

  if (!rawMessage.trim()) {
    return '系统发生异常，请稍后重试'
  }

  if (/[a-zA-Z]{4,}/.test(rawMessage) && !/[\u4e00-\u9fa5]/.test(rawMessage)) {
    return '操作失败，请稍后重试'
  }

  return rawMessage
}

const getDetail = (detail?: string) => {
  if (!detail) {
    return undefined
  }
  return (
    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 240, overflowY: 'auto', marginTop: 8 }}>
      {detail}
    </div>
  )
}

const buildErrorKey = ({ title, message, dedupeKey }: GlobalErrorOptions) => {
  if (dedupeKey) {
    return dedupeKey
  }
  return [window.location.pathname, title ?? '操作失败', message ?? ''].join('|')
}

const canShowError = (options: GlobalErrorOptions) => {
  const now = Date.now()
  const key = buildErrorKey(options)
  if (lastErrorKey === key && now - lastShownAt < DEDUPE_WINDOW_MS) {
    return false
  }
  lastErrorKey = key
  lastShownAt = now
  return true
}

const openOrUpdateModal = (options: GlobalErrorOptions) => {
  const key = buildErrorKey(options)
  const title = options.title ?? '操作失败'
  const message = normalizeMessage(options)

  if (activeModalDestroy) {
    if (activeModalKey === key) {
      return
    }
    pendingModal = {
      ...options,
      title,
      message,
      dedupeKey: key,
    }
    return
  }

  activeModalKey = key
  const modal = Modal.error({
    title,
    content: (
      <div>
        <div>{message}</div>
        {getDetail(options.detail)}
      </div>
    ),
    okText: '我知道了',
    centered: true,
    afterClose: () => {
      activeModalDestroy = null
      activeModalKey = ''
      if (pendingModal) {
        const next = pendingModal
        pendingModal = null
        openOrUpdateModal(next)
      }
    },
  })

  activeModalDestroy = modal.destroy
}

export const shouldUseGlobalError = () => window.location.pathname !== LOGIN_PATH

export const showGlobalError = (options: GlobalErrorOptions) => {
  if (!shouldUseGlobalError()) {
    return
  }

  if (!canShowError(options)) {
    return
  }

  if (options.rawError) {
    console.error(options.rawError)
  }

  openOrUpdateModal(options)
}

const getErrorMessage = (reason: unknown) => {
  if (typeof reason === 'string') {
    return reason
  }
  if (reason && typeof reason === 'object' && 'message' in reason && typeof reason.message === 'string') {
    return reason.message
  }
  return '系统发生异常，请稍后重试'
}

const getErrorDetail = (reason: unknown) => {
  if (!reason) {
    return undefined
  }
  if (reason instanceof Error) {
    return reason.stack ?? reason.message
  }
  if (typeof reason === 'string') {
    return reason
  }
  try {
    return JSON.stringify(reason)
  } catch {
    return undefined
  }
}

let initialized = false

export const initGlobalErrorListeners = () => {
  if (initialized) {
    return
  }
  initialized = true

  window.addEventListener('error', (event) => {
    showGlobalError({
      title: '页面异常',
      message: event.message || '页面运行发生错误',
      detail: event.error ? getErrorDetail(event.error) : undefined,
      rawError: event.error,
      dedupeKey: ['window.error', window.location.pathname, event.message].join('|'),
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    showGlobalError({
      title: '异步异常',
      message: getErrorMessage(event.reason),
      detail: getErrorDetail(event.reason),
      rawError: event.reason,
      dedupeKey: ['unhandledrejection', window.location.pathname, getErrorMessage(event.reason)].join('|'),
    })
  })
}

let fetchPatched = false

const isRequestSkipGlobalError = (requestInput: RequestInfo | URL) => {
  if (typeof requestInput === 'string' || requestInput instanceof URL) {
    return false
  }
  return Boolean((requestInput as Request & { skipGlobalError?: boolean }).skipGlobalError)
}

export const patchGlobalFetch = () => {
  if (fetchPatched || typeof window.fetch !== 'function') {
    return
  }

  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: FetchLikeInit) => {
    const skipGlobalError = Boolean(init?.skipGlobalError) || isRequestSkipGlobalError(input)

    try {
      const response = await originalFetch(input, init)
      if (!response.ok && !skipGlobalError) {
        const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
        showGlobalError({
          title: '请求失败',
          message: `HTTP ${response.status}`,
          detail: requestUrl,
          status: response.status,
          dedupeKey: ['fetch', response.status, requestUrl, window.location.pathname].join('|'),
        })
      }
      return response
    } catch (error) {
      if (!skipGlobalError) {
        showGlobalError({
          title: '网络异常',
          message: getErrorMessage(error),
          detail: getErrorDetail(error),
          rawError: error,
          dedupeKey: ['fetch.catch', window.location.pathname, getErrorMessage(error)].join('|'),
        })
      }
      throw error
    }
  }

  fetchPatched = true
}
