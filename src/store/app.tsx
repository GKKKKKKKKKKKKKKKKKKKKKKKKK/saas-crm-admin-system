import { create } from 'zustand'
import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  ProfileOutlined,
  FileTextOutlined,
  DollarOutlined,
  ScheduleOutlined,
} from '@ant-design/icons'
import type { MenuItemConfig, PermissionCode } from '@/types'
import { hasPermission } from '@/utils/auth'

const menuConfig: MenuItemConfig[] = [
  { key: 'dashboard', label: '仪表盘', path: '/dashboard', icon: <DashboardOutlined />, permission: 'dashboard.view' },
  { key: 'customers', label: '客户管理', path: '/customers', icon: <TeamOutlined />, permission: 'customers.read' },
  { key: 'orders', label: '订单管理', path: '/orders', icon: <ShoppingCartOutlined />, permission: 'orders.read' },
  { key: 'customerFollowUps', label: '客户跟进', path: '/customer-follow-ups', icon: <ScheduleOutlined />, permission: 'customer_followups.view' },
  { key: 'contracts', label: '合同管理', path: '/contracts', icon: <FileTextOutlined />, permission: 'contracts.view' },
  { key: 'payments', label: '回款管理', path: '/payments', icon: <DollarOutlined />, permission: 'payments.view' },
  { key: 'users', label: '用户管理', path: '/users', icon: <UserOutlined />, permission: 'users.read' },
  { key: 'roles', label: '角色权限', path: '/roles', icon: <SafetyCertificateOutlined />, permission: 'roles.read' },
  { key: 'profile', label: '个人中心', path: '/profile', icon: <ProfileOutlined />, permission: 'profile.read' },
]

interface AppState {
  collapsed: boolean
  menus: MenuItemConfig[]
  permissions: PermissionCode[]
  setCollapsed: (collapsed: boolean) => void
  bootstrap: (permissions: PermissionCode[]) => void
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  collapsed: false,
  menus: [],
  permissions: [],
  setCollapsed: (collapsed) => set({ collapsed }),
  bootstrap: (permissions) => {
    const menus = menuConfig.filter((item) => hasPermission(permissions, item.permission))
    set({ permissions, menus })
  },
  reset: () => set({ permissions: [], menus: [] }),
}))
