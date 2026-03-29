import type { AxiosRequestConfig } from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import request from '@/api/request'
import dayjs from 'dayjs'
import type { CustomerItem, DashboardStats, LoginResponse, OrderItem, PaginationResult, PermissionCode, RoleItem, SystemUser, UserProfile } from '@/types'

type ApiSuccess<T> = {
  code: 0
  message: string
  data: T
}

type ApiFail = {
  code: number
  message: string
  data: null
}

type MockReply<T> = [status: number, body: ApiSuccess<T> | ApiFail]

type MockConfig = AxiosRequestConfig<string>

type LoginPayload = {
  username: string
  password: string
}

const mock = new AxiosMockAdapter(request, { delayResponse: 400 })

const allPermissions: PermissionCode[] = [
  'dashboard.view',
  'customers.read',
  'customers.create',
  'customers.update',
  'customers.delete',
  'customers.export',
  'customers.batch',
  'orders.read',
  'orders.create',
  'orders.update',
  'orders.delete',
  'orders.status',
  'orders.export',
  'orders.batch',
  'users.read',
  'users.create',
  'users.update',
  'users.delete',
  'users.export',
  'users.batch',
  'roles.read',
  'roles.create',
  'roles.update',
  'roles.delete',
  'roles.export',
  'roles.batch',
  'profile.read',
  'profile.update',
  'customer_followups.view',
  'customer_followups.create',
  'customer_followups.update',
  'customer_followups.delete',
  'contracts.view',
  'contracts.create',
  'contracts.update',
  'contracts.delete',
  'payments.view',
  'payments.create',
  'payments.update',
  'payments.delete',
]

const roles: RoleItem[] = [
  { id: 1, name: '超级管理员', code: 'admin', description: '拥有全部权限', permissions: allPermissions, createdAt: '2026-01-01 09:00:00' },
  { id: 2, name: '销售经理', code: 'staff', description: '负责客户与订单推进', permissions: ['dashboard.view', 'customers.read', 'customers.create', 'customers.update', 'customers.export', 'customers.batch', 'orders.read', 'orders.create', 'orders.update', 'orders.status', 'orders.export', 'orders.batch', 'profile.read', 'profile.update'], createdAt: '2026-01-08 10:00:00' },
  { id: 3, name: '运营专员', code: 'staff_ops', description: '负责订单跟进', permissions: ['dashboard.view', 'orders.read', 'orders.update', 'orders.status', 'orders.export', 'orders.batch', 'profile.read', 'profile.update'], createdAt: '2026-01-10 11:20:00' },
  { id: 4, name: '访客', code: 'viewer', description: '只读权限', permissions: ['dashboard.view', 'customers.read', 'orders.read', 'users.read', 'roles.read', 'profile.read'], createdAt: '2026-01-11 11:20:00' },
]

const users: SystemUser[] = [
  { id: 1, name: '陈总', username: 'demo-admin', email: 'demo@example.com', mobile: '13800000000', status: true, roleIds: [1], createdAt: '2026-01-01 09:00:00' },
  { id: 2, name: '李销售', username: 'demo-sales', email: 'demo@example.com', mobile: '13800000000', status: true, roleIds: [2], createdAt: '2026-01-06 10:00:00' },
  { id: 3, name: '赵运营', username: 'demo-ops', email: 'demo@example.com', mobile: '13800000000', status: false, roleIds: [3], createdAt: '2026-01-09 14:00:00' },
]

const customers: CustomerItem[] = Array.from({ length: 18 }).map((_, index) => ({
  id: index + 1,
  name: `客户${index + 1}`,
  company: `企业集团 ${index + 1}`,
  phone: `1390000${String(index).padStart(4, '0')}`,
  email: `customer${index + 1}@example.com`,
  status: index % 3 === 0 ? 'active' : index % 3 === 1 ? 'pending' : 'inactive',
  createdAt: `2026-02-${String((index % 28) + 1).padStart(2, '0')} 10:00:00`,
  owner: index % 2 === 0 ? '李销售' : '王顾问',
  remark: '重点推进签约转化',
}))

const orders: OrderItem[] = Array.from({ length: 24 }).map((_, index) => ({
  id: index + 1,
  orderNo: `SO202603${String(index + 1).padStart(4, '0')}`,
  customerId: (index % customers.length) + 1,
  customerName: customers[index % customers.length].name,
  amount: 5000 + index * 1800,
  status: index % 4 === 0 ? 'pending' : index % 4 === 1 ? 'processing' : index % 4 === 2 ? 'completed' : 'cancelled',
  createdAt: `2026-03-${String((index % 23) + 1).padStart(2, '0')} 15:30:00`,
  product: index % 2 === 0 ? '企业版订阅' : '增长版订阅',
  owner: index % 2 === 0 ? '李销售' : '赵运营',
}))

