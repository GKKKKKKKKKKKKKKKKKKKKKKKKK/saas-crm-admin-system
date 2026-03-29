import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { Card, DatePicker, Descriptions, Form, Input, InputNumber, Modal, Popconfirm, Progress, Select, Space, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { SorterResult } from 'antd/es/table/interface'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createContractApi, deleteContractApi, getContractDetailApi, getContractsApi, updateContractApi } from '@/api/contracts'
import PageTable from '@/components/PageTable'
import PermissionButton from '@/components/PermissionButton'
import RowActions from '@/components/RowActions'
import SearchForm from '@/components/SearchForm'
import type { ContractItem } from '@/types'
import { feedback } from '@/utils/feedback'
import { isFormValidationError } from '@/utils/form'
import { getFallbackPage, isFilterActive } from '@/utils/list'
import { useListQueryState } from '@/hooks/useListQueryState'
import { usePermission } from '@/hooks/usePermission'

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '履行中', value: 'active' },
  { label: '已到期', value: 'expired' },
  { label: '已终止', value: 'terminated' },
]

const statusColorMap: Record<string, string> = {
  draft: 'default',
  active: 'green',
  expired: 'orange',
  terminated: 'red',
}

const statusLabelMap: Record<string, string> = {
  draft: '草稿',
  active: '履行中',
  expired: '已到期',
  terminated: '已终止',
}

const paymentStatusColorMap: Record<string, string> = {
  未回款: 'default',
  部分回款: 'processing',
  已回款: 'success',
}

