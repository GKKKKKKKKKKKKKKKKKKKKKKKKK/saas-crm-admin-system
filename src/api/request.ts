import axios, { type AxiosRequestConfig } from 'axios'
import { storage } from '@/utils/storage'
import { showGlobalError, shouldUseGlobalError } from '@/utils/globalError'
import { feedback } from '@/utils/feedback'

type RequestConfig = AxiosRequestConfig & {
  skipGlobalError?: boolean
}

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

let loginRedirecting = false

const extractBackendMessage = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') {
    return ''
  }

  const direct = (payload as { message?: unknown }).message
  if (typeof direct === 'string' && direct.trim()) {
    return direct.trim()
  }

  const nested = (payload as { data?: unknown }).data
  if (nested && typeof nested === 'object') {
    const nestedMessage = (nested as { message?: unknown }).message
    if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
      return nestedMessage.trim()
    }
  }

  return ''
}

const notifyRequestError = (messageText?: string) => {
  const text = (messageText ?? '').trim() || '操作失败，请稍后重试'
  feedback.error(text)
}

const redirectToLoginOnce = () => {
  if (window.location.pathname === '/login' || loginRedirecting) {
    return
  }
  loginRedirecting = true
  window.location.replace('/login')
  window.setTimeout(() => {
    loginRedirecting = false
  }, 1500)
}

request.interceptors.request.use((config) => {
  const token = storage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (config.params && typeof config.params === 'object') {
    const params = { ...(config.params as Record<string, unknown>) }
    if (params.current !== undefined && params.page === undefined) {
      params.page = params.current
    }
    delete params.current
    config.params = params
  }

  return config
})

request.interceptors.response.use(
  (response) => {
    const payload = response.data
    const successCode = payload.code === 0 || payload.code === 200
    const config = (response.config ?? {}) as RequestConfig

    if (!successCode) {
      const error = Object.assign(new Error(payload.message || '请求失败'), {
        response: {
          status: response.status,
          data: payload,
        },
        config,
      })
      const businessMessage = extractBackendMessage(payload) || payload.message || '请求失败'
      if (!config.skipGlobalError) {
        notifyRequestError(businessMessage)
        showGlobalError({
          title: '请求失败',
          message: businessMessage,
          status: response.status,
          rawError: error,
          dedupeKey: ['axios.business', window.location.pathname, response.config?.url ?? '', payload.code, payload.message ?? ''].join('|'),
        })
      }
      return Promise.reject(error)
    }

    const data = payload.data
    if (data && typeof data === 'object' && 'page' in data && !('current' in data)) {
      ;(data as Record<string, unknown>).current = (data as Record<string, unknown>).page
    }

    return data
  },
  (error: { response?: { status?: number; data?: { message?: string } }; message?: string; config?: RequestConfig }) => {
    const status = error.response?.status
    const skipGlobalError = Boolean(error.config?.skipGlobalError)

    if (status === 401) {
      storage.clearAll()
      if (!skipGlobalError && shouldUseGlobalError()) {
        notifyRequestError('登录状态已失效，请重新登录')
        showGlobalError({
          title: '登录失效',
          message: '登录状态已失效，请重新登录',
          status,
          rawError: error,
          dedupeKey: ['axios.401', window.location.pathname].join('|'),
        })
      }
      redirectToLoginOnce()
      return Promise.reject(error)
    }

    if (!skipGlobalError) {
      const backendMessage = extractBackendMessage(error.response?.data)
      if (backendMessage) {
        notifyRequestError(backendMessage)
        showGlobalError({
          title: '请求失败',
          message: backendMessage,
          status,
          detail: `状态码：${status ?? '未知'}`,
          rawError: error,
          dedupeKey: ['axios.response', window.location.pathname, error.config?.url ?? '', status ?? 'unknown', backendMessage].join('|'),
        })
      } else {
        const networkMessage = error.message || '网络异常'
        notifyRequestError(networkMessage)
        showGlobalError({
          title: '网络异常',
          message: networkMessage,
          status,
          detail: `状态码：${status ?? '无响应'}`,
          rawError: error,
          dedupeKey: ['axios.network', window.location.pathname, error.config?.url ?? '', status ?? 'no-status', networkMessage].join('|'),
        })
      }
    }

    return Promise.reject(error)
  },
)

export default request