const profileMap: Record<string, UserProfile> = {
  demo_admin: {
    id: 1,
    name: '陈总',
    username: 'demo-admin',
    email: 'demo@example.com',
    mobile: '13800000000',
    role: '超级管理员',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin',
    title: 'CEO',
    position: 'CEO',
    department: '管理层',
    permissions: allPermissions,
  },
  demo_sales: {
    id: 2,
    name: '李销售',
    username: 'demo-sales',
    email: 'demo@example.com',
    mobile: '13800000000',
    role: '销售经理',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Sales',
    title: '销售经理',
    position: '销售经理',
    department: '销售部',
    permissions: roles[1].permissions,
  },
  demo_viewer: {
    id: 4,
    name: '访客账号',
    username: 'demo-viewer',
    email: 'demo@example.com',
    mobile: '13800000000',
    role: '访客',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Viewer',
    title: '访客',
    position: '访客',
    department: '访客组',
    permissions: roles[3].permissions,
  },

}

const parseBody = <T,>(config: MockConfig): T => {
  const raw = config.data ?? '{}'
  return JSON.parse(raw) as T
}

const getTokenUsername = (config: MockConfig) => {
  const headers = (config.headers ?? {}) as Record<string, unknown>
  const authorization = headers.Authorization
  const token = typeof authorization === 'string' ? authorization : Array.isArray(authorization) ? String(authorization[0] ?? '') : ''
  return token.replace('Bearer demo-token-', '')
}

const getIdFromUrl = (config: MockConfig) => Number(config.url?.split('/').pop())

const getPageParams = (config: MockConfig) => {
  const params = (config.params ?? {}) as Record<string, unknown>
  return {
    current: Number(params.current ?? params.page ?? 1),
    pageSize: Number(params.pageSize ?? 10),
    keyword: String(params.keyword ?? '').toLowerCase(),
    status: params.status,
    createdAtStart: String(params.createdAtStart ?? ''),
    createdAtEnd: String(params.createdAtEnd ?? ''),
    amountRangeMin: params.amountRangeMin,
    amountRangeMax: params.amountRangeMax,
    roleId: params.roleId,
    sortField: String(params.sortField ?? ''),
    sortOrder: String(params.sortOrder ?? ''),
  }
}

const sortByField = <T,>(list: T[], sortField: string, sortOrder: string, getter: Record<string, (item: T) => string | number>) => {
  if (!sortField || !sortOrder || !getter[sortField]) {
    return list
  }
  const sorted = [...list].sort((a, b) => {
    const va = getter[sortField](a)
    const vb = getter[sortField](b)
    if (typeof va === 'number' && typeof vb === 'number') {
      return va - vb
    }
    return String(va).localeCompare(String(vb))
  })
  return sortOrder === 'descend' ? sorted.reverse() : sorted
}

const paginate = <T,>(list: T[], current: number, pageSize: number): PaginationResult<T> => ({
  list: list.slice((current - 1) * pageSize, current * pageSize),
  total: list.length,
  current,
  pageSize,
})

const ok = <T,>(data: T, message = 'success'): MockReply<T> => [200, { code: 0, message, data }]
const fail = (status: number, message: string): MockReply<null> => [status, { code: status, message, data: null }]

mock.onPost('/auth/login').reply((config: MockConfig): MockReply<LoginResponse> => {
  const payload = parseBody<LoginPayload>(config)
  if (payload.password !== 'demo-password' || !profileMap[payload.username]) {
    return fail(401, '账号或密码错误')
  }
  const user = profileMap[payload.username]
  return ok({ token: `demo-token-${payload.username}`, user, permissions: user.permissions })
})

const getProfileHandler = (config: MockConfig): MockReply<UserProfile> => {
  const username = getTokenUsername(config)
  const user = profileMap[username] ?? profileMap.demo_admin
  return ok(user)
}

mock.onGet('/auth/profile').reply(getProfileHandler)
mock.onGet('/auth/me').reply(getProfileHandler)

mock.onPut('/auth/profile').reply((config: MockConfig): MockReply<UserProfile> => {
  const username = getTokenUsername(config)
  const payload = parseBody<Partial<UserProfile>>(config)
  const currentUser = profileMap[username] ?? profileMap.demo_admin
  profileMap[username] = { ...currentUser, ...payload }
  return ok(profileMap[username])
})

mock.onGet('/dashboard').reply((): MockReply<DashboardStats> => ok({
  customerTotal: customers.length,
  orderTotal: orders.length,
  monthlyCustomers: 12,
  dealAmount: orders.reduce((sum, item) => sum + item.amount, 0),
  trend: [
    { month: '10月', amount: 68000, orders: 18 },
    { month: '11月', amount: 72000, orders: 20 },
    { month: '12月', amount: 80500, orders: 23 },
    { month: '1月', amount: 92000, orders: 25 },
    { month: '2月', amount: 98600, orders: 27 },
    { month: '3月', amount: 110500, orders: 31 },
  ],
  recentOrders: orders.slice(0, 6),
}))

