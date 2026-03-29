import {
  CheckCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  FileSearchOutlined,
  PlusOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Checkbox,
  Descriptions,
  Drawer,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Popover,
  Select,
  Space,
} from 'antd'
import type { MenuProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { SorterResult } from 'antd/es/table/interface'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createOrderApi, deleteOrderApi, getOrdersApi, updateOrderApi, updateOrderStatusApi } from '@/api/orders'
import type { OrderItem } from '@/types'
import SearchForm from '@/components/SearchForm'
import PageTable from '@/components/PageTable'
import PermissionButton from '@/components/PermissionButton'
import ListToolbar from '@/components/ListToolbar'
import StatusTag from '@/components/StatusTag'
import RowActions from '@/components/RowActions'
import { exportToCsv } from '@/utils/export'
import { useOperationLog } from '@/hooks/useOperationLog'
import { useEmptyResultPrompt } from '@/hooks/useEmptyResultPrompt'
import OperationLogDrawer from '@/components/OperationLogDrawer'
import { feedback } from '@/utils/feedback'
import { getFallbackPage, isFilterActive } from '@/utils/list'
import { useListQueryState } from '@/hooks/useListQueryState'
import { useColumnSettings } from '@/hooks/useColumnSettings'
import { usePermission } from '@/hooks/usePermission'
import FileUploadPanel from '@/components/FileUploadPanel'
import { isFormValidationError } from '@/utils/form'

type OrderStatus = OrderItem['status']

const orderStatusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '处理中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
] as const

const orderStatusLabelMap: Record<OrderStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  cancelled: '已取消',
}

const getOrderStatusLabel = (status: OrderStatus) => orderStatusLabelMap[status] ?? status

