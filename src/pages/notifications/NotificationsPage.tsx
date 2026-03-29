import { Button, Card, List, Pagination, Segmented, Space, Tag, Typography } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getNotificationsApi,
  notificationSocketEventName,
  readAllNotificationsApi,
  readNotificationApi,
  resolveNotificationPath,
  type NotificationItem,
} from '@/api/notifications'
import { feedback } from '@/utils/feedback'

const typeLabelMap: Record<NotificationItem['type'], string> = {
  system: '系统',
  order: '订单',
  customer: '客户',
  contract: '合同',
  followup: '跟进',
  payment: '回款',
}

const levelColorMap: Record<NotificationItem['level'], string> = {
  info: 'blue',
  success: 'green',
  warning: 'orange',
  error: 'red',
}

const NotificationsPage = () => {
  const navigate = useNavigate()
  const [list, setList] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all')

  const queryRead = useMemo<'0' | '1' | undefined>(() => {
    if (readFilter === 'unread') {
      return '0'
    }
    if (readFilter === 'read') {
      return '1'
    }
    return undefined
  }, [readFilter])

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getNotificationsApi({
        current: page,
        pageSize,
        is_read: queryRead,
      })
      setList(result.list)
      setTotal(result.total)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, queryRead])

  useEffect(() => {
    void fetchList()
  }, [fetchList])

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<NotificationItem>
      const next = customEvent.detail
      if (!next || page !== 1) {
        return
      }
      if (readFilter === 'read') {
        return
      }
      setList((prev) => {
        if (prev.some((item) => item.id === next.id)) {
          return prev
        }
        return [next, ...prev].slice(0, pageSize)
      })
      setTotal((prev) => prev + 1)
    }

    window.addEventListener(notificationSocketEventName, handler)
    return () => {
      window.removeEventListener(notificationSocketEventName, handler)
    }
  }, [page, pageSize, readFilter])

  const handleReadOne = async (item: NotificationItem) => {
    if (item.isRead) {
      navigate(resolveNotificationPath(item))
      return
    }
    try {
      await readNotificationApi(item.id)
      setList((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, isRead: true } : entry)))
      navigate(resolveNotificationPath(item))
    } catch {
      feedback.error('标记已读失败')
    }
  }

  const handleReadAll = async () => {
    setSubmitting(true)
    try {
      await readAllNotificationsApi()
      feedback.success('已全部标记为已读')
      void fetchList()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card
      title="通知中心"
      extra={(
        <Button onClick={() => void handleReadAll()} loading={submitting}>
          全部标记已读
        </Button>
      )}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Segmented
          value={readFilter}
          onChange={(value) => {
            setPage(1)
            setReadFilter(value as 'all' | 'unread' | 'read')
          }}
          options={[
            { label: '全部', value: 'all' },
            { label: '未读', value: 'unread' },
            { label: '已读', value: 'read' },
          ]}
        />

        <List
          loading={loading}
          dataSource={list}
          locale={{ emptyText: '暂无通知' }}
          renderItem={(item) => (
            <List.Item
              style={{
                background: item.isRead ? '#fff' : '#f6fbff',
                borderRadius: 8,
                paddingInline: 16,
                marginBottom: 8,
                border: item.isRead ? '1px solid #f0f0f0' : '1px solid #d6ebff',
              }}
              actions={[
                <Button type="link" key="read" onClick={() => void handleReadOne(item)}>
                  {item.isRead ? '查看' : '标记已读并查看'}
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={(
                  <Space>
                    <Typography.Text strong={!item.isRead}>{item.title}</Typography.Text>
                    <Tag color={levelColorMap[item.level]}>{item.level}</Tag>
                    <Tag>{typeLabelMap[item.type]}</Tag>
                    {!item.isRead ? <Tag color="processing">未读</Tag> : <Tag>已读</Tag>}
                  </Space>
                )}
                description={(
                  <Space direction="vertical" size={4}>
                    <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
                      {item.content}
                    </Typography.Paragraph>
                    <Typography.Text type="secondary">{item.createdAt}</Typography.Text>
                  </Space>
                )}
              />
            </List.Item>
          )}
        />

        <Pagination
          align="end"
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={(nextPage, nextPageSize) => {
            setPage(nextPage)
            setPageSize(nextPageSize)
          }}
          showSizeChanger
          pageSizeOptions={[10, 20, 50]}
        />
      </Space>
    </Card>
  )
}

export default NotificationsPage
