import { DeleteOutlined, DownloadOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Modal, Progress, Space, Table, Tag, Upload, message } from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { deleteFileApi, downloadFileApi, getFileListApi, uploadFileApi, type UploadBusinessType, type UploadedFileItem } from '@/api/files'
import { formatDateTime } from '@/utils/datetime'

type Props = {
  businessType: UploadBusinessType
  businessId?: number
  usage?: 'avatar' | 'attachment'
  maxSizeMB?: number
  accept?: string[]
  onUploaded?: (file: UploadedFileItem) => void
}

const defaultAccept = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain']

const formatBytes = (bytes: number) => {
  if (!bytes) {
    return '0 B'
  }
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let index = 0
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }
  return `${value.toFixed(value >= 100 || index === 0 ? 0 : 1)} ${units[index]}`
}

const FileUploadPanel = ({ businessType, businessId, usage = 'attachment', maxSizeMB = 10, accept = defaultAccept, onUploaded }: Props) => {
  const [list, setList] = useState<UploadedFileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadPercent, setUploadPercent] = useState(0)

  const fetchList = useCallback(async () => {
    if (!businessId) {
      setList([])
      return
    }
    setLoading(true)
    try {
      const result = await getFileListApi({
        businessType,
        businessId,
        current: 1,
        pageSize: 100,
      })
      setList(result.list)
    } catch {
      message.error('附件列表加载失败')
    } finally {
      setLoading(false)
    }
  }, [businessId, businessType])

  useEffect(() => {
    void fetchList()
  }, [fetchList])

  const beforeUpload = useCallback((file: File) => {
    if (!accept.includes(file.type)) {
      message.error('文件类型不支持')
      return Upload.LIST_IGNORE
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      message.error(`文件大小不能超过 ${maxSizeMB}MB`)
      return Upload.LIST_IGNORE
    }

    return true
  }, [accept, maxSizeMB])

  const onDelete = async (item: UploadedFileItem) => {
    Modal.confirm({
      title: '确认删除该文件吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        await deleteFileApi(item.id)
        message.success('删除成功')
        await fetchList()
      },
    })
  }

  const handleCustomUpload = async (options: { file: File; onSuccess?: () => void; onError?: () => void }) => {
    if (!businessId) {
      message.warning('请先保存基础信息再上传附件')
      return
    }

    setUploading(true)
    setUploadPercent(0)
    try {
      const result = await uploadFileApi({
        file: options.file,
        businessType,
        businessId,
        usage,
        onUploadProgress: (event) => {
          if (!event.total || event.total <= 0) {
            return
          }
          setUploadPercent(Math.round((event.loaded / event.total) * 100))
        },
      })
      message.success('上传成功')
      options.onSuccess?.()
      onUploaded?.(result)
      await fetchList()
    } catch {
      options.onError?.()
    } finally {
      setUploading(false)
      setUploadPercent(0)
    }
  }



  const openBlobInNewTab = async (item: UploadedFileItem) => {
    const { blob } = await downloadFileApi(item.id)
    const objectUrl = URL.createObjectURL(blob)
    window.open(objectUrl, '_blank')
    setTimeout(() => URL.revokeObjectURL(objectUrl), 30000)
  }

  const triggerDownload = async (item: UploadedFileItem) => {
    const { blob, filename } = await downloadFileApi(item.id)
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(objectUrl), 30000)
  }

  const columns = useMemo(() => [
    {
      title: '文件名',
      dataIndex: 'filename',
      key: 'filename',
      ellipsis: true,
    },
    {
      title: '上传人',
      dataIndex: 'uploaderName',
      key: 'uploaderName',
      width: 120,
      render: (value: string) => value || '-',
    },
    {
      title: '文件大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (value: number) => <Tag>{formatBytes(value)}</Tag>,
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'operation',
      width: 180,
      render: (_: unknown, record: UploadedFileItem) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => void openBlobInNewTab(record)}>预览</Button>
          <Button type="link" icon={<DownloadOutlined />} onClick={() => void triggerDownload(record)}>下载</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => void onDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ], [])

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      <Upload
        accept={accept.join(',')}
        fileList={[] as UploadFile[]}
        showUploadList={false}
        beforeUpload={(file) => beforeUpload(file as File)}
        customRequest={(options) => {
          void handleCustomUpload({
            file: options.file as File,
            onSuccess: () => options.onSuccess?.({}, new XMLHttpRequest()),
            onError: () => options.onError?.(new Error('upload failed')),
          })
        }}
      >
        <Button type="primary" icon={<UploadOutlined />} loading={uploading} disabled={!businessId}>上传文件</Button>
      </Upload>
      {uploading ? <Progress percent={uploadPercent} size="small" /> : null}
      <Table
        rowKey="id"
        dataSource={list}
        columns={columns}
        pagination={false}
        loading={loading}
        size="small"
      />
    </Space>
  )
}

export default FileUploadPanel
