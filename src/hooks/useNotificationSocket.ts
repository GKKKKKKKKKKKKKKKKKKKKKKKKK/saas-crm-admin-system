// simplified for public showcase
import { useEffect } from 'react'
import { notificationSocketEventName } from '@/api/notifications'

type UseNotificationSocketOptions = {
  enabled: boolean
  token?: string
  onNotification: () => void
}

export const useNotificationSocket = ({ enabled, onNotification }: UseNotificationSocketOptions) => {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const timer = window.setInterval(() => {
      onNotification()
      window.dispatchEvent(
        new CustomEvent(notificationSocketEventName, {
          detail: {
            id: `showcase-${Date.now()}`,
            title: '公开展示通知',
            content: 'simplified for public showcase',
            type: 'system',
            level: 'info',
            created_at: new Date().toISOString(),
          },
        }),
      )
    }, 30000)

    return () => {
      window.clearInterval(timer)
    }
  }, [enabled, onNotification])
}
