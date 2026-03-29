import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space } from 'antd'
import { useEffect } from 'react'
import type { SearchField } from '@/types'

interface SearchFormProps {
  fields: SearchField[]
  loading?: boolean
  initialValues?: Record<string, unknown>
  onSearch: (values: Record<string, unknown>) => void
  onReset?: (values: Record<string, unknown>) => void
}

const SearchForm = ({ fields, loading, initialValues, onSearch, onReset }: SearchFormProps) => {
  const [form] = Form.useForm()

  useEffect(() => {
    form.setFieldsValue(initialValues ?? {})
  }, [form, initialValues])

  const renderField = (field: SearchField) => {
    if (field.type === 'select') {
      return <Select allowClear placeholder={field.placeholder} className="search-form-control" options={field.options} />
    }

    if (field.type === 'dateRange') {
      return <DatePicker.RangePicker className="search-form-control" style={{ width: '100%' }} />
    }

    if (field.type === 'numberRange') {
      return (
        <Space.Compact className="search-form-control" style={{ width: '100%' }}>
          <Form.Item noStyle name={`${field.name}Min`}>
            <InputNumber style={{ width: '50%' }} min={0} placeholder="最小值" />
          </Form.Item>
          <Form.Item noStyle name={`${field.name}Max`}>
            <InputNumber style={{ width: '50%' }} min={0} placeholder="最大值" />
          </Form.Item>
        </Space.Compact>
      )
    }

    return <Input allowClear className="search-form-control" placeholder={field.placeholder} onPressEnter={() => void form.submit()} />
  }

  const handleReset = () => {
    form.resetFields()
    onReset?.({})
  }

  return (
    <Card className="page-card content-section search-form-card" bordered={false}>
      <Form form={form} layout="vertical" className="search-form" onFinish={onSearch}>
        <Row gutter={[16, 4]}>
          {fields.map((field) => (
            <Col span={6} key={field.name}>
              <Form.Item name={field.type === 'numberRange' ? undefined : field.name} label={field.label}>
                {renderField(field)}
              </Form.Item>
            </Col>
          ))}
        </Row>
        <div className="search-form-actions">
          <Space size={10}>
            <Button type="primary" htmlType="submit" loading={loading}>
              查询
            </Button>
            <Button onClick={handleReset}>
              重置
            </Button>
          </Space>
        </div>
      </Form>
    </Card>
  )
}

export default SearchForm
