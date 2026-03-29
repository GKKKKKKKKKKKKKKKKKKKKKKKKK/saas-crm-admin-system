import { Modal, message } from 'antd'

type MessageApi = {
  success: (content: string) => void
  error: (content: string) => void
  warning: (content: string) => void
}

type ModalApi = {
  confirm: (config: {
    title: string
    okText?: string
    cancelText?: string
    onOk?: () => void | Promise<void>
  }) => void
}

let runtimeMessageApi: MessageApi | null = null
let runtimeModalApi: ModalApi | null = null

export const installFeedback = (apis: { messageApi: MessageApi; modalApi: ModalApi }) => {
  runtimeMessageApi = apis.messageApi
  runtimeModalApi = apis.modalApi
}

const success = (text: string) => {
  if (runtimeMessageApi) {
    runtimeMessageApi.success(text)
    return
  }
  message.success(text)
}

const error = (text: string) => {
  if (runtimeMessageApi) {
    runtimeMessageApi.error(text)
    return
  }
  message.error(text)
}

const warning = (text: string) => {
  if (runtimeMessageApi) {
    runtimeMessageApi.warning(text)
    return
  }
  message.warning(text)
}

const confirm = (title: string, onOk: () => void | Promise<void>) => {
  if (runtimeModalApi) {
    runtimeModalApi.confirm({
      title,
      okText: '确认',
      cancelText: '取消',
      onOk: () => onOk(),
    })
    return
  }

  Modal.confirm({
    title,
    okText: '确认',
    cancelText: '取消',
    onOk: () => onOk(),
  })
}

export const feedback = {
  success,
  error,
  warning,
  confirm,
}
