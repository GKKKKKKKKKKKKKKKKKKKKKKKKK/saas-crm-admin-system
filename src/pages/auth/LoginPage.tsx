import { Alert, Button, Card, Form, Input, Space, Typography, message } from 'antd'
import { SafetyCertificateOutlined, LineChartOutlined, TeamOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'

const LoginPage = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const loading = useAuthStore((state) => state.loading)
  const bootstrap = useAppStore((state) => state.bootstrap)
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (values: { username: string; password: string }) => {
    setSubmitError('')
    try {
      await login(values)
      const user = useAuthStore.getState().user
      if (user) {
        bootstrap(user.permissions)
      }
      const nextMenus = useAppStore.getState().menus
      const nextPath = nextMenus[0]?.path ?? '/403'
      message.success('登录成功')
      navigate(nextPath)
    } catch (error) {
      const backendMessage = (
        error as {
          response?: { data?: { message?: string } }
          message?: string
        }
      ).response?.data?.message
      const fallbackMessage = '登录失败，请检查账号密码'
      const errorMessage = backendMessage ?? (error as { message?: string }).message ?? fallbackMessage
      setSubmitError(errorMessage)
      message.error(errorMessage)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-panel">
        <div className="login-brand">
          <div>
            <Typography.Title style={{ color: '#fff', marginBottom: 12 }}>SaaS Admin Suite</Typography.Title>
            <Typography.Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
              面向销售管理、订单履约与组织协同的一体化后台项目，覆盖仪表盘、客户、订单、用户、角色与权限全流程。
            </Typography.Paragraph>
          </div>
          <Space direction="vertical" size={24}>
            <Card>
              <Space><LineChartOutlined />多维经营数据分析</Space>
            </Card>
            <Card>
              <Space><TeamOutlined />客户生命周期管理</Space>
            </Card>
            <Card>
              <Space><SafetyCertificateOutlined />企业级 RBAC 权限体系</Space>
            </Card>
          </Space>
        </div>
        <div className="login-form-wrap">
          <Card bordered={false} style={{ width: 420 }}>
            <Typography.Title level={2}>欢迎登录</Typography.Title>
            <Typography.Paragraph type="secondary">演示账号：demo-admin / demo-password，demo-sales / demo-password，demo-viewer / demo-password</Typography.Paragraph>
            <Form
              layout="vertical"
              size="large"
              onFinish={handleSubmit}
              onValuesChange={() => {
                if (submitError) {
                  setSubmitError('')
                }
              }}
              initialValues={{ username: 'demo-admin', password: 'demo-password' }}
            >
              {submitError ? <Alert type="error" showIcon message={submitError} style={{ marginBottom: 16 }} /> : null}
              <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>登录</Button>
              <div style={{ marginTop: 12, textAlign: 'right' }}><Link to="/forgot-password">忘记密码？</Link></div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
