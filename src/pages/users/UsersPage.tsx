import { CopyOutlined, DeleteOutlined, DownOutlined, EditOutlined, FileSearchOutlined, MailOutlined, PlusOutlined, SettingOutlined, StopOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Checkbox, Dropdown, Form, Input, Modal, Popconfirm, Popover, Select, Space, Switch, Typography, message } from 'antd'
import type { MenuProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createUserApi, deleteUserApi, getUsersApi, inviteUserApi, updateUserApi } from '@/api/users'
import { getRolesApi } from '@/api/roles'
import type { SystemUser } from '@/types'
import SearchForm from '@/components/SearchForm'
import PageTable from '@/components/PageTable'
import PermissionButton from '@/components/PermissionButton'
import ListToolbar from '@/components/ListToolbar'
import StatusTag from '@/components/StatusTag'
import RowActions from '@/components/RowActions'
import { exportToCsv } from '@/utils/export'
import { useOperationLog } from '@/hooks/useOperationLog'
import OperationLogDrawer from '@/components/OperationLogDrawer'
import { feedback } from '@/utils/feedback'
import { getFallbackPage, isFilterActive } from '@/utils/list'
import { useListQueryState } from '@/hooks/useListQueryState'
import { useEmptyResultPrompt } from '@/hooks/useEmptyResultPrompt'
import { useColumnSettings } from '@/hooks/useColumnSettings'
import { usePermission } from '@/hooks/usePermission'
import { isFormValidationError } from '@/utils/form'
import { copyText } from '@/utils/clipboard'

const defaultRoleOptions = [{ label: '超级管理员', value: 1 }, { label: '销售经理', value: 2 }, { label: '运营专员', value: 3 }, { label: '访客', value: 4 }]

