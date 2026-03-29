import { AppstoreAddOutlined, DeleteOutlined, DownOutlined, EditOutlined, EyeOutlined, FileSearchOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Card, Dropdown, Form, Input, Modal, Popconfirm, Select, Space, TreeSelect } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createRoleApi, deleteRoleApi, getRolesApi, updateRoleApi } from '@/api/roles'
import { getPermissionsApi } from '@/api/permissions'
import { createPermissionPresetApi, getPermissionPresetDetailApi, getPermissionPresetOptionsApi, updatePermissionPresetApi } from '@/api/permissionPreset'
import type { PermissionCode, RoleItem } from '@/types'
import type { PermissionPreset, PermissionPresetOption } from '@/types/permissionPreset'
import SearchForm from '@/components/SearchForm'
import PageTable from '@/components/PageTable'
import PermissionButton from '@/components/PermissionButton'
import ListToolbar from '@/components/ListToolbar'
import { exportToCsv } from '@/utils/export'
import { useOperationLog } from '@/hooks/useOperationLog'
import OperationLogDrawer from '@/components/OperationLogDrawer'
import { feedback } from '@/utils/feedback'
import { getFallbackPage, isFilterActive } from '@/utils/list'
import { useListQueryState } from '@/hooks/useListQueryState'
import { useEmptyResultPrompt } from '@/hooks/useEmptyResultPrompt'
import RowActions from '@/components/RowActions'
import { usePermission } from '@/hooks/usePermission'
import { buildPermissionTreeFromList } from '@/utils/permission'
import PresetFormModal from '@/pages/PermissionPresets/components/PresetFormModal'
import PermissionPresetDrawer from './components/PermissionPresetDrawer'
import { isFormValidationError } from '@/utils/form'

