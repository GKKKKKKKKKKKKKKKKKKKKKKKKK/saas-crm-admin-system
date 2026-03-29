import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Card, DatePicker, Form, Input, Modal, Popconfirm, Select, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { SorterResult } from 'antd/es/table/interface'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createCustomerFollowUpApi,
  deleteCustomerFollowUpApi,
  getCustomerFollowUpsApi,
  updateCustomerFollowUpApi,
} from '@/api/customerFollowUps'
import PageTable from '@/components/PageTable'
import PermissionButton from '@/components/PermissionButton'
import RowActions from '@/components/RowActions'
import SearchForm from '@/components/SearchForm'
import { customerFollowUpTypeOptions, getCustomerFollowUpTypeLabel } from '@/constants/customerFollowUp'
import type { CustomerFollowUpItem } from '@/types'
import { feedback } from '@/utils/feedback'
import { getFallbackPage, isFilterActive } from '@/utils/list'
import { useListQueryState } from '@/hooks/useListQueryState'
import { usePermission } from '@/hooks/usePermission'
import { isFormValidationError } from '@/utils/form'

const CustomerFollowUpsPage = () => {
  const queryState = useListQueryState({
    fields: [
      { key: 'customer_id' },
      { key: 'follow_up_type' },
      { key: 'next_follow_up_at_start' },
      { key: 'next_follow_up_at_end' },
    ],
  })
  const [list, setList] = useState<CustomerFollowUpItem[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<CustomerFollowUpItem | null>(null)
  const [form] = Form.useForm()
  const canUpdate = usePermission('customer_followups.update')
  const canDelete = usePermission('customer_followups.delete')

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getCustomerFollowUpsApi({
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
      const nextFollowUpAt = values.nextFollowUpAt ? values.nextFollowUpAt.format('YYYY-MM-DD HH:mm:ss') : ''
      const payload = {
        customerId: values.customerId,
        followUpType: values.followUpType,
        content: values.content,
        result: values.result,
        nextFollowUpAt,
      }
      if (current) {
        await updateCustomerFollowUpApi(current.id, payload)
      } else {
        await createCustomerFollowUpApi(payload)
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

  const columns: ColumnsType<CustomerFollowUpItem> = useMemo(() => [
    { title: '客户', dataIndex: 'customerName', key: 'customerName' },
    { title: '跟进方式', dataIndex: 'followUpType', key: 'followUpType', render: (value: string) => getCustomerFollowUpTypeLabel(value) },
    { title: '内容摘要', dataIndex: 'content', key: 'content', ellipsis: true },
    { title: '结果', dataIndex: 'result', key: 'result', ellipsis: true },
    { title: '下次跟进时间', dataIndex: 'nextFollowUpAt', key: 'nextFollowUpAt' },
    { title: '创建人', dataIndex: 'createdBy', key: 'createdBy' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', sorter: true, sortOrder: queryState.sorter.field === 'createdAt' ? queryState.sorter.order : null },
    {
      title: '操作',
      key: 'operation',
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
                setOpen(true)
                form.setFieldsValue({
                  customerId: record.customerId,
                  followUpType: record.followUpType,
                  content: record.content,
                  result: record.result,
                  nextFollowUpAt: record.nextFollowUpAt ? dayjs(record.nextFollowUpAt) : undefined,
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
                <Popconfirm title="确认删除该记录吗？" onConfirm={() => void deleteCustomerFollowUpApi(record.id).then(() => { feedback.success('删除成功'); refreshAfterMutation(1) })}>
                  <span>{node}</span>
                </Popconfirm>
              ),
              hidden: !canDelete,
            },
          ]}
        />
      ),
    },
  ], [form, queryState.sorter.field, queryState.sorter.order])

  const initialValues = useMemo(() => ({
    ...queryState.filters,
    nextFollowUpRange:
      queryState.filters.next_follow_up_at_start && queryState.filters.next_follow_up_at_end
        ? [dayjs(String(queryState.filters.next_follow_up_at_start)), dayjs(String(queryState.filters.next_follow_up_at_end))]
        : undefined,
  }), [queryState.filters])

  return (
    <>
      <SearchForm
        loading={loading}
        initialValues={initialValues}
        fields={[
          { name: 'customer_id', label: '客户ID', placeholder: '请输入客户ID' },
          { name: 'follow_up_type', label: '跟进方式', type: 'select', placeholder: '请选择跟进方式', options: [...customerFollowUpTypeOptions] },
          { name: 'nextFollowUpRange', label: '下次跟进时间', type: 'dateRange' },
        ]}
        onSearch={(values) => {
          const { nextFollowUpRange, ...rest } = values
          const range = nextFollowUpRange as dayjs.Dayjs[] | undefined
          queryState.setQueryState({
            page: 1,
            filters: {
              ...rest,
              next_follow_up_at_start: range?.[0]?.startOf('day').format('YYYY-MM-DD HH:mm:ss'),
              next_follow_up_at_end: range?.[1]?.endOf('day').format('YYYY-MM-DD HH:mm:ss'),
            },
          })
        }}
        onReset={() => queryState.reset()}
      />
      <Card className="page-card table-card" bordered={false}>
        <Space style={{ marginBottom: 16 }}>
          <PermissionButton permission="customer_followups.create" type="primary" icon={<PlusOutlined />} onClick={() => { setCurrent(null); form.resetFields(); setOpen(true) }}>
            新增跟进
          </PermissionButton>
        </Space>
        <PageTable
          columns={columns}
          dataSource={list}
          loading={loading}
          total={total}
          page={queryState.page}
          pageSize={queryState.pageSize}
          onSortChange={(sorter: SorterResult<CustomerFollowUpItem>) => queryState.setQueryState({ page: 1, sorter: { field: sorter.field ? String(sorter.field) : undefined, order: sorter.order ?? undefined } })}
          onPageChange={(nextPage, nextPageSize) => queryState.setQueryState({ page: nextPage, pageSize: nextPageSize })}
        />
        {!loading && !list.length && isFilterActive(queryState.filters) && <div className="table-filter-tip">当前筛选条件下暂无数据，请调整条件后重试</div>}
      </Card>
      <Modal title={current ? '编辑跟进' : '新增跟进'} open={open} onOk={() => void handleSubmit()} onCancel={() => setOpen(false)} confirmLoading={submitting} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item label="客户ID" name="customerId" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="跟进方式" name="followUpType" rules={[{ required: true }]}><Select options={[...customerFollowUpTypeOptions]} /></Form.Item>
          <Form.Item label="内容" name="content"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="结果" name="result"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="下次跟进时间" name="nextFollowUpAt"><DatePicker showTime style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default CustomerFollowUpsPage