mock.onGet('/customers').reply((config: MockConfig): MockReply<PaginationResult<CustomerItem>> => {
  const { current, pageSize, keyword, status, createdAtStart, createdAtEnd, sortField, sortOrder } = getPageParams(config)
  const filtered = customers.filter((item) => {
    const keywordMatch = !keyword || [item.name, item.company, item.email].some((field) => field.toLowerCase().includes(keyword))
    const statusMatch = !status || item.status === status
    const startMatch = !createdAtStart || dayjs(item.createdAt).isAfter(dayjs(createdAtStart).subtract(1, 'second'))
    const endMatch = !createdAtEnd || dayjs(item.createdAt).isBefore(dayjs(createdAtEnd).add(1, 'second'))
    return keywordMatch && statusMatch && startMatch && endMatch
  })
  const sorted = sortByField(filtered, sortField, sortOrder, {
    createdAt: (item) => dayjs(item.createdAt).valueOf(),
    name: (item) => item.name,
  })
  return ok(paginate(sorted, current, pageSize))
})

mock.onGet(/\/customers\/\d+/).reply((config: MockConfig): MockReply<CustomerItem> => {
  const id = getIdFromUrl(config)
  const customer = customers.find((item) => item.id === id)
  if (!customer) {
    return fail(404, '客户不存在')
  }
  return ok(customer)
})

mock.onPost('/customers').reply((config: MockConfig): MockReply<CustomerItem> => {
  const payload = parseBody<Partial<CustomerItem>>(config)
  const item: CustomerItem = { id: customers.length + 1, createdAt: '2026-03-23 10:00:00', ...payload } as CustomerItem
  customers.unshift(item)
  return ok(item)
})

mock.onPut(/\/customers\/\d+/).reply((config: MockConfig): MockReply<CustomerItem> => {
  const id = getIdFromUrl(config)
  const index = customers.findIndex((item) => item.id === id)
  customers[index] = { ...customers[index], ...parseBody<Partial<CustomerItem>>(config) }
  return ok(customers[index])
})

mock.onDelete(/\/customers\/\d+/).reply((config: MockConfig): MockReply<boolean> => {
  const id = getIdFromUrl(config)
  const index = customers.findIndex((item) => item.id === id)
  customers.splice(index, 1)
  return ok(true)
})

mock.onGet('/orders').reply((config: MockConfig): MockReply<PaginationResult<OrderItem>> => {
  const { current, pageSize, keyword, status, createdAtStart, createdAtEnd, amountRangeMin, amountRangeMax, sortField, sortOrder } = getPageParams(config)
  const filtered = orders.filter((item) => {
    const keywordMatch = !keyword || [item.orderNo, item.customerName, item.product].some((field) => field.toLowerCase().includes(keyword))
    const statusMatch = !status || item.status === status
    const startMatch = !createdAtStart || dayjs(item.createdAt).isAfter(dayjs(createdAtStart).subtract(1, 'second'))
    const endMatch = !createdAtEnd || dayjs(item.createdAt).isBefore(dayjs(createdAtEnd).add(1, 'second'))
    const minMatch = amountRangeMin === undefined || amountRangeMin === '' || item.amount >= Number(amountRangeMin)
    const maxMatch = amountRangeMax === undefined || amountRangeMax === '' || item.amount <= Number(amountRangeMax)
    return keywordMatch && statusMatch && startMatch && endMatch && minMatch && maxMatch
  })
  const sorted = sortByField(filtered, sortField, sortOrder, {
    createdAt: (item) => dayjs(item.createdAt).valueOf(),
    amount: (item) => item.amount,
    orderNo: (item) => item.orderNo,
  })
  return ok(paginate(sorted, current, pageSize))
})

mock.onPost('/orders').reply((config: MockConfig): MockReply<OrderItem> => {
  const payload = parseBody<Partial<OrderItem>>(config)
  const item: OrderItem = { id: orders.length + 1, customerId: 1, createdAt: '2026-03-23 10:30:00', ...payload } as OrderItem
  orders.unshift(item)
  return ok(item)
})

mock.onPut(/\/orders\/\d+/).reply((config: MockConfig): MockReply<OrderItem> => {
  const id = getIdFromUrl(config)
  const index = orders.findIndex((item) => item.id === id)
  orders[index] = { ...orders[index], ...parseBody<Partial<OrderItem>>(config) }
  return ok(orders[index])
})

