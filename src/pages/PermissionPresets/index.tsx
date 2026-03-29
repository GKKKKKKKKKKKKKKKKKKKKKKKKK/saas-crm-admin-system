import { useCallback, useEffect, useState } from 'react'
import { Card } from 'antd'
import { createPermissionPresetApi, updatePermissionPresetApi } from '@/api/permissionPreset'
import { getPermissionsApi } from '@/api/permissions'
import { feedback } from '@/utils/feedback'
import type { PermissionPreset } from '@/types/permissionPreset'
import { buildPermissionTreeFromList } from '@/utils/permission'
import PresetFormModal from './components/PresetFormModal'
import PermissionPresetListPanel from '@/pages/roles/components/PermissionPresetListPanel'

const PermissionPresetsPage = () => {
  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [current, setCurrent] = useState<PermissionPreset | null>(null)
  const [permissionsTree, setPermissionsTree] = useState<ReturnType<typeof buildPermissionTreeFromList>>([])

  const loadPermissions = useCallback(async () => {
    try {
      const permissions = await getPermissionsApi()
      setPermissionsTree(buildPermissionTreeFromList(permissions))
    } catch {
      feedback.error('权限树加载失败，请稍后重试')
    }
  }, [])

  useEffect(() => {
    void loadPermissions()
  }, [loadPermissions])

  const handleOpenCreatePreset = () => {
    setCurrent(null)
    setFormOpen(true)
  }

  const handleOpenEditPreset = (preset: PermissionPreset) => {
    setCurrent(preset)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setCurrent(null)
  }

  const handleSubmit = async (values: { name: string; code: string; description?: string; permissionCodes: string[] }) => {
    setSubmitting(true)
    try {
      if (current) {
        await updatePermissionPresetApi(current.id, values)
        feedback.success('更新成功')
      } else {
        await createPermissionPresetApi(values)
        feedback.success('创建成功')
      }
      handleCloseForm()
      setRefreshKey((value) => value + 1)
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="page-card" bordered={false}>
      <PermissionPresetListPanel
        refreshKey={refreshKey}
        onCreatePreset={handleOpenCreatePreset}
        onEditPreset={handleOpenEditPreset}
      />
      <PresetFormModal
        open={formOpen}
        loading={submitting}
        permissionsTree={permissionsTree}
        initialValue={current}
        onCancel={handleCloseForm}
        onSubmit={handleSubmit}
      />
    </Card>
  )
}

export default PermissionPresetsPage