const UsersPage = () => {
  const queryState = useListQueryState({
    fields: [
      { key: 'keyword' },
      { key: 'status', type: 'boolean' },
      { key: 'roleId', type: 'number' },
      { key: 'createdAtStart' },
      { key: 'createdAtEnd' },
    ],
  })
  const [list, setList] = useState<SystemUser[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState<SystemUser | null>(null)
  const [open, setOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteSubmitting, setInviteSubmitting] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [roleOptions, setRoleOptions] = useState(defaultRoleOptions)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm()
  const [inviteForm] = Form.useForm()
  const { logs, recordLog, refreshLogs } = useOperationLog('users')
  const canUpdate = usePermission('users.update')
  const canDelete = usePermission('users.delete')
  const emptyResultPrompt = useEmptyResultPrompt()

  const columnSettings = useColumnSettings('users', [
    { key: 'name', label: '姓名', defaultVisible: true },
    { key: 'username', label: '用户名', defaultVisible: true },
    { key: 'email', label: '邮箱', defaultVisible: true },
    { key: 'mobile', label: '手机', defaultVisible: true },
    { key: 'status', label: '状态', defaultVisible: true },
    { key: 'createdAt', label: '创建时间', defaultVisible: true },
    { key: 'operation', label: '操作', fixedVisible: true },
  ])

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getUsersApi({
        current: queryState.page,
        pageSize: queryState.pageSize,
        ...queryState.filters,
      })
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
      setLoading(false)
    }
  }, [queryState.filters, queryState.page, queryState.pageSize])

  useEffect(() => {
    void fetchList()
  }, [fetchList])

  useEffect(() => {
    const loadRoleOptions = async () => {
      try {
        const result = await getRolesApi({ current: 1, pageSize: 100 })
        if (!result.list.length) {
          return
        }
        setRoleOptions(result.list.map((item) => ({ label: item.name, value: item.id })))
      } catch {
      }
    }
    void loadRoleOptions()
  }, [])

  const refreshAfterMutation = (removedCount = 0) => {
    const nextPage = getFallbackPage(queryState.page, queryState.pageSize, total, removedCount)
    if (nextPage !== queryState.page) {
      queryState.setQueryState({ page: nextPage })
      return
    }
    void fetchList()
  }

  const columns = useMemo(() => {
    const allColumns: ColumnsType<SystemUser> = [
      { title: '姓名', dataIndex: 'name', key: 'name' },
      { title: '用户名', dataIndex: 'username', key: 'username' },
      { title: '邮箱', dataIndex: 'email', key: 'email' },
      { title: '手机', dataIndex: 'mobile', key: 'mobile' },
      { title: '状态', dataIndex: 'status', key: 'status', width: 120, render: (value) => <StatusTag status={value} text={value ? '启用' : '停用'} /> },
      { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
      {
        title: '操作',
        key: 'operation',
        width: 220,
        render: (_, record) => (
          <RowActions
            items={[
              {
                key: 'edit',
                label: '编辑',
                icon: <EditOutlined />,
                onClick: () => { setCurrent(record); setOpen(true); form.setFieldsValue(record) },
                hidden: !canUpdate,
              },
              {
                key: 'status',
                label: record.status ? '禁用' : '启用',
                icon: <StopOutlined />,
                onClick: async () => {
                  try {
                    await updateUserApi(record.id, { status: !record.status })
                    feedback.success('状态更新成功')
                    recordLog({ module: 'users', action: 'status_update', target: record.username, description: `用户状态改为${!record.status ? '启用' : '停用'}` })
                    void fetchList()
                  } catch {
                    feedback.error('状态更新失败，请稍后重试')
                  }
                },
                hidden: !canUpdate,
              },
              {
                key: 'delete',
                label: '删除',
                icon: <DeleteOutlined />,
                danger: true,
                hidden: !canDelete,
                render: (node) => (
                  <Popconfirm title="确认删除该记录吗？" description="此操作不可恢复" onConfirm={async () => {
                    try {
                      await deleteUserApi(record.id)
                      feedback.success('删除成功')
                      recordLog({ module: 'users', action: 'delete', target: record.username, description: `删除用户 ${record.username}` })
                      refreshAfterMutation(1)
                    } catch {
                      feedback.error('删除失败，请稍后重试')
                    }
                  }} okText="确认" cancelText="取消">
                    <span>{node}</span>
                  </Popconfirm>
                ),
              },
            ]}
          />
        ),
      },
    ]
    return allColumns.filter((item) => columnSettings.visibleKeys.includes(String(item.key)))
  }, [columnSettings.visibleKeys, fetchList, form, recordLog])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload = { ...values, roleIds: values.roleIds ?? [] }
      setSubmitting(true)
      if (current) {
        await updateUserApi(current.id, payload)
        feedback.success('保存成功')
        recordLog({ module: 'users', action: 'edit_save', target: current.username, description: `更新用户 ${current.username}` })
      } else {
        const created = await createUserApi(payload)
        feedback.success('保存成功')
        recordLog({ module: 'users', action: 'edit_save', target: created.username, description: `新增用户 ${created.username}` })
      }
      setOpen(false)
      setCurrent(null)
      form.resetFields()
      void fetchList()
    } catch (error) {
      if (isFormValidationError(error)) {
        return
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleBatchDelete = async () => {
    const idSet = new Set(selectedRowKeys)
    const targets = list.filter((item) => idSet.has(item.id))
    const results = await Promise.allSettled(targets.map((item) => deleteUserApi(item.id)))
    const successCount = results.filter((item) => item.status === 'fulfilled').length
    if (successCount) {
      feedback.success(`批量删除成功，共 ${successCount} 条`)
      recordLog({ module: 'users', action: 'batch_delete', target: `${successCount}个用户`, description: `批量删除用户 ${targets.map((item) => item.username).join('、')}` })
    }
    if (successCount < targets.length) {
      feedback.error(`批量删除失败 ${targets.length - successCount} 条`)
    }
    setSelectedRowKeys([])
    refreshAfterMutation(successCount)
  }

  const handleBatchStatus = async (status: boolean) => {
    const idSet = new Set(selectedRowKeys)
    const targets = list.filter((item) => idSet.has(item.id))
    const results = await Promise.allSettled(targets.map((item) => updateUserApi(item.id, { status })))
    const successCount = results.filter((item) => item.status === 'fulfilled').length
    if (successCount) {
      feedback.success(`批量更新状态成功，共 ${successCount} 条`)
      recordLog({ module: 'users', action: 'batch_status_update', target: `${successCount}个用户`, description: `批量更新用户状态为${status ? '启用' : '停用'}` })
    }
    if (successCount < targets.length) {
      feedback.error(`批量更新状态失败 ${targets.length - successCount} 条`)
    }
    setSelectedRowKeys([])
    void fetchList()
  }

  const handleExport = async (selectedOnly: boolean) => {
    try {
      const rows = selectedOnly
        ? list.filter((item) => selectedRowKeys.includes(item.id))
        : (await getUsersApi({ ...queryState.filters, current: 1, pageSize: 2000 })).list

      if (!rows.length) {
        feedback.warning('当前筛选结果为空，无法导出')
        return
      }

      const ok = exportToCsv<SystemUser>('用户列表', [
        { title: '姓名', dataIndex: 'name' },
        { title: '用户名', dataIndex: 'username' },
        { title: '邮箱', dataIndex: 'email' },
        { title: '手机号', dataIndex: 'mobile' },
        { title: '状态', dataIndex: 'status', formatter: (value) => (value ? '启用' : '停用') },
        { title: '角色ID', dataIndex: 'roleIds', formatter: (value) => Array.isArray(value) ? value.join('|') : '' },
        { title: '创建时间', dataIndex: 'createdAt' },
      ], rows)

      if (ok) {
        feedback.success('导出成功')
        recordLog({ module: 'users', action: 'export', target: selectedOnly ? '选中用户' : '筛选结果', description: `导出用户数据 ${rows.length} 条` })
      }
    } catch {
      feedback.error('导出失败，请稍后重试')
    }
  }

  const handleInviteSubmit = async () => {
    try {
      const values = await inviteForm.validateFields()
      setInviteSubmitting(true)
      const result = await inviteUserApi({ email: values.email, role_id: Number(values.role_id) })
      setInviteLink(result.invite_link)
      feedback.success('邀请发送成功')
      recordLog({ module: 'users', action: 'edit_save', target: values.email, description: `邀请成员 ${values.email}` })
    } catch (error) {
      if (isFormValidationError(error)) {
        return
      }
    } finally {
      setInviteSubmitting(false)
    }
  }

  const openInviteModal = () => {
    inviteForm.resetFields()
    setInviteLink('')
    setInviteOpen(true)
  }

  const copyInviteLink = async () => {
    if (!inviteLink) {
      return
    }
    const copied = await copyText(inviteLink)
    if (copied) {
      messageApi.success('复制成功')
      return
    }
    messageApi.error('复制失败，请手动复制')
  }

  const hasSelection = useMemo(() => selectedRowKeys.length > 0, [selectedRowKeys])
  const batchItems: MenuProps['items'] = [
    {
      key: 'delete',
      label: '批量删除',
      danger: true,
      onClick: () => feedback.confirm('确认批量删除选中用户？', async () => handleBatchDelete()),
    },
    {
      key: 'enable',
      label: '批量启用',
      onClick: () => feedback.confirm('确认批量启用选中用户？', async () => handleBatchStatus(true)),
    },
    {
      key: 'disable',
      label: '批量停用',
      onClick: () => feedback.confirm('确认批量停用选中用户？', async () => handleBatchStatus(false)),
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
  const initialSearchValues = useMemo(() => ({
    ...queryState.filters,
    createdAtRange:
      queryState.filters.createdAtStart && queryState.filters.createdAtEnd
        ? [dayjs(String(queryState.filters.createdAtStart)), dayjs(String(queryState.filters.createdAtEnd))]
        : undefined,
  }), [queryState.filters])

  return (
    <>
      {contextHolder}
      <SearchForm
        loading={loading}
        initialValues={initialSearchValues}
        fields={[
          { name: 'keyword', label: '关键词', placeholder: '姓名/用户名/邮箱' },
          { name: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: true }, { label: '停用', value: false }] },
          { name: 'roleId', label: '角色', type: 'select', options: roleOptions },
          { name: 'createdAtRange', label: '创建时间', type: 'dateRange' },
        ]}
        onSearch={(values) => {
          const { createdAtRange, ...rest } = values
          const range = createdAtRange as dayjs.Dayjs[] | undefined
          const nextFilters = {
            ...rest,
            createdAtStart: range?.[0]?.startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            createdAtEnd: range?.[1]?.endOf('day').format('YYYY-MM-DD HH:mm:ss'),
          }
          emptyResultPrompt.markTriggered(nextFilters)
          queryState.setQueryState({
            page: 1,
            filters: nextFilters,
          })
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
                <PermissionButton permission="users.batch" disabled={!hasSelection}>
                  批量操作
                  <DownOutlined />
                </PermissionButton>
              </Dropdown>
              <Dropdown menu={{ items: exportItems }}>
                <PermissionButton permission="users.export">
                  导出
                  <DownOutlined />
                </PermissionButton>
              </Dropdown>
              <Button icon={<FileSearchOutlined />} onClick={() => { refreshLogs(); setLogOpen(true) }}>操作日志</Button>
            </>
          )}
          right={(
            <>
              <Popover
                trigger="click"
                content={<Space direction="vertical">{[
                { key: 'name', label: '姓名', fixedVisible: false },
                { key: 'username', label: '用户名', fixedVisible: false },
                { key: 'email', label: '邮箱', fixedVisible: false },
                { key: 'mobile', label: '手机', fixedVisible: false },
                { key: 'status', label: '状态', fixedVisible: false },
                { key: 'createdAt', label: '创建时间', fixedVisible: false },
                { key: 'operation', label: '操作', fixedVisible: true },
              ].map((item) => <Checkbox key={item.key} checked={columnSettings.visibleMap[item.key]} disabled={item.fixedVisible} onChange={(event) => columnSettings.setVisible(item.key, event.target.checked)}>{item.label}</Checkbox>)}</Space>}
              >
                <Button icon={<SettingOutlined />}>列配置</Button>
              </Popover>
              <PermissionButton permission="users.create" icon={<MailOutlined />} onClick={openInviteModal}>邀请成员</PermissionButton>
              <PermissionButton permission="users.create" type="primary" icon={<PlusOutlined />} onClick={() => { setCurrent(null); form.resetFields(); setOpen(true) }}>新增用户</PermissionButton>
            </>
          )}
        />
        <PageTable rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys as number[]) }} columns={columns} dataSource={list} loading={loading} total={total} page={queryState.page} pageSize={queryState.pageSize} onPageChange={(nextPage, nextPageSize) => queryState.setQueryState({ page: nextPage, pageSize: nextPageSize })} />
        {!loading && !list.length && isFilterActive(queryState.filters) && <div className="table-filter-tip">当前筛选条件下暂无数据，请调整条件后重试</div>}
      </Card>
      <Modal title={current ? '编辑用户' : '新增用户'} open={open} onOk={() => void handleSubmit()} onCancel={() => setOpen(false)} destroyOnClose confirmLoading={submitting}>
        <Form form={form} layout="vertical" initialValues={{ status: true }}>
          <Form.Item label="姓名" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="用户名" name="username" rules={current ? undefined : [{ required: true }]}>
            <Input readOnly={Boolean(current)} />
          </Form.Item>
          <Form.Item label="邮箱" name="email" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="手机" name="mobile" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="角色" name="roleIds" rules={[{ required: true }]}><Select mode="multiple" options={roleOptions} /></Form.Item>
          <Form.Item label="是否启用" name="status" valuePropName="checked"><Switch checkedChildren="启用" unCheckedChildren="禁用" /></Form.Item>
        </Form>
      </Modal>
      <Modal title="邀请成员" open={inviteOpen} onOk={() => void handleInviteSubmit()} onCancel={() => setInviteOpen(false)} destroyOnClose confirmLoading={inviteSubmitting}>
        <Form form={inviteForm} layout="vertical">
          <Form.Item label="邮箱" name="email" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入正确的邮箱地址' }]}>
            <Input placeholder="请输入成员邮箱" />
          </Form.Item>
          <Form.Item label="角色" name="role_id" rules={[{ required: true, message: '请选择角色' }]}>
            <Select options={roleOptions} placeholder="请选择角色" />
          </Form.Item>
        </Form>
        {inviteLink ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert type="success" showIcon message="邀请创建成功，请复制邀请链接发送给成员" />
            <Typography.Text type="secondary">邀请链接</Typography.Text>
            <Input value={inviteLink} readOnly />
            <Button icon={<CopyOutlined />} onClick={() => void copyInviteLink()}>复制邀请链接</Button>
          </Space>
        ) : null}
      </Modal>
      <OperationLogDrawer open={logOpen} onClose={() => setLogOpen(false)} logs={logs} />
    </>
  )
}

export default UsersPage