mock.onPatch(/\/orders\/\d+\/status/).reply((config: MockConfig): MockReply<OrderItem> => {
  const parts = config.url?.split('/') ?? []
  const id = Number(parts[parts.length - 2])
  const index = orders.findIndex((item) => item.id === id)
  const payload = parseBody<Pick<OrderItem, 'status'>>(config)
  orders[index] = { ...orders[index], status: payload.status }
  return ok(orders[index])
})

mock.onDelete(/\/orders\/\d+/).reply((config: MockConfig): MockReply<boolean> => {
  const id = getIdFromUrl(config)
  const index = orders.findIndex((item) => item.id === id)
  orders.splice(index, 1)
  return ok(true)
})

mock.onGet('/users').reply((config: MockConfig): MockReply<PaginationResult<SystemUser>> => {
  const { current, pageSize, keyword, status, roleId, createdAtStart, createdAtEnd } = getPageParams(config)
  const filtered = users.filter((item) => {
    const keywordMatch = !keyword || [item.name, item.username, item.email].some((field) => field.toLowerCase().includes(keyword))
    const statusMatch = status === undefined || status === '' ? true : String(item.status) === String(status)
    const roleMatch = roleId === undefined || roleId === '' ? true : item.roleIds.includes(Number(roleId))
    const startMatch = !createdAtStart || dayjs(item.createdAt).isAfter(dayjs(createdAtStart).subtract(1, 'second'))
    const endMatch = !createdAtEnd || dayjs(item.createdAt).isBefore(dayjs(createdAtEnd).add(1, 'second'))
    return keywordMatch && statusMatch && roleMatch && startMatch && endMatch
  })
  return ok(paginate(filtered, current, pageSize))
})

mock.onPost('/users').reply((config: MockConfig): MockReply<SystemUser> => {
  const payload = parseBody<Partial<SystemUser>>(config)
  const item: SystemUser = { id: users.length + 1, createdAt: '2026-03-23 09:30:00', ...payload } as SystemUser
  users.unshift(item)
  return ok(item)
})

mock.onPut(/\/users\/\d+/).reply((config: MockConfig): MockReply<SystemUser> => {
  const id = getIdFromUrl(config)
  const index = users.findIndex((item) => item.id === id)
  const payload = parseBody<{ username?: string; email?: string; phone?: string; department?: string | null; position?: string | null }>(config)
  users[index] = {
    ...users[index],
    username: payload.username ?? users[index].username,
    name: payload.username ?? users[index].name,
    email: payload.email ?? users[index].email,
    mobile: payload.phone ?? users[index].mobile,
    department: payload.department ?? users[index].department,
    position: payload.position ?? users[index].position,
  }
  const profileKey = Object.keys(profileMap).find((key) => profileMap[key].id === id)
  if (profileKey) {
    profileMap[profileKey] = {
      ...profileMap[profileKey],
      username: payload.username ?? profileMap[profileKey].username,
      name: payload.username ?? profileMap[profileKey].name,
      email: payload.email ?? profileMap[profileKey].email,
      mobile: payload.phone ?? profileMap[profileKey].mobile,
      department: payload.department ?? profileMap[profileKey].department,
      position: payload.position ?? profileMap[profileKey].position ?? profileMap[profileKey].title,
      title: payload.position ?? profileMap[profileKey].title,
    }
  }
  return ok(users[index])
})

mock.onDelete(/\/users\/\d+/).reply((config: MockConfig): MockReply<boolean> => {
  const id = getIdFromUrl(config)
  const index = users.findIndex((item) => item.id === id)
  users.splice(index, 1)
  return ok(true)
})

mock.onGet('/roles').reply((config: MockConfig): MockReply<PaginationResult<RoleItem>> => {
  const { current, pageSize, keyword } = getPageParams(config)
  const filtered = roles.filter((item) => !keyword || [item.name, item.code].some((field) => field.toLowerCase().includes(keyword)))
  return ok(paginate(filtered, current, pageSize))
})

mock.onPost('/roles').reply((config: MockConfig): MockReply<RoleItem> => {
  const payload = parseBody<Partial<RoleItem>>(config)
  const item: RoleItem = { id: roles.length + 1, createdAt: '2026-03-23 11:00:00', ...payload } as RoleItem
  roles.unshift(item)
  return ok(item)
})

mock.onPut(/\/roles\/\d+/).reply((config: MockConfig): MockReply<RoleItem> => {
  const id = getIdFromUrl(config)
  const index = roles.findIndex((item) => item.id === id)
  roles[index] = { ...roles[index], ...parseBody<Partial<RoleItem>>(config) }
  return ok(roles[index])
})

mock.onDelete(/\/roles\/\d+/).reply((config: MockConfig): MockReply<boolean> => {
  const id = getIdFromUrl(config)
  const index = roles.findIndex((item) => item.id === id)
  roles.splice(index, 1)
  return ok(true)
})
