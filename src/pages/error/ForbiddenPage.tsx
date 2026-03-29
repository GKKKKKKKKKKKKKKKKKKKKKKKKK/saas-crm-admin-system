import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'

const ForbiddenPage = () => {
  const navigate = useNavigate()
  const menus = useAppStore((state) => state.menus)
  const token = useAuthStore((state) => state.token)

  const handleBackHome = () => {
    if (!token) {
      navigate('/login', { replace: true })
      return
    }
    const firstMenuPath = menus[0]?.path || '/dashboard'
    navigate(firstMenuPath, { replace: true })
  }

  return <Result status="403" title="403" subTitle="当前账号暂无访问权限，请联系管理员授权。" extra={<Button type="primary" onClick={handleBackHome}>返回首页</Button>} />
}

export default ForbiddenPage
