import { Alert, Button, Card, Form, Input, Space, Typography, message } from 'antd'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPasswordApi } from '@/api/auth'

const ForgotPasswordPage = () => {
  const [submitting, setSubmitting] = useState(false)
  const [resetLink, setResetLink] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (values: { email: string }) => {
    setSubmitting(true)
    try {
      const result = await forgotPasswordApi({ email: values.email })
      const nextMessage = '如果该邮箱已注册，我们已发送重置链接'
      setSuccessMessage(nextMessage)
      setResetLink(result.reset_link ?? '')
      message.success(nextMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = async () => {
    if (!resetLink) {
      return
    }
    await navigator.clipboard.writeText(resetLink)
    message.success('重置链接已复制')
  }

  return (
    <div className="login-shell">
      <div className="login-panel" style={{ justifyContent: 'center' }}>
        <div className="login-form-wrap" style={{ width: '100%' }}>
          <Card bordered={false} style={{ width: 420 }}>
            <Typography.Title level={2}>忘记密码</Typography.Title>
            <Typography.Paragraph type="secondary">输入注册邮箱，我们会处理密码重置请求</Typography.Paragraph>
            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item label="邮箱" name="email" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入正确的邮箱地址' }]}>
                <Input placeholder="请输入邮箱" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block loading={submitting}>
                发送重置请求
              </Button>
            </Form>
            {successMessage ? <Alert style={{ marginTop: 16 }} type="success" showIcon message={successMessage} /> : null}
            {resetLink ? (
              <Space direction="vertical" style={{ marginTop: 16, width: '100%' }}>
                <Typography.Text type="secondary">开发环境重置链接</Typography.Text>
                <Input value={resetLink} readOnly />
                <Button onClick={() => void handleCopy()}>复制重置链接</Button>
              </Space>
            ) : null}
            <div style={{ marginTop: 16 }}>
              <Link to="/login">返回登录</Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