const ContractsPage = () => {
  const queryState = useListQueryState({
    fields: [
      { key: 'contract_no' },
      { key: 'customer_id' },
      { key: 'status' },
      { key: 'end_date_start' },
      { key: 'end_date_end' },
    ],
  })
  const [list, setList] = useState<ContractItem[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [current, setCurrent] = useState<ContractItem | null>(null)
  const [detail, setDetail] = useState<ContractItem | null>(null)
  const [form] = Form.useForm()
  const canUpdate = usePermission('contracts.update')
  const canDelete = usePermission('contracts.delete')

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getContractsApi({
        current: queryState.page,
        pageSize: queryState.pageSize,
        ...queryState.filters,
        sortBy: queryState.sorter.field,
        sortOrder: queryState.sorter.order,
      })
      setList(result.list)
      setTotal(result.total)
      if (queryState.page > 1 && result.list.length === 0 && result.total > 0) {
        const fallbackPage = getFallbackPage(queryState.page, queryState.pageSize, result.total, 0)
        if (fallbackPage !== queryState.page) {
          queryState.setQueryState({ page: fallbackPage })
        }
      }
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
      const payload = {
        contractNo: values.contractNo,
        customerId: values.customerId,
        orderId: values.orderId,
        title: values.title,
        amount: values.amount,
        status: values.status,
        signDate: values.signDate ? values.signDate.format('YYYY-MM-DD') : '',
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : '',
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : '',
        ownerUserId: values.ownerUserId,
        remark: values.remark,
      }
      if (current) {
        await updateContractApi(current.id, payload)
      } else {
        await createContractApi(payload)
      }
      feedback.success('保存成功')
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

  const columns: ColumnsType<ContractItem> = useMemo(() => [
    { title: '合同编号', dataIndex: 'contractNo', key: 'contractNo' },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '客户', dataIndex: 'customerName', key: 'customerName' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (value: number) => `¥${value.toLocaleString()}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: (value: string) => <Tag color={statusColorMap[value] ?? 'default'}>{statusLabelMap[value] ?? value}</Tag> },
    { title: '已回款金额', dataIndex: 'totalPaidAmount', key: 'totalPaidAmount', render: (value?: number) => `¥${(value ?? 0).toLocaleString()}` },
    { title: '未回款金额', dataIndex: 'unpaidAmount', key: 'unpaidAmount', render: (value?: number) => `¥${(value ?? 0).toLocaleString()}` },
    { title: '回款进度', dataIndex: 'paymentProgress', key: 'paymentProgress', render: (value?: number) => `${value ?? 0}%` },
    {
      title: '回款状态',
      dataIndex: 'paymentStatusText',
      key: 'paymentStatusText',
      render: (value?: string) => <Tag color={paymentStatusColorMap[value ?? ''] ?? 'default'}>{value ?? '未回款'}</Tag>,
    },
    { title: '签订日期', dataIndex: 'signDate', key: 'signDate' },
    { title: '生效日期', dataIndex: 'startDate', key: 'startDate' },
    { title: '到期日期', dataIndex: 'endDate', key: 'endDate' },
    { title: '负责人', dataIndex: 'ownerName', key: 'ownerName' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'operation',
      width: 220,
      render: (_, record) => (
        <RowActions
          items={[
            {
              key: 'detail',
              label: '详情',
              icon: <EyeOutlined />,
              onClick: async () => {
                const data = await getContractDetailApi(record.id)
                setDetail(data)
                setDetailOpen(true)
              },
            },
            {
              key: 'edit',
              label: '编辑',
              icon: <EditOutlined />,
              onClick: () => {
                setCurrent(record)
                setOpen(true)
                form.setFieldsValue({
                  contractNo: record.contractNo,
                  customerId: record.customerId,
                  orderId: record.orderId,
                  title: record.title,
                  amount: record.amount,
                  status: record.status,
                  signDate: record.signDate ? dayjs(record.signDate) : undefined,
                  startDate: record.startDate ? dayjs(record.startDate) : undefined,
                  endDate: record.endDate ? dayjs(record.endDate) : undefined,
                  ownerUserId: record.ownerUserId,
                  remark: record.remark,
                })
              },
              hidden: !canUpdate,
            },
            {
              key: 'delete',
              label: '删除',
              icon: <DeleteOutlined />,
              danger: true,
              render: (node) => (
                <Popconfirm title="确认删除该合同吗？" onConfirm={() => void deleteContractApi(record.id).then(() => { feedback.success('删除成功'); refreshAfterMutation(1) })}>
                  <span>{node}</span>
                </Popconfirm>
              ),
              hidden: !canDelete,
            },
          ]}
        />
      ),
    },
  ], [form])

  const initialValues = useMemo(() => ({
    ...queryState.filters,
    endDateRange:
      queryState.filters.end_date_start && queryState.filters.end_date_end
        ? [dayjs(String(queryState.filters.end_date_start)), dayjs(String(queryState.filters.end_date_end))]
        : undefined,
  }), [queryState.filters])

  return (
    <>
      <SearchForm
        loading={loading}
        initialValues={initialValues}
        fields={[
          { name: 'contract_no', label: '合同编号', placeholder: '请输入合同编号' },
          { name: 'customer_id', label: '客户ID', placeholder: '请输入客户ID' },
          { name: 'status', label: '状态', type: 'select', placeholder: '请选择状态', options: [...statusOptions] },
          { name: 'endDateRange', label: '到期日期', type: 'dateRange' },
        ]}
        onSearch={(values) => {
          const { endDateRange, ...rest } = values
          const range = endDateRange as dayjs.Dayjs[] | undefined
          queryState.setQueryState({
            page: 1,
            filters: {
              ...rest,
              end_date_start: range?.[0]?.format('YYYY-MM-DD'),
              end_date_end: range?.[1]?.format('YYYY-MM-DD'),
            },
          })
        }}
        onReset={() => queryState.reset()}
      />
      <Card className="page-card table-card" bordered={false}>
        <Space style={{ marginBottom: 16 }}>
          <PermissionButton permission="contracts.create" type="primary" icon={<PlusOutlined />} onClick={() => { setCurrent(null); form.resetFields(); setOpen(true) }}>
            新增合同
          </PermissionButton>
        </Space>
        <PageTable
          columns={columns}
          dataSource={list}
          loading={loading}
          total={total}
          page={queryState.page}
          pageSize={queryState.pageSize}
          onSortChange={(sorter: SorterResult<ContractItem>) => queryState.setQueryState({ page: 1, sorter: { field: sorter.field ? String(sorter.field) : undefined, order: sorter.order ?? undefined } })}
          onPageChange={(nextPage, nextPageSize) => queryState.setQueryState({ page: nextPage, pageSize: nextPageSize })}
        />
        {!loading && !list.length && isFilterActive(queryState.filters) && <div className="table-filter-tip">当前筛选条件下暂无数据，请调整条件后重试</div>}
      </Card>
      <Modal title={current ? '编辑合同' : '新增合同'} open={open} onOk={() => void handleSubmit()} onCancel={() => setOpen(false)} confirmLoading={submitting} destroyOnClose width={720}>
        <Form form={form} layout="vertical">
          <Form.Item label="合同编号" name="contractNo" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="合同标题" name="title"><Input /></Form.Item>
          <Form.Item label="客户ID" name="customerId" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="订单ID" name="orderId"><Input /></Form.Item>
          <Form.Item label="金额" name="amount" rules={[{ required: true }]}><InputNumber min={0} precision={2} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true }]}><Select options={[...statusOptions]} /></Form.Item>
          <Form.Item label="签订日期" name="signDate"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="生效日期" name="startDate"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="到期日期" name="endDate"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="负责人ID" name="ownerUserId"><Input /></Form.Item>
          <Form.Item label="备注" name="remark"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
      <Modal title="合同详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={760}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="合同编号">{detail?.contractNo}</Descriptions.Item>
          <Descriptions.Item label="合同标题">{detail?.title || '-'}</Descriptions.Item>
          <Descriptions.Item label="客户">{detail?.customerName || '-'}</Descriptions.Item>
          <Descriptions.Item label="订单">{detail?.orderNo || '-'}</Descriptions.Item>
          <Descriptions.Item label="金额">{detail ? `¥${detail.amount.toLocaleString()}` : '-'}</Descriptions.Item>
          <Descriptions.Item label="状态">{detail?.status ? statusLabelMap[detail.status] ?? detail.status : '-'}</Descriptions.Item>
          <Descriptions.Item label="签订日期">{detail?.signDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="生效日期">{detail?.startDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="到期日期">{detail?.endDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="负责人">{detail?.ownerName || '-'}</Descriptions.Item>
          <Descriptions.Item label="创建人">{detail?.creatorName || '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{detail?.createdAt || '-'}</Descriptions.Item>
          <Descriptions.Item label="已确认回款额">{detail?.totalPaidAmount !== undefined ? `¥${detail.totalPaidAmount.toLocaleString()}` : '-'}</Descriptions.Item>
          <Descriptions.Item label="未回款金额">{detail?.unpaidAmount !== undefined ? `¥${detail.unpaidAmount.toLocaleString()}` : '-'}</Descriptions.Item>
          <Descriptions.Item label="回款进度">
            {detail?.paymentProgress !== undefined ? <Progress percent={detail.paymentProgress} size="small" /> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="回款状态">
            {detail?.paymentStatusText ? <Tag color={paymentStatusColorMap[detail.paymentStatusText] ?? 'default'}>{detail.paymentStatusText}</Tag> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>{detail?.remark || '-'}</Descriptions.Item>
        </Descriptions>
      </Modal>
    </>
  )
}

export default ContractsPage
