import type { PermissionTreeNode, PermissionTreeRawNode } from '@/types'
import type { Permission } from '@/types/permissionPreset'

type ModuleNode = {
  key: string
  value: string
  title: string
  children: PermissionTreeNode[]
}

const moduleTitleMap: Record<string, string> = {
  customer: '客户管理',
  customers: '客户管理',
  order: '订单管理',
  orders: '订单管理',
  user: '用户管理',
  users: '用户管理',
  role: '角色管理',
  roles: '角色管理',
  dashboard: '仪表盘',
  profile: '个人中心',
  permissionPreset: '权限预设管理',
  permission_presets: '权限预设管理',
  customer_followups: '客户跟进',
  customer_follow_ups: '客户跟进',
  contracts: '合同管理',
  payments: '回款管理',
  notifications: '通知中心',
}

export const getPermissionModuleLabel = (moduleKey: string) => {
  const normalized = moduleKey.trim()
  if (!normalized) {
    return '其他'
  }
  return moduleTitleMap[normalized] ?? moduleTitleMap[normalized.toLowerCase()] ?? normalized
}

export const transformPermissionTree = (permissions: Permission[]): PermissionTreeNode[] => {
  const modules = new Map<string, ModuleNode>()

  permissions.forEach((permission) => {
    const moduleKey = permission.module || 'default'

    if (!modules.has(moduleKey)) {
      modules.set(moduleKey, {
        key: moduleKey,
        value: moduleKey,
        title: getPermissionModuleLabel(moduleKey),
        children: [],
      })
    }

    const moduleNode = modules.get(moduleKey)!
    moduleNode.children.push({
      key: permission.code,
      value: permission.code,
      title: permission.name || permission.code,
    })
  })

  return Array.from(modules.values())
    .sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
    .map((moduleNode) => ({
      ...moduleNode,
      children: moduleNode.children.sort((a, b) => String(a.title).localeCompare(String(b.title), 'zh-CN')),
    }))
}

export const buildPermissionTreeFromList = transformPermissionTree

export const filterPermissionTree = (tree: PermissionTreeNode[], keyword: string): PermissionTreeNode[] => {
  const normalized = keyword.trim().toLowerCase()
  if (!normalized) {
    return tree
  }

  const walk = (nodes: PermissionTreeNode[]): PermissionTreeNode[] => nodes
    .map((node) => {
      const titleMatched = String(node.title).toLowerCase().includes(normalized)
      const children = node.children ? walk(node.children) : undefined
      if (titleMatched || (children && children.length > 0)) {
        return {
          ...node,
          children,
        }
      }
      return null
    })
    .filter(Boolean) as PermissionTreeNode[]

  return walk(tree)
}

export const flattenPermissionCodes = (tree: PermissionTreeRawNode[]): string[] => tree.flatMap((node) => {
  const own = node.children?.length ? [] : [node.code]
  return [...own, ...(node.children ? flattenPermissionCodes(node.children) : [])]
})
