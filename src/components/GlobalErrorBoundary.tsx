import { Button, Result } from 'antd'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { showGlobalError } from '@/utils/globalError'

type BoundaryProps = {
  children: ReactNode
  resetKey: string
}

type BoundaryState = {
  hasError: boolean
}

class GlobalErrorBoundaryCore extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    showGlobalError({
      title: '页面渲染异常',
      message: error.message || '页面渲染发生错误',
      detail: [error.stack, errorInfo.componentStack].filter(Boolean).join('\n'),
      rawError: error,
      dedupeKey: ['react.boundary', this.props.resetKey, error.message].join('|'),
    })
  }

  componentDidUpdate(prevProps: BoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <Result
        status="500"
        title="页面异常"
        subTitle="页面运行出错，请刷新页面后重试"
        extra={<Button type="primary" onClick={() => window.location.reload()}>刷新页面</Button>}
      />
    )
  }
}

const GlobalErrorBoundary = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation()
  return <GlobalErrorBoundaryCore resetKey={pathname}>{children}</GlobalErrorBoundaryCore>
}

export default GlobalErrorBoundary
