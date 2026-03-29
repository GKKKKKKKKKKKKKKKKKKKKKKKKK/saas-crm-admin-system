export interface Permission {
  id: number
  name: string
  code: string
  module: string
}

export interface PermissionPreset {
  id: number
  name: string
  code: string
  description?: string
  permissions: Permission[]
  permissionIds?: number[]
  permissionCodes?: string[]
  createdAt: string
  updatedAt: string
}

export interface PermissionPresetListItem {
  id: number
  name: string
  code: string
  description?: string
  permissionCount: number
  createdAt: string
  updatedAt: string
}

export interface PermissionPresetOption {
  label: string
  value: number
  code: string
  description?: string
  permissionCount: number
}
