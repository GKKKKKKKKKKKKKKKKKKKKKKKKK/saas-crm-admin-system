import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import App from '@/App'
import 'dayjs/locale/zh-cn'
import '@/styles.css'

dayjs.locale('zh-cn')

const bootstrap = async () => {
  const useMock = (import.meta as { env?: Record<string, string> }).env?.VITE_USE_MOCK !== 'false'
  if (useMock) {
    await import('@/mock')
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ConfigProvider
        locale={zhCN}
        form={{
          validateMessages: {
            required: '请填写${label}',
          },
        }}
        theme={{
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 10,
            colorBgLayout: '#f3f5f9',
            colorBgContainer: '#ffffff',
            colorBorderSecondary: '#edf1f6',
            controlHeight: 36,
          },
          components: {
            Button: {
              borderRadius: 8,
              controlHeight: 36,
            },
            Input: {
              controlHeight: 36,
            },
            Select: {
              controlHeight: 36,
            },
            DatePicker: {
              controlHeight: 36,
            },
            Table: {
              cellPaddingBlock: 14,
            },
          },
        }}
      >
        <AntApp>
          <App />
        </AntApp>
      </ConfigProvider>
    </React.StrictMode>,
  )
}

void bootstrap()
