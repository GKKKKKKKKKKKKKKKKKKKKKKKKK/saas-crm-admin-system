import request from '@/api/request'
import { formatDateTime } from '@/utils/datetime'

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error'
export type NotificationType = 'system' | 'order' | 'customer' | 'contract' | 'followup' | 'payment'

export interface NotificationItem {
  id: number
  type: NotificationType
  title: string
  content: string
  level: NotificationLevel
  recipientUserId: number
  senderUserId?: number
  businessType?: string
  businessId?: number
  isRead: boolean
  readAt: string
  createdAt: string
}

export interface NotificationListResponse {
  list: NotificationItem[]
  total: number
  current: number
  pageSize: number
}

export interface NotificationUnreadCountResponse {
  unreadCount: number
}

export const notificationSocketEventName = 'saasshow:notification:new'

type BackendNotificationItem = {
  id: number | string
  type: NotificationType | string
  title: string
  content: string
  level: NotificationLevel | string
  recipient_user_id: number | string
  sender_user_id?: number | string | null
  business_type?: string | null
  business_id?: number | string | null
  is_read: boolean
  read_at?: string | null
  created_at?: string | null
}

type BackendNotificationListResponse = {
  list?: BackendNotificationItem[]
  total?: number
  current?: number
  page?: number
  pageSize?: number
}

const mapNotificationType = (value: string): NotificationType => {
  if (value === 'system' || value === 'order' || value === 'customer' || value === 'contract' || value === 'followup' || value === 'payment') {
    return value
  }
  return 'system'
}

const mapNotificationLevel = (value: string): NotificationLevel => {
  if (value === 'info' || value === 'success' || value === 'warning' || value === 'error') {
    return value
  }
  return 'info'
}

const mapNotification = (item: BackendNotificationItem): NotificationItem => ({
  id: Number(item.id),
  type: mapNotificationType(item.type),
  title: item.title,
  content: item.content,
  level: mapNotificationLevel(item.level),
  recipientUserId: Number(item.recipient_user_id),
  senderUserId: item.sender_user_id == null ? undefined : Number(item.sender_user_id),
  businessType: item.business_type ?? undefined,
  businessId: item.business_id == null ? undefined : Number(item.business_id),
  isRead: item.is_read,
  readAt: formatDateTime(item.read_at),
  createdAt: formatDateTime(item.created_at),
})

export const getNotificationsApi = async (params: {
  current?: number
  pageSize?: number
  is_read?: '0' | '1'
  type?: NotificationType
}): Promise<NotificationListResponse> => {
  const result = await request.get<never, BackendNotificationListResponse>('/notifications', { params })
  return {
    list: (result.list ?? []).map(mapNotification),
    total: result.total ?? 0,
    current: result.current ?? result.page ?? 1,
    pageSize: result.pageSize ?? 10,
  }
}

export const getNotificationUnreadCountApi = async (): Promise<NotificationUnreadCountResponse> => {
  return request.get<never, NotificationUnreadCountResponse>('/notifications/unread-count')
}

export const readNotificationApi = async (id: number): Promise<{ updated: boolean }> => {
  return request.post<never, { updated: boolean }>(`/notifications/${id}/read`)
}

export const readAllNotificationsApi = async (): Promise<{ updatedCount: number }> => {
  return request.post<never, { updatedCount: number }>('/notifications/read-all')
}

export const resolveNotificationPath = (item: Pick<NotificationItem, 'type' | 'businessType' | 'businessId'>): string => {
  const businessType = item.businessType ?? item.type
  if (businessType === 'order') {
    return '/orders'
  }
  if (businessType === 'customer') {
    return '/customers'
  }
  if (businessType === 'contract') {
    return '/contracts'
  }
  if (businessType === 'payment') {
    return '/payments'
  }
  if (businessType === 'followup') {
    return '/customer-follow-ups'
  }
  return '/notifications'
}

export const parseSocketNotificationMessage = (payload: unknown): NotificationItem | null => {
  if (typeof payload !== 'string') {
    return null
  }

  try {
    const parsed = JSON.parse(payload) as {
      type?: string
      data?: {
        notification?: BackendNotificationItem
      }
    }

    if (parsed.type !== 'notification' || !parsed.data?.notification) {
      return null
    }

    return mapNotification(parsed.data.notification)
  } catch {
    return null
  }
}
