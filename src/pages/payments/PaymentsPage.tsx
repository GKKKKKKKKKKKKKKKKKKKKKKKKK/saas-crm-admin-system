import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { Card, DatePicker, Descriptions, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { SorterResult } from 'antd/es/table/interface'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPaymentApi, deletePaymentApi, getPaymentDetailApi, getPaymentsApi, updatePaymentApi } from '@/api/payments'
import PageTable from '@/components/PageTable'
import PermissionButton from '@/components/PermissionButton'
import RowActions from '@/components/RowActions'
import SearchForm from '@/components/SearchForm'
import type { PaymentItem } from '@/types'
import { feedback } from '@/utils/feedback'
import { isFormValidationError } from '@/utils/form'
import { getFallbackPage, isFilterActive } from '@/utils/list'
import { useListQueryState } from '@/hooks/useListQueryState'
import { usePermission } from '@/hooks/usePermission'
import { getPaymentMethodLabel, getPaymentStatusLabel, paymentMethodOptions, paymentStatusColorMap, paymentStatusOptions } from '@/constants/payment'

const PaymentsPage = () => {
  const queryState = useListQueryState({
    fields: [
      { key: 'customer_id' },
      { key: 'contract_id' },
      { key: 'status' },
      { key: 'payment_method' },
      { key: 'payment_date_start' },
      { key: 'payment_date_end' },
    ],
  })
  const [list, setList] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [current, setCurrent] = useState<PaymentItem | null>(null)
  const [detail, setDetail] = useState<PaymentItem | null>(null)
  const [form] = Form.useForm()
  const canUpdate = usePermission('payments.update')
  const canDelete = usePermission('payments.delete')

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getPaymentsApi({
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
        contractId: values.contractId,
        orderId: values.orderId,
        customerId: values.customerId,
        amount: values.amount,
        paymentDate: values.paymentDate ? values.paymentDate.format('YYYY-MM-DD') : '',
        paymentMethod: values.paymentMethod,
        status: values.status,
        remark: values.remark,
      }
      if (current) {
        await updatePaymentApi(current.id, payload)
      } else {
        await createPaymentApi(payload)
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

  const columns: ColumnsType<PaymentItem> = useMemo(() => [
    { title: '客户', dataIndex: 'customerName', key: 'customerName' },
    { title: '合同', dataIndex: 'contractNo', key: 'contractNo' },
    { title: '订单', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '回款金额', dataIndex: 'amount', key: 'amount', render: (value: number) => `¥${value.toLocaleString()}` },
    { title: '回款日期', dataIndex: 'paymentDate', key: 'paymentDate' },
    { title: '回款方式', dataIndex: 'paymentMethod', key: 'paymentMethod', render: (value: string) => getPaymentMethodLabel(value) },
    { title: '状态', dataIndex: 'status', key: 'status', render: (value: string) => <Tag color={paymentStatusColorMap[value] ?? 'default'}>{getPaymentStatusLabel(value)}</Tag> },
    { title: '创建人', dataIndex: 'createdBy', key: 'createdBy' },
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
                const data = await getPaymentDetailApi(record.id)
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
                  contractId: record.contractId,
                  orderId: record.orderId,
                  customerId: record.customerId,
                  amount: record.amount,
                  paymentDate: record.paymentDate ? dayjs(record.paymentDate) : undefined,
                  paymentMethod: record.paymentMethod,
                  status: record.status,
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
                <Popconfirm title="确认删除该回款记录吗？" onConfirm={() => void deletePaymentApi(record.id).then(() => { feedback.success('删除成功'); refreshAfterMutation(1) })}>
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
    paymentDateRange:
      queryState.filters.payment_date_start && queryState.filters.payment_date_end
        ? [dayjs(String(queryState.filters.payment_date_start)), dayjs(String(queryState.filters.payment_date_end))]
        : undefined,
  }), [queryState.filters])

  return (
    <>
      <SearchForm
        loading={loading}
        initialValues={initialValues}
        fields={[
          { name: 'customer_id', label: '客户ID', placeholder: '请输入客户ID' },
          { name: 'contract_id', label: '合同ID', placeholder: '请输入合同ID' },
          { name: 'status', label: '状态', type: 'select', placeholder: '请选择状态', options: [...paymentStatusOptions] },
          { name: 'payment_method', label: '回款方式', type: 'select', placeholder: '请选择回款方式', options: [...paymentMethodOptions] },
          { name: 'paymentDateRange', label: '回款日期', type: 'dateRange' },
        ]}
        onSearch={(values) => {
          const { paymentDateRange, ...rest } = values
          const range = paymentDateRange as dayjs.Dayjs[] | undefined
          queryState.setQueryState({
            page: 1,
            filters: {
              ...rest,
              payment_date_start: range?.[0]?.format('YYYY-MM-DD'),
              payment_date_end: range?.[1]?.format('YYYY-MM-DD'),
            },
          })
        }}
        onReset={() => queryState.reset()}
      />
      <Card className="page-card table-card" bordered={false}>
        <Space style={{ marginBottom: 16 }}>
          <PermissionButton permission="payments.create" type="primary" icon={<PlusOutlined />} onClick={() => { setCurrent(null); form.resetFields(); setOpen(true) }}>
            新增回款
          </PermissionButton>
        </Space>
        <PageTable
          columns={columns}
          dataSource={list}
          loading={loading}
          total={total}
          page={queryState.page}
          pageSize={queryState.pageSize}
          onSortChange={(sorter: SorterResult<PaymentItem>) => queryState.setQueryState({ page: 1, sorter: { field: sorter.field ? String(sorter.field) : undefined, order: sorter.order ?? undefined } })}
          onPageChange={(nextPage, nextPageSize) => queryState.setQueryState({ page: nextPage, pageSize: nextPageSize })}
        />
        {!loading && !list.length && isFilterActive(queryState.filters) && <div className="table-filter-tip">当前筛选条件下暂无数据，请调整条件后重试</div>}
      </Card>
      <Modal title={current ? '编辑回款' : '新增回款'} open={open} onOk={() => void handleSubmit()} onCancel={() => setOpen(false)} confirmLoading={submitting} destroyOnClose width={680}>
        <Form form={form} layout="vertical">
          <Form.Item label="合同ID" name="contractId" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="订单ID" name="orderId"><Input /></Form.Item>
          <Form.Item label="客户ID" name="customerId" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="回款金额" name="amount" rules={[{ required: true }]}><InputNumber min={0} precision={2} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="回款日期" name="paymentDate"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="回款方式" name="paymentMethod"><Select options={[...paymentMethodOptions]} /></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true }]}><Select options={[...paymentStatusOptions]} /></Form.Item>
          <Form.Item label="备注" name="remark"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
      <Modal title="回款详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={700}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="客户">{detail?.customerName || '-'}</Descriptions.Item>
          <Descriptions.Item label="合同">{detail?.contractNo || '-'}</Descriptions.Item>
          <Descriptions.Item label="订单">{detail?.orderNo || '-'}</Descriptions.Item>
          <Descriptions.Item label="金额">{detail ? `¥${detail.amount.toLocaleString()}` : '-'}</Descriptions.Item>
          <Descriptions.Item label="回款日期">{detail?.paymentDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="回款方式">{getPaymentMethodLabel(detail?.paymentMethod)}</Descriptions.Item>
          <Descriptions.Item label="状态">{getPaymentStatusLabel(detail?.status)}</Descriptions.Item>
          <Descriptions.Item label="创建人">{detail?.createdBy || '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{detail?.createdAt || '-'}</Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>{detail?.remark || '-'}</Descriptions.Item>
        </Descriptions>
      </Modal>
    </>
  )
}

export default PaymentsPage
