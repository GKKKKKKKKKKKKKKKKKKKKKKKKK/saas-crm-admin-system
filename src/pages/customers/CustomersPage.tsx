import { CopyOutlined, DeleteOutlined, DownOutlined, EditOutlined, EyeOutlined, FileSearchOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons'
import { Button, Card, Checkbox, Descriptions, Drawer, Dropdown, Form, Input, Modal, Popconfirm, Popover, Select, Space, Timeline, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { SorterResult } from 'antd/es/table/interface'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createCustomerApi, deleteCustomerApi, getCustomerDetailApi, getCustomersApi, updateCustomerApi } from '@/api/customers'
import { getCustomerFollowUpsByCustomerApi } from '@/api/customerFollowUps'
import type { CustomerItem } from '@/types'
import SearchForm from '@/components/SearchForm'
import PageTable from '@/components/PageTable'
import PermissionButton from '@/components/PermissionButton'
import ListToolbar from '@/components/ListToolbar'
import StatusTag from '@/components/StatusTag'
import RowActions from '@/components/RowActions'
import { exportToCsv } from '@/utils/export'
import OperationLogDrawer from '@/components/OperationLogDrawer'
import FileUploadPanel from '@/components/FileUploadPanel'
import { getCustomerFollowUpTypeLabel } from '@/constants/customerFollowUp'
import { useOperationLog } from '@/hooks/useOperationLog'
import { feedback } from '@/utils/feedback'
import { getFallbackPage, isFilterActive } from '@/utils/list'
import { useListQueryState } from '@/hooks/useListQueryState'
import { useEmptyResultPrompt } from '@/hooks/useEmptyResultPrompt'
import { useColumnSettings } from '@/hooks/useColumnSettings'
import { usePermission } from '@/hooks/usePermission'
import { isFormValidationError } from '@/utils/form'
import { copyText } from '@/utils/clipboard'

type CustomerStatus = CustomerItem['status']

const customerStatusLabelMap: Record<CustomerStatus, string> = {
  active: '启用',
  pending: '待跟进',
  inactive: '停用',
}

const customerStatusOptions = [
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' },
  { label: '待跟进', value: 'pending' },
] as const

const getCustomerStatusLabel = (status: CustomerStatus) => customerStatusLabelMap[status] ?? status

const CustomersPage = () => {
  const queryState = useListQueryState({
    fields: [
      { key: 'keyword' },
      { key: 'status' },
      { key: 'createdAtStart' },
      { key: 'createdAtEnd' },
    ],
  })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [list, setList] = useState<CustomerItem[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [current, setCurrent] = useState<CustomerItem | null>(null)
  const [followUps, setFollowUps] = useState<Array<{ id: number; followUpType: string; content: string; result: string; nextFollowUpAt: string; createdAt: string; createdBy: string }>>([])
  const [form] = Form.useForm()
  const { logs, recordLog, refreshLogs } = useOperationLog('customers')
  const canUpdate = usePermission('customers.update')
  const canDelete = usePermission('customers.delete')
  const emptyResultPrompt = useEmptyResultPrompt()

  const columnSettings = useColumnSettings('customers', [
    { key: 'id', label: '客户ID', defaultVisible: true },
    { key: 'name', label: '姓名', defaultVisible: true },
    { key: 'company', label: '公司', defaultVisible: true },
    { key: 'phone', label: '手机', defaultVisible: true },
    { key: 'email', label: '邮箱', defaultVisible: true },
    { key: 'status', label: '状态', defaultVisible: true },
    { key: 'createdAt', label: '创建时间', defaultVisible: true },
    { key: 'operation', label: '操作', fixedVisible: true },
  ])

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getCustomersApi({
        current: queryState.page,
        pageSize: queryState.pageSize,
        ...queryState.filters,
        sortField: queryState.sorter.field,
        sortOrder: queryState.sorter.order,
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
  }, [queryState.filters, queryState.page, queryState.pageSize, queryState.sorter.field, queryState.sorter.order])

  useEffect(() => {
    void fetchList()
  }, [fetchList])

  const handleSearch = (values: Record<string, unknown>) => {
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
  }

  const refreshAfterMutation = (removedCount = 0) => {
    const nextPage = getFallbackPage(queryState.page, queryState.pageSize, total, removedCount)
    if (nextPage !== queryState.page) {
      queryState.setQueryState({ page: nextPage })
      return
    }
    void fetchList()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      if (current) {
        await updateCustomerApi(current.id, values)
        feedback.success('保存成功')
        recordLog({ module: 'customers', action: 'edit_save', target: current.name, description: `更新客户 ${current.name}` })
      } else {
        const created = await createCustomerApi(values)
        feedback.success('保存成功')
        recordLog({ module: 'customers', action: 'edit_save', target: created.name, description: `新增客户 ${created.name}` })
      }
      setOpen(false)
      setCurrent(null)
      form.resetFields()
      refreshAfterMutation()
    } catch (error) {
      if (isFormValidationError(error)) {
        return
      }
    } finally {
      setSubmitting(false)
    }
  }


  const handleCopyCustomerId = async (id: number) => {
    const copied = await copyText(String(id))
    if (copied) {
      feedback.success('客户ID已复制')
      return
    }
    feedback.error('复制失败，请手动复制')
  }

  const handleDelete = async (item: CustomerItem) => {
    try {
      await deleteCustomerApi(item.id)
      feedback.success('删除成功')
      recordLog({ module: 'customers', action: 'delete', target: item.name, description: `删除客户 ${item.name}` })
      refreshAfterMutation(1)
    } catch {
      feedback.error('删除失败，请稍后重试')
    }
  }

  const handleBatchDelete = async () => {
    const idSet = new Set(selectedRowKeys.map((id) => Number(id)))
    const targets = list.filter((item) => idSet.has(item.id))
    const results = await Promise.allSettled(targets.map((item) => deleteCustomerApi(item.id)))
    const successCount = results.filter((item) => item.status === 'fulfilled').length
    if (successCount) {
      feedback.success(`批量删除成功，共 ${successCount} 条`)
      recordLog({ module: 'customers', action: 'batch_delete', target: `${successCount}条客户`, description: `批量删除客户 ${targets.map((item) => item.name).join('、')}` })
    }
    if (successCount < targets.length) {
      feedback.error(`批量删除失败 ${targets.length - successCount} 条`)
    }
    setSelectedRowKeys([])
    refreshAfterMutation(successCount)
  }

  const handleBatchStatus = async (status: CustomerStatus) => {
    const idSet = new Set(selectedRowKeys.map((id) => Number(id)))
    const targets = list.filter((item) => idSet.has(item.id))
    const results = await Promise.allSettled(targets.map((item) => updateCustomerApi(item.id, { status })))
    const successCount = results.filter((item) => item.status === 'fulfilled').length
    if (successCount) {
      feedback.success(`批量更新状态成功，共 ${successCount} 条`)
      recordLog({ module: 'customers', action: 'batch_status_update', target: `${successCount}条客户`, description: `批量更新客户状态为${getCustomerStatusLabel(status)}` })
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
        : (await getCustomersApi({
            current: 1,
            pageSize: 2000,
            ...queryState.filters,
            sortField: queryState.sorter.field,
            sortOrder: queryState.sorter.order,
          })).list

      if (!rows.length) {
        feedback.warning('当前筛选结果为空，无法导出')
        return
      }

      const ok = exportToCsv<CustomerItem>('客户列表', [
        { title: '客户ID', dataIndex: 'id' },
        { title: '客户姓名', dataIndex: 'name' },
        { title: '公司名称', dataIndex: 'company' },
        { title: '手机号', dataIndex: 'phone' },
        { title: '邮箱', dataIndex: 'email' },
        { title: '状态', dataIndex: 'status', formatter: (value) => getCustomerStatusLabel(value as CustomerStatus) },
        { title: '负责人', dataIndex: 'owner' },
        { title: '创建时间', dataIndex: 'createdAt' },
      ], rows)

      if (ok) {
        feedback.success('导出成功')
        recordLog({ module: 'customers', action: 'export', target: selectedOnly ? '选中客户' : '筛选结果', description: `导出客户数据 ${rows.length} 条` })
      }
    } catch {
      feedback.error('导出失败，请稍后重试')
    }
  }

  const openDetail = async (id: number) => {
    try {
      const [detail, timeline] = await Promise.all([
        getCustomerDetailApi(id),
        getCustomerFollowUpsByCustomerApi(id),
      ])
      setCurrent(detail)
      setFollowUps(timeline)
      setDetailOpen(true)
    } catch {
      feedback.error('加载详情失败，请稍后重试')
    }
  }

  const columns = useMemo(() => {
    const allColumns: ColumnsType<CustomerItem> = [
      {
        title: '客户ID',
        dataIndex: 'id',
        key: 'id',
        width: 140,
        render: (value: number) => (
          <Space size={6}>
            <span>{value}</span>
            <Tooltip title="复制客户ID">
              <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => void handleCopyCustomerId(value)} />
            </Tooltip>
          </Space>
        ),
      },
      { title: '姓名', dataIndex: 'name', key: 'name', sorter: true, sortOrder: queryState.sorter.field === 'name' ? queryState.sorter.order : null },
      { title: '公司', dataIndex: 'company', key: 'company' },
      { title: '手机', dataIndex: 'phone', key: 'phone' },
      { title: '邮箱', dataIndex: 'email', key: 'email' },
      { title: '状态', dataIndex: 'status', key: 'status', width: 120, render: (value: CustomerStatus) => <StatusTag status={value} text={getCustomerStatusLabel(value)} /> },
      { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', sorter: true, sortOrder: queryState.sorter.field === 'createdAt' ? queryState.sorter.order : null },
      {
        title: '操作',
        key: 'operation',
        width: 240,
        render: (_, record) => (
          <RowActions
            items={[
              {
                key: 'detail',
                label: '详情',
                icon: <EyeOutlined />,
                onClick: () => void openDetail(record.id),
              },
              {
                key: 'edit',
                label: '编辑',
                icon: <EditOutlined />,
                onClick: () => { setCurrent(record); setOpen(true); form.setFieldsValue(record) },
                hidden: !canUpdate,
              },
              {
                key: 'delete',
                label: '删除',
                icon: <DeleteOutlined />,
                danger: true,
                hidden: !canDelete,
                render: (node) => (
                  <Popconfirm title="确认删除该记录吗？" description="此操作不可恢复" onConfirm={() => void handleDelete(record)} okText="确认" cancelText="取消">
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
  }, [columnSettings.visibleKeys, form, queryState.sorter.field, queryState.sorter.order])
  const hasSelection = useMemo(() => selectedRowKeys.length > 0, [selectedRowKeys])
  const batchItems: MenuProps['items'] = [
    {
      key: 'delete',
      label: '批量删除',
      danger: true,
      onClick: () => feedback.confirm('确认批量删除选中客户？', async () => handleBatchDelete()),
    },
    {
      key: 'enable',
      label: '批量启用',
      onClick: () => feedback.confirm('确认将选中客户状态改为启用？', async () => handleBatchStatus('active')),
    },
    {
      key: 'disable',
      label: '批量停用',
      onClick: () => feedback.confirm('确认将选中客户状态改为停用？', async () => handleBatchStatus('inactive')),
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
      <SearchForm
        loading={loading}
        initialValues={initialSearchValues}
        fields={[
          { name: 'keyword', label: '关键词', placeholder: '姓名/公司/邮箱' },
          {
            name: 'status',
            label: '状态',
            type: 'select',
            placeholder: '全部状态',
            options: [...customerStatusOptions],
          },
          { name: 'createdAtRange', label: '创建时间', type: 'dateRange' },
        ]}
        onSearch={handleSearch}
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
                <PermissionButton permission="customers.batch" disabled={!hasSelection}>
                  批量操作
                  <DownOutlined />
                </PermissionButton>
              </Dropdown>
              <Dropdown menu={{ items: exportItems }}>
                <PermissionButton permission="customers.export">
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
                { key: 'id', label: '客户ID', fixedVisible: false },
                { key: 'name', label: '姓名', fixedVisible: false },
                { key: 'company', label: '公司', fixedVisible: false },
                { key: 'phone', label: '手机', fixedVisible: false },
                { key: 'email', label: '邮箱', fixedVisible: false },
                { key: 'status', label: '状态', fixedVisible: false },
                { key: 'createdAt', label: '创建时间', fixedVisible: false },
                { key: 'operation', label: '操作', fixedVisible: true },
              ].map((item) => <Checkbox key={item.key} checked={columnSettings.visibleMap[item.key]} disabled={item.fixedVisible} onChange={(event) => columnSettings.setVisible(item.key, event.target.checked)}>{item.label}</Checkbox>)}</Space>}
            >
              <Button icon={<SettingOutlined />}>列配置</Button>
            </Popover>
            <PermissionButton permission="customers.create" type="primary" icon={<PlusOutlined />} onClick={() => { setCurrent(null); form.resetFields(); setOpen(true) }}>新增客户</PermissionButton>
            </>
          )}
        />
        <PageTable
          rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys as number[]) }}
          columns={columns}
          dataSource={list}
          loading={loading}
          total={total}
          page={queryState.page}
          pageSize={queryState.pageSize}
          onSortChange={(sorter: SorterResult<CustomerItem>) => queryState.setQueryState({ page: 1, sorter: { field: sorter.field ? String(sorter.field) : undefined, order: sorter.order ?? undefined } })}
          onPageChange={(nextPage, nextPageSize) => queryState.setQueryState({ page: nextPage, pageSize: nextPageSize })}
        />
        {!loading && !list.length && isFilterActive(queryState.filters) && <div className="table-filter-tip">当前筛选条件下暂无数据，请调整条件后重试</div>}
      </Card>
      <Modal title={current ? '编辑客户' : '新增客户'} open={open} onOk={() => void handleSubmit()} onCancel={() => setOpen(false)} destroyOnClose confirmLoading={submitting}>
        <Form form={form} layout="vertical">
          <Form.Item label="姓名" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="公司" name="company" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="手机" name="phone" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="邮箱" name="email" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true }]}><Select options={[...customerStatusOptions]} /></Form.Item>
          <Form.Item label="负责人" name="owner" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="备注" name="remark"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
      <Drawer title="客户详情" open={detailOpen} onClose={() => setDetailOpen(false)} width={720}>
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="客户ID">
              <Space size={8}>
                <span>{current?.id ?? '-'}</span>
                {current?.id ? <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => void handleCopyCustomerId(current.id)}>复制客户ID</Button> : null}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="姓名">{current?.name}</Descriptions.Item>
            <Descriptions.Item label="公司">{current?.company}</Descriptions.Item>
            <Descriptions.Item label="手机">{current?.phone}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{current?.email}</Descriptions.Item>
            <Descriptions.Item label="状态">{current?.status ? getCustomerStatusLabel(current.status) : '-'}</Descriptions.Item>
            <Descriptions.Item label="负责人">{current?.owner}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{current?.createdAt}</Descriptions.Item>
            <Descriptions.Item label="备注">{current?.remark}</Descriptions.Item>
          </Descriptions>
          <Card title="跟进记录">
            {!followUps.length ? (
              <div>暂无跟进记录</div>
            ) : (
              <Timeline
                items={followUps.map((item) => ({
                  key: item.id,
                  children: (
                    <Space direction="vertical" size={0}>
                      <div>{item.createdAt} · {item.createdBy} · {getCustomerFollowUpTypeLabel(item.followUpType)}</div>
                      <div>内容：{item.content || '-'}</div>
                      <div>结果：{item.result || '-'}</div>
                      <div>下次跟进：{item.nextFollowUpAt || '-'}</div>
                    </Space>
                  ),
                }))}
              />
            )}
          </Card>
          <FileUploadPanel businessType="customer" businessId={current?.id} usage="attachment" />
        </Space>
      </Drawer>
      <OperationLogDrawer open={logOpen} onClose={() => setLogOpen(false)} logs={logs} />
    </>
  )
}

export default CustomersPage
