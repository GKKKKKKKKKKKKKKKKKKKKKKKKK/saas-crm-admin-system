import { Drawer } from 'antd'
import type { PermissionPreset } from '@/types/permissionPreset'
import PermissionPresetListPanel from './PermissionPresetListPanel'

interface PermissionPresetDrawerProps {
  open: boolean
  refreshKey?: number
  onClose: () => void
  onCreatePreset: () => void
  onEditPreset: (preset: PermissionPreset) => void
}

const PermissionPresetDrawer = ({ open, refreshKey = 0, onClose, onCreatePreset, onEditPreset }: PermissionPresetDrawerProps) => {
  return (
    <Drawer
      title="权限预设管理"
      open={open}
      onClose={onClose}
      width={1080}
      destroyOnClose={false}
      maskClosable
    >
      <PermissionPresetListPanel
        embedded
        refreshKey={refreshKey}
        onCreatePreset={onCreatePreset}
        onEditPreset={onEditPreset}
      />
    </Drawer>
  )
}

export default PermissionPresetDrawer
