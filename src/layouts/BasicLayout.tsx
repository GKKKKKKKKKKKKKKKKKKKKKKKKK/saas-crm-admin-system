import { Layout, Menu, Avatar, Badge, Button, Divider, Dropdown, List, Space, Tag, Typography, theme } from 'antd'
import { BellOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getNotificationUnreadCountApi, getNotificationsApi, readAllNotificationsApi, readNotificationApi, resolveNotificationPath, type NotificationItem } from '@/api/notifications'
import { useNotificationSocket } from '@/hooks/useNotificationSocket'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import { getAvatarBgColor, getAvatarText } from '@/utils/avatar'

const { Header, Sider, Content } = Layout

const BasicLayout = () => {
  const { token } = theme.useToken()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const collapsed = useAppStore((state) => state.collapsed)
  const menus = useAppStore((state) => state.menus)
  const permissions = useAppStore((state) => state.permissions)
  const setCollapsed = useAppStore((state) => state.setCollapsed)
  const user = useAuthStore((state) => state.user)
  const tokenText = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const canViewNotifications = permissions.includes('notifications.view') || permissions.includes('notifications.read')
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationList, setNotificationList] = useState<NotificationItem[]>([])
  const [notificationLoading, setNotificationLoading] = useState(false)

  const items = menus.map((item) => ({
    key: item.path,
    icon: item.icon,
    label: item.label,
  }))

  const refreshNotification = useCallback(async () => {
    if (!canViewNotifications) {
      setUnreadCount(0)
      setNotificationList([])
      return
    }
    setNotificationLoading(true)
    try {
      const [countRes, listRes] = await Promise.all([
        getNotificationUnreadCountApi(),
        getNotificationsApi({ current: 1, pageSize: 5 }),
      ])
      setUnreadCount(countRes.unreadCount)
      setNotificationList(listRes.list)
    } finally {
      setNotificationLoading(false)
    }
  }, [canViewNotifications])

  useEffect(() => {
    void refreshNotification()
  }, [refreshNotification, pathname])

  useNotificationSocket({
    enabled: canViewNotifications,
    token: tokenText,
    onNotification: () => {
      void refreshNotification()
    },
  })

  const notificationDropdown = useMemo(() => (
    <div style={{ width: 360, maxHeight: 420, overflow: 'auto' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between', padding: '8px 12px' }}>
        <Typography.Text strong>通知</Typography.Text>
        <Button type="link" size="small" onClick={() => void readAllNotificationsApi().then(refreshNotification)}>
          全部已读
        </Button>
      </Space>
      <Divider style={{ margin: 0 }} />
      <List
        loading={notificationLoading}
        dataSource={notificationList}
        locale={{ emptyText: '暂无通知' }}
        renderItem={(item) => (
          <List.Item
            style={{ paddingInline: 12, background: item.isRead ? '#fff' : '#f6fbff' }}
            actions={[
              <Button
                type="link"
                size="small"
                key="open"
                onClick={() => void readNotificationApi(item.id).finally(() => {
                  void refreshNotification()
                  navigate(resolveNotificationPath(item))
                })}
              >
                {item.isRead ? '查看' : '已读'}
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={(
                <Space>
                  <Typography.Text strong={!item.isRead}>{item.title}</Typography.Text>
                  {!item.isRead ? <Tag color="processing">未读</Tag> : null}
                </Space>
              )}
              description={<Typography.Text type="secondary">{item.createdAt}</Typography.Text>}
            />
          </List.Item>
        )}
      />
      <Divider style={{ margin: 0 }} />
      <Button type="link" block onClick={() => navigate('/notifications')}>
        进入通知中心
      </Button>
    </div>
  ), [navigate, notificationList, notificationLoading, refreshNotification])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light" width={240} style={{ borderRight: '1px solid #edf1f6' }}>
        <div style={{ height: 72, display: 'flex', alignItems: 'center', padding: '0 24px', fontSize: 20, fontWeight: 700, color: token.colorPrimary }}>
          SaaS Admin
        </div>
        <Menu mode="inline" selectedKeys={[pathname]} items={items} onClick={({ key }) => navigate(key)} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #edf1f6' }}>
          <Space>
            {collapsed ? (
              <MenuUnfoldOutlined onClick={() => setCollapsed(false)} style={{ fontSize: 18 }} />
            ) : (
              <MenuFoldOutlined onClick={() => setCollapsed(true)} style={{ fontSize: 18 }} />
            )}
            <Typography.Title level={5} style={{ margin: 0 }}>
              企业级 SaaS 订单客户管理后台
            </Typography.Title>
          </Space>
          <Space size={16}>
            {canViewNotifications ? (
              <Dropdown popupRender={() => notificationDropdown} trigger={['click']}>
                <Badge count={unreadCount} size="small">
                  <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
                </Badge>
              </Dropdown>
            ) : null}
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: '退出登录',
                    onClick: () => {
                      logout()
                      navigate('/login')
                    },
                  },
                ],
              }}
            >
              <Space>
                <Avatar
                  src={user?.avatar || undefined}
                  style={{
                    backgroundColor: getAvatarBgColor(user?.name ?? user?.username),
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                  }}
                >
                  {user?.avatar ? null : getAvatarText(user?.name ?? user?.username)}
                </Avatar>
                <span>{user?.name ?? user?.username}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ padding: 20 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default BasicLayout