const RolesPage = () => {
  const queryState = useListQueryState({ fields: [{ key: 'keyword' }] })
  const [list, setList] = useState<RoleItem[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [tableLoading, setTableLoading] = useState(false)
  const [permissionLoading, setPermissionLoading] = useState(false)
  const [presetLoading, setPresetLoading] = useState(false)
  const [presetApplying, setPresetApplying] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState<RoleItem | null>(null)
  const [open, setOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [permissionTree, setPermissionTree] = useState<ReturnType<typeof buildPermissionTreeFromList>>([])
  const [permissionFilter, setPermissionFilter] = useState('')
  const [presetOptions, setPresetOptions] = useState<PermissionPresetOption[]>([])
  const [selectedPresetId, setSelectedPresetId] = useState<number | undefined>()
  const [presetDrawerOpen, setPresetDrawerOpen] = useState(false)
  const [presetFormOpen, setPresetFormOpen] = useState(false)
  const [presetSubmitting, setPresetSubmitting] = useState(false)
  const [presetCurrent, setPresetCurrent] = useState<PermissionPreset | null>(null)
  const [presetRefreshKey, setPresetRefreshKey] = useState(0)
  const [form] = Form.useForm()
  const { logs, recordLog, refreshLogs } = useOperationLog('roles')
  const canUpdate = usePermission('roles.update')
  const canDelete = usePermission('roles.delete')
  const emptyResultPrompt = useEmptyResultPrompt()

  const fetchRoles = useCallback(async () => {
    setTableLoading(true)
    try {
      const result = await getRolesApi({ current: queryState.page, pageSize: queryState.pageSize, ...queryState.filters })
      setList(result.list)
      setTotal(result.total)
      emptyResultPrompt.onFetchSuccess({
        listLength: result.list.length,
        total: result.total,
        page: queryState.page,
      })

      if (queryState.page > 1 && result.list.length === 0 && result.total > 0) {
        const fallbackPage = getFallbackPage(queryState.page, queryState.pageSize, result.total, 0)
        if (fallbackPage !== queryState.page) {
          queryState.setQueryState({ page: fallbackPage })
        }
      }
    } catch {
    } finally {
      setTableLoading(false)
    }
  }, [queryState.filters, queryState.page, queryState.pageSize])

  const fetchPermissions = useCallback(async () => {
    setPermissionLoading(true)
    try {
      const permissions = await getPermissionsApi()
      setPermissionTree(buildPermissionTreeFromList(permissions))
    } catch {
      feedback.error('权限树加载失败，不影响角色列表查询')
      setPermissionTree([])
    } finally {
      setPermissionLoading(false)
    }
  }, [])

  const fetchPermissionPresetOptions = useCallback(async () => {
    setPresetLoading(true)
    try {
      const options = await getPermissionPresetOptionsApi()
      setPresetOptions(options)
    } catch {
      feedback.error('权限预设加载失败，不影响角色列表查询')
      setPresetOptions([])
    } finally {
      setPresetLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchRoles()
  }, [fetchRoles])

  useEffect(() => {
    void fetchPermissions()
  }, [fetchPermissions])

  useEffect(() => {
    void fetchPermissionPresetOptions()
  }, [fetchPermissionPresetOptions])

  const refreshAfterMutation = (removedCount = 0) => {
    const nextPage = getFallbackPage(queryState.page, queryState.pageSize, total, removedCount)
    if (nextPage !== queryState.page) {
      queryState.setQueryState({ page: nextPage })
      return
    }
    void fetchRoles()
  }

  const handleDelete = async (item: RoleItem) => {
    if (item.code === 'admin') {
      feedback.warning('内置 admin 角色不可删除')
      return
    }
    try {
      await deleteRoleApi(item.id)
      feedback.success('删除成功')
      recordLog({ module: 'roles', action: 'delete', target: item.name, description: `删除角色 ${item.name}` })
      refreshAfterMutation(1)
    } catch {
      feedback.error('删除失败，请稍后重试')
    }
  }

  const handleBatchDelete = async () => {
    const idSet = new Set(selectedRowKeys)
    const targets = list.filter((item) => idSet.has(item.id) && item.code !== 'admin')
    if (!targets.length) {
      feedback.warning('未选择可删除角色')
      return
    }
    const results = await Promise.allSettled(targets.map((item) => deleteRoleApi(item.id)))
    const successCount = results.filter((item) => item.status === 'fulfilled').length
    if (successCount) {
      feedback.success(`批量删除成功，共 ${successCount} 条`)
      recordLog({ module: 'roles', action: 'batch_delete', target: `${successCount}个角色`, description: `批量删除角色 ${targets.map((item) => item.name).join('、')}` })
    }
    if (successCount < targets.length) {
      feedback.error(`批量删除失败 ${targets.length - successCount} 条`)
    }
    setSelectedRowKeys([])
    refreshAfterMutation(successCount)
  }

  const columns: ColumnsType<RoleItem> = [
    { title: '角色名称', dataIndex: 'name' },
    { title: '角色编码', dataIndex: 'code' },
    { title: '描述', dataIndex: 'description' },
    { title: '权限数', render: (_, record) => record.permissions.length },
    { title: '创建时间', dataIndex: 'createdAt' },
    {
      title: '操作',
      width: 180,
      render: (_, record) => (
        <RowActions
          items={[
            {
              key: 'edit',
              label: '编辑',
              icon: <EditOutlined />,
              onClick: () => {
                setCurrent(record)
                setSelectedPresetId(undefined)
                form.setFieldsValue(record)
                setOpen(true)
              },
              hidden: !canUpdate,
            },
            {
              key: 'delete',
              label: '删除',
              icon: <DeleteOutlined />,
              danger: true,
              hidden: !canDelete || record.code === 'admin',
              render: (node) => (
                <Popconfirm title="确认删除该记录吗？" description="此操作不可恢复" onConfirm={async () => { await handleDelete(record) }} okText="确认" cancelText="取消">
                  <span>{node}</span>
                </Popconfirm>
              ),
            },
          ]}
        />
      ),
    },
  ]

  const applyPresetById = async (presetId: number) => {
    if (presetApplying) {
      return
    }
    setPresetApplying(true)
    try {
      const detail = await getPermissionPresetDetailApi(presetId)
      const permissionCodes = detail.permissions.map((permission) => permission.code as PermissionCode)
      form.setFieldValue('permissions', permissionCodes)
      setSelectedPresetId(presetId)
      feedback.success(`已应用预设：${detail.name}`)
    } catch {
      feedback.error('应用预设失败，请稍后重试')
    } finally {
      setPresetApplying(false)
    }
  }

  const handlePresetSelect = async (value?: number) => {
    if (value === selectedPresetId) {
      return
    }

    if (!value) {
      setSelectedPresetId(undefined)
      return
    }

    const selectedPermissions = (form.getFieldValue('permissions') ?? []) as string[]
    if (selectedPermissions.length > 0) {
      feedback.confirm('切换预设将覆盖当前已选权限，是否继续？', async () => {
        await applyPresetById(value)
      })
      return
    }

    await applyPresetById(value)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const values = await form.validateFields()
      const selectedPermissions = (values.permissions ?? []) as PermissionCode[]
      const payload = { ...values, permissions: selectedPermissions }
      if (current) {
        await updateRoleApi(current.id, payload)
        feedback.success('保存成功')
        recordLog({ module: 'roles', action: 'edit_save', target: current.name, description: `更新角色 ${current.name}` })
      } else {
        const created = await createRoleApi(payload)
        feedback.success('保存成功')
        recordLog({ module: 'roles', action: 'edit_save', target: created.name, description: `新增角色 ${created.name}` })
      }
      setOpen(false)
      setCurrent(null)
      setSelectedPresetId(undefined)
      form.resetFields()
      void fetchRoles()
    } catch (error) {
      if (isFormValidationError(error)) {
        return
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenPresetDrawer = () => {
    setPresetDrawerOpen(true)
  }

  const handleOpenCreatePreset = () => {
    setPresetCurrent(null)
    setPresetFormOpen(true)
  }

  const handleOpenEditPreset = (preset: PermissionPreset) => {
    setPresetCurrent(preset)
    setPresetFormOpen(true)
  }

  const handleClosePresetForm = () => {
    setPresetFormOpen(false)
    setPresetCurrent(null)
  }

  const handleSubmitPresetForm = async (values: { name: string; code: string; description?: string; permissionCodes: string[] }) => {
    setPresetSubmitting(true)
    try {
      if (presetCurrent) {
        await updatePermissionPresetApi(presetCurrent.id, values)
        feedback.success('更新成功')
      } else {
        await createPermissionPresetApi(values)
        feedback.success('创建成功')
      }
      handleClosePresetForm()
      setPresetRefreshKey((value) => value + 1)
      void fetchPermissionPresetOptions()
    } catch {
    } finally {
      setPresetSubmitting(false)
    }
  }

  const handleExport = async (selectedOnly: boolean) => {
    try {
      const rows = selectedOnly
        ? list.filter((item) => selectedRowKeys.includes(item.id))
        : (await getRolesApi({ ...queryState.filters, current: 1, pageSize: 2000 })).list

      if (!rows.length) {
        feedback.warning('当前筛选结果为空，无法导出')
        return
      }

      const ok = exportToCsv<RoleItem>('角色列表', [
        { title: '角色名称', dataIndex: 'name' },
        { title: '角色编码', dataIndex: 'code' },
        { title: '描述', dataIndex: 'description' },
        { title: '权限数量', dataIndex: 'permissions', formatter: (value) => Array.isArray(value) ? String(value.length) : '0' },
        { title: '创建时间', dataIndex: 'createdAt' },
      ], rows)

      if (ok) {
        feedback.success('导出成功')
        recordLog({ module: 'roles', action: 'export', target: selectedOnly ? '选中角色' : '筛选结果', description: `导出角色数据 ${rows.length} 条` })
      }
    } catch {
      feedback.error('导出失败，请稍后重试')
    }
  }

  const hasSelection = useMemo(() => selectedRowKeys.length > 0, [selectedRowKeys])
  const batchItems: MenuProps['items'] = [
    {
      key: 'delete',
      label: '批量删除',
      danger: true,
      onClick: () => feedback.confirm('确认批量删除选中角色？', async () => handleBatchDelete()),
    },
  ]
  const exportItems: MenuProps['items'] = [
    {
      key: 'all',
      label: '导出筛选结果',
      onClick: () => void handleExport(false),
    },
    {
      key: 'selected',
      label: '导出选中项',
      disabled: !hasSelection,
      onClick: () => void handleExport(true),
    },
  ]

  const filteredTree = useMemo(() => {
    const keyword = permissionFilter.trim().toLowerCase()
    if (!keyword) {
      return permissionTree
    }

    const walk = (nodes: typeof permissionTree): typeof permissionTree => nodes
      .map((node) => {
        const titleMatched = String(node.title).toLowerCase().includes(keyword)
        const children = node.children
          ? node.children.filter((child) => String(child.title).toLowerCase().includes(keyword))
          : undefined
        if (titleMatched || (children && children.length > 0)) {
          return {
            ...node,
            children,
          }
        }
        return null
      })
      .filter(Boolean) as typeof permissionTree

    return walk(permissionTree)
  }, [permissionFilter, permissionTree])

  return (
    <>
      <SearchForm
        fields={[{ name: 'keyword', label: '关键词', placeholder: '角色名称/编码' }]}
        initialValues={queryState.filters}
        loading={tableLoading}
        onSearch={(values) => {
          emptyResultPrompt.markTriggered(values)
          queryState.setQueryState({ page: 1, filters: values })
        }}
        onReset={() => {
          emptyResultPrompt.markTriggered({})
          queryState.reset()
        }}
      />
      <Card className="page-card table-card" bordered={false}>
        <ListToolbar
          left={(
            <>
              <Dropdown menu={{ items: batchItems }} disabled={!hasSelection}>
                <PermissionButton permission="roles.batch" disabled={!hasSelection}>
                  批量操作
                  <DownOutlined />
                </PermissionButton>
              </Dropdown>
              <Dropdown menu={{ items: exportItems }}>
                <PermissionButton permission="roles.export">
                  导出
                  <DownOutlined />
                </PermissionButton>
              </Dropdown>
              <Button icon={<FileSearchOutlined />} onClick={() => { refreshLogs(); setLogOpen(true) }}>操作日志</Button>
            </>
          )}
          right={(
            <Space size={8}>
              <PermissionButton permission="permissionPreset.read" type="primary" icon={<EyeOutlined />} onClick={handleOpenPresetDrawer}>
                查看权限预设管理
              </PermissionButton>
              <PermissionButton permission="permissionPreset.create" type="primary" icon={<AppstoreAddOutlined />} onClick={handleOpenCreatePreset}>
                新增预设角色
              </PermissionButton>
              <PermissionButton permission="roles.create" type="primary" icon={<PlusOutlined />} onClick={() => { setCurrent(null); setSelectedPresetId(undefined); form.resetFields(); setOpen(true) }}>
                新增角色
              </PermissionButton>
            </Space>
          )}
        />
        <PageTable rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys as number[]) }} columns={columns} dataSource={list} loading={tableLoading} total={total} page={queryState.page} pageSize={queryState.pageSize} onPageChange={(nextPage, nextPageSize) => queryState.setQueryState({ page: nextPage, pageSize: nextPageSize })} />
        {!tableLoading && !list.length && isFilterActive(queryState.filters) && <div className="table-filter-tip">当前筛选条件下暂无数据，请调整条件后重试</div>}
      </Card>
      <Modal title={current ? '编辑角色' : '新增角色'} open={open} onOk={() => void handleSubmit()} onCancel={() => setOpen(false)} width={720} destroyOnClose confirmLoading={submitting}>
        <Form form={form} layout="vertical">
          <Form.Item label="角色名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="角色编码" name="code" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="角色描述" name="description" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="权限预设">
            <Select
              allowClear
              loading={presetLoading}
              disabled={presetLoading || presetApplying}
              value={selectedPresetId}
              placeholder="可选：选择权限预设快速填充"
              options={presetOptions}
              optionFilterProp="label"
              showSearch
              onChange={(value) => {
                void handlePresetSelect(value)
              }}
            />
          </Form.Item>
          <Form.Item label="权限分配" name="permissions" rules={[{ required: true }]}>
            <div>
              <Space style={{ marginBottom: 8 }}>
                <Input.Search allowClear disabled={permissionLoading} placeholder={permissionLoading ? '权限加载中' : '过滤权限'} style={{ width: 260 }} value={permissionFilter} onChange={(event) => setPermissionFilter(event.target.value)} />
                <Button icon={<ReloadOutlined />} onClick={() => form.setFieldValue('permissions', [])}>重置权限</Button>
              </Space>
              <TreeSelect
                treeData={filteredTree}
                treeCheckable
                treeDefaultExpandAll
                showCheckedStrategy={TreeSelect.SHOW_PARENT}
                placeholder={permissionLoading ? '权限加载中' : '请选择权限'}
                style={{ width: '100%' }}
                disabled={permissionLoading}
              />
            </div>
          </Form.Item>
        </Form>
      </Modal>
      <PermissionPresetDrawer
        open={presetDrawerOpen}
        onClose={() => setPresetDrawerOpen(false)}
        onCreatePreset={handleOpenCreatePreset}
        onEditPreset={handleOpenEditPreset}
        refreshKey={presetRefreshKey}
      />
      <PresetFormModal
        open={presetFormOpen}
        loading={presetSubmitting}
        permissionsTree={permissionTree}
        initialValue={presetCurrent}
        onCancel={handleClosePresetForm}
        onSubmit={handleSubmitPresetForm}
      />
      <OperationLogDrawer open={logOpen} onClose={() => setLogOpen(false)} logs={logs} />
    </>
  )
}

export default RolesPage
