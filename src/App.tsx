import { useEffect } from 'react'
import { App as AntdApp } from 'antd'
import { RouterProvider } from 'react-router-dom'
import router from '@/router'
import { useAuthStore } from '@/store/auth'
import { initGlobalErrorListeners, patchGlobalFetch } from '@/utils/globalError'
import { installFeedback } from '@/utils/feedback'

const FeedbackInstaller = () => {
  const { message, modal } = AntdApp.useApp()

  useEffect(() => {
    installFeedback({
      messageApi: {
        success: (content) => {
          void message.success(content)
        },
        error: (content) => {
          void message.error(content)
        },
        warning: (content) => {
          void message.warning(content)
        },
      },
      modalApi: {
        confirm: (config) => {
          modal.confirm({
            title: config.title,
            okText: config.okText,
            cancelText: config.cancelText,
            onOk: config.onOk,
          })
        },
      },
    })
  }, [message, modal])

  return null
}

const App = () => {
  const initAuth = useAuthStore((state) => state.initAuth)

  useEffect(() => {
    initGlobalErrorListeners()
    patchGlobalFetch()
    void initAuth()
  }, [initAuth])

  return (
    <>
      <FeedbackInstaller />
      <RouterProvider router={router} />
    </>
  )
}

export default App
