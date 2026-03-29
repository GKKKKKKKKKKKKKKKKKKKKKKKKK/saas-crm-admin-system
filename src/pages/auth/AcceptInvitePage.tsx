import { Alert, Button, Card, Form, Input, Typography, message } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { acceptInviteApi } from '@/api/auth'

const AcceptInvitePage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    if (!token) {
      message.error('邀请链接无效，请检查链接后重试')
      return
    }
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }
    setSubmitting(true)
    try {
      await acceptInviteApi({ token, password: values.password })
      message.success('密码设置成功，请使用新密码登录')
      navigate('/login')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-panel" style={{ justifyContent: 'center' }}>
        <div className="login-form-wrap" style={{ width: '100%' }}>
          <Card bordered={false} style={{ width: 420 }}>
            <Typography.Title level={2}>接受邀请</Typography.Title>
            <Typography.Paragraph type="secondary">请设置您的初始登录密码</Typography.Paragraph>
            {!token ? <Alert style={{ marginBottom: 16 }} type="error" showIcon message="缺少 token，无法完成邀请激活" /> : null}
            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item label="新密码" name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少 6 位' }]}>
                <Input.Password placeholder="请输入新密码" />
              </Form.Item>
              <Form.Item label="确认密码" name="confirmPassword" rules={[{ required: true, message: '请再次输入密码' }, { min: 6, message: '密码至少 6 位' }]}>
                <Input.Password placeholder="请再次输入新密码" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block loading={submitting} disabled={!token}>
                完成设置
              </Button>
              <Button style={{ marginTop: 12 }} block onClick={() => navigate('/login')}>
                返回登录
              </Button>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AcceptInvitePage
