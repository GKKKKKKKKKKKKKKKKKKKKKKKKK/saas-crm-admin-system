import { Button, Tooltip } from 'antd'
import type { ButtonProps } from 'antd'
import type { PermissionCode } from '@/types'
import { usePermission } from '@/hooks/usePermission'

interface PermissionButtonProps extends ButtonProps {
  permission?: PermissionCode | PermissionCode[]
  noPermissionMode?: 'hide' | 'disable'
  noPermissionText?: string
}

const PermissionButton = ({ permission, noPermissionMode = 'hide', noPermissionText = '暂无权限', ...props }: PermissionButtonProps) => {
  const allowed = usePermission(permission)

  if (allowed) {
    return <Button {...props} />
  }

  if (noPermissionMode === 'disable') {
    return (
      <Tooltip title={noPermissionText}>
        <Button {...props} disabled />
      </Tooltip>
    )
  }

  return null
}

export default PermissionButton