const OrdersPage = () => {
  const queryState = useListQueryState({
    fields: [
      { key: 'keyword' },
      { key: 'status' },
      { key: 'createdAtStart' },
      { key: 'createdAtEnd' },
      { key: 'amountRangeMin', type: 'number' },
      { key: 'amountRangeMax', type: 'number' },
    ],
  })
  const [list, setList] = useState<OrderItem[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [current, setCurrent] = useState<OrderItem | null>(null)
  const [detailRecord, setDetailRecord] = useState<OrderItem | null>(null)
  const [form] = Form.useForm()
  const { logs, recordLog, refreshLogs } = useOperationLog('orders')
  const canUpdate = usePermission('orders.update')
  const canUpdateStatus = usePermission('orders.status')
  const canDelete = usePermission('orders.delete')
  const emptyResultPrompt = useEmptyResultPrompt()

  const columnSettings = useColumnSettings('orders', [
    { key: 'orderNo', label: '订单号', defaultVisible: true },
    { key: 'customerName', label: '客户', defaultVisible: true },
    { key: 'amount', label: '金额', defaultVisible: true },
    { key: 'status', label: '状态', defaultVisible: true },
    { key: 'createdAt', label: '创建时间', defaultVisible: true },
    { key: 'operation', label: '操作', fixedVisible: true },
  ])

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getOrdersApi({
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
        await updateOrderApi(current.id, values)
        feedback.success('保存成功')
        recordLog({ module: 'orders', action: 'edit_save', target: current.orderNo, description: `更新订单 ${current.orderNo}` })
      } else {
        const created = await createOrderApi(values)
        feedback.success('保存成功')
        recordLog({ module: 'orders', action: 'edit_save', target: created.orderNo, description: `新增订单 ${created.orderNo}` })
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

  const handleBatchDelete = async () => {
    const idSet = new Set(selectedRowKeys)
    const targets = list.filter((item) => idSet.has(item.id))
    const results = await Promise.allSettled(targets.map((item) => deleteOrderApi(item.id)))
    const successCount = results.filter((item) => item.status === 'fulfilled').length
    if (successCount) {
      feedback.success(`批量删除成功，共 ${successCount} 条`)
      recordLog({ module: 'orders', action: 'batch_delete', target: `${successCount}条订单`, description: `批量删除订单 ${targets.map((item) => item.orderNo).join('、')}` })
    }
    if (successCount < targets.length) {
      feedback.error(`批量删除失败 ${targets.length - successCount} 条`)
    }
    setSelectedRowKeys([])
    refreshAfterMutation(successCount)
  }

  const handleBatchStatus = async (status: OrderStatus) => {
    const idSet = new Set(selectedRowKeys)
    const targets = list.filter((item) => idSet.has(item.id))
    const results = await Promise.allSettled(targets.map((item) => updateOrderStatusApi(item.id, status)))
    const successCount = results.filter((item) => item.status === 'fulfilled').length
    if (successCount) {
      feedback.success(`批量更新状态成功，共 ${successCount} 条`)
      recordLog({ module: 'orders', action: 'batch_status_update', target: `${successCount}条订单`, description: `批量更新订单状态为${getOrderStatusLabel(status)}` })
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
        : (await getOrdersApi({
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

      const ok = exportToCsv<OrderItem>('订单列表', [
        { title: '订单号', dataIndex: 'orderNo' },
        { title: '客户名称', dataIndex: 'customerName' },
        { title: '订单金额', dataIndex: 'amount' },
        { title: '订单状态', dataIndex: 'status', formatter: (value) => getOrderStatusLabel(value as OrderStatus) },
        { title: '产品', dataIndex: 'product' },
        { title: '负责人', dataIndex: 'owner' },
        { title: '创建时间', dataIndex: 'createdAt' },
      ], rows)

      if (ok) {
        feedback.success('导出成功')
        recordLog({ module: 'orders', action: 'export', target: selectedOnly ? '选中订单' : '筛选结果', description: `导出订单数据 ${rows.length} 条` })
      }
    } catch {
      feedback.error('导出失败，请稍后重试')
    }
  }

  const columns = useMemo(() => {
    const allColumns: ColumnsType<OrderItem> = [
      { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', sorter: true, sortOrder: queryState.sorter.field === 'orderNo' ? queryState.sorter.order : null },
      { title: '客户', dataIndex: 'customerName', key: 'customerName' },
      { title: '金额', dataIndex: 'amount', key: 'amount', sorter: true, sortOrder: queryState.sorter.field === 'amount' ? queryState.sorter.order : null, render: (value) => `¥${value.toLocaleString()}` },
      { title: '状态', dataIndex: 'status', key: 'status', width: 120, render: (value: OrderStatus) => <StatusTag status={value} text={getOrderStatusLabel(value)} /> },
      { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', sorter: true, sortOrder: queryState.sorter.field === 'createdAt' ? queryState.sorter.order : null },
      {
        title: '操作',
        key: 'operation',
        width: 260,
        render: (_, record) => (
          <RowActions
            items={[
              {
                key: 'detail',
                label: '详情',
                icon: <EyeOutlined />,
                onClick: () => { setDetailRecord(record); setDetailOpen(true) },
              },
              {
                key: 'edit',
                label: '编辑',
                icon: <EditOutlined />,
                onClick: () => { setCurrent(record); setOpen(true); form.setFieldsValue(record) },
                hidden: !canUpdate,
              },
              {
                key: 'status',
                label: '切换状态',
                icon: record.status === 'completed' ? <SyncOutlined /> : <CheckCircleOutlined />,
                onClick: async () => {
                  try {
                    const nextStatus = record.status === 'completed' ? 'processing' : 'completed'
                    await updateOrderStatusApi(record.id, nextStatus)
                    feedback.success('状态更新成功')
                    recordLog({ module: 'orders', action: 'status_update', target: record.orderNo, description: `订单状态更新为${getOrderStatusLabel(nextStatus)}` })
                    void fetchList()
                  } catch {
                    feedback.error('状态更新失败，请稍后重试')
                  }
                },
                hidden: !canUpdateStatus,
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
                      await deleteOrderApi(record.id)
                      feedback.success('删除成功')
                      recordLog({ module: 'orders', action: 'delete', target: record.orderNo, description: `删除订单 ${record.orderNo}` })
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
  }, [columnSettings.visibleKeys, fetchList, form, queryState.sorter.field, queryState.sorter.order, recordLog])
  const hasSelection = useMemo(() => selectedRowKeys.length > 0, [selectedRowKeys])
  const batchItems: MenuProps['items'] = [
    {
      key: 'delete',
      label: '批量删除',
      danger: true,
      onClick: () => feedback.confirm('确认批量删除选中订单？', async () => handleBatchDelete()),
    },
    {
      key: 'processing',
      label: '批量设为处理中',
      onClick: () => feedback.confirm('确认将选中订单改为处理中？', async () => handleBatchStatus('processing')),
    },
    {
      key: 'completed',
      label: '批量设为完成',
      onClick: () => feedback.confirm('确认将选中订单改为已完成？', async () => handleBatchStatus('completed')),
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
    amountRangeMin: queryState.filters.amountRangeMin,
    amountRangeMax: queryState.filters.amountRangeMax,
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
          { name: 'keyword', label: '订单搜索', placeholder: '订单号/客户/产品' },
          { name: 'status', label: '状态', type: 'select', placeholder: '请选择状态', options: [...orderStatusOptions] },
          { name: 'createdAtRange', label: '时间范围', type: 'dateRange' },
          { name: 'amountRange', label: '金额区间', type: 'numberRange' },
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
                <PermissionButton permission="orders.batch" disabled={!hasSelection}>
                  批量操作
                  <DownOutlined />
                </PermissionButton>
              </Dropdown>
              <Dropdown menu={{ items: exportItems }}>
                <PermissionButton permission="orders.export">
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
                { key: 'orderNo', label: '订单号', fixedVisible: false },
                { key: 'customerName', label: '客户', fixedVisible: false },
                { key: 'amount', label: '金额', fixedVisible: false },
                { key: 'status', label: '状态', fixedVisible: false },
                { key: 'createdAt', label: '创建时间', fixedVisible: false },
                { key: 'operation', label: '操作', fixedVisible: true },
              ].map((item) => <Checkbox key={item.key} checked={columnSettings.visibleMap[item.key]} disabled={item.fixedVisible} onChange={(event) => columnSettings.setVisible(item.key, event.target.checked)}>{item.label}</Checkbox>)}</Space>}
            >
              <Button icon={<SettingOutlined />}>列配置</Button>
            </Popover>
            <PermissionButton permission="orders.create" type="primary" icon={<PlusOutlined />} onClick={() => { setCurrent(null); form.resetFields(); setOpen(true) }}>新增订单</PermissionButton>
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
          onSortChange={(sorter: SorterResult<OrderItem>) => queryState.setQueryState({ page: 1, sorter: { field: sorter.field ? String(sorter.field) : undefined, order: sorter.order ?? undefined } })}
          onPageChange={(nextPage, nextPageSize) => queryState.setQueryState({ page: nextPage, pageSize: nextPageSize })}
        />
        {!loading && !list.length && isFilterActive(queryState.filters) && <div className="table-filter-tip">当前筛选条件下暂无数据，请调整条件后重试</div>}
      </Card>
      <Modal title={current ? '编辑订单' : '新增订单'} open={open} onOk={() => void handleSubmit()} onCancel={() => setOpen(false)} destroyOnClose confirmLoading={submitting}>
        <Form form={form} layout="vertical">
          <Form.Item label="订单号" name="orderNo" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="客户ID" name="customerId" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="客户名称" name="customerName" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="金额" name="amount" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item label="产品" name="product" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="负责人" name="owner" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true }]}><Select options={[...orderStatusOptions]} /></Form.Item>
        </Form>
      </Modal>
      <Drawer title="订单详情" open={detailOpen} onClose={() => setDetailOpen(false)} width={720}>
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="订单编号">{detailRecord?.orderNo}</Descriptions.Item>
            <Descriptions.Item label="客户名称">{detailRecord?.customerName}</Descriptions.Item>
            <Descriptions.Item label="金额">{detailRecord ? `¥${detailRecord.amount.toLocaleString()}` : '-'}</Descriptions.Item>
            <Descriptions.Item label="状态">{detailRecord?.status ? getOrderStatusLabel(detailRecord.status) : '-'}</Descriptions.Item>
            <Descriptions.Item label="创建人">{detailRecord?.owner}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{detailRecord?.createdAt}</Descriptions.Item>
          </Descriptions>
          <FileUploadPanel businessType="order" businessId={detailRecord?.id} usage="attachment" />
        </Space>
      </Drawer>
      <OperationLogDrawer open={logOpen} onClose={() => setLogOpen(false)} logs={logs} />
    </>
  )
}

export default OrdersPage
