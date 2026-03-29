import request from '@/api/request'
import { storage } from '@/utils/storage'
import type { PaginationResult } from '@/types'

type BackendFileItem = {
  id: string | number
  filename: string
  storage_key: string
  url: string
  mime_type?: string | null
  size: number | string
  storage_disk: string
  business_type?: string | null
  business_id?: string | number | null
  uploaded_by?: string | number | null
  uploader_name?: string | null
  remark?: string | null
  created_at?: string | null
}

type BackendFilePayload = {
  list?: BackendFileItem[]
  total?: number
  page?: number
  current?: number
  pageSize?: number
}

export type UploadBusinessType = 'user' | 'customer' | 'order'

export type UploadedFileItem = {
  id: number
  filename: string
  url: string
  mimeType: string
  size: number
  businessType: UploadBusinessType
  businessId?: number
  uploadedBy?: number
  uploaderName: string
  remark: string
  createdAt: string
}

const mapFile = (item: BackendFileItem): UploadedFileItem => ({
  id: Number(item.id),
  filename: item.filename,
  url: item.url,
  mimeType: item.mime_type ?? '',
  size: Number(item.size),
  businessType: (item.business_type ?? 'customer') as UploadBusinessType,
  businessId: item.business_id === null || item.business_id === undefined ? undefined : Number(item.business_id),
  uploadedBy: item.uploaded_by === null || item.uploaded_by === undefined ? undefined : Number(item.uploaded_by),
  uploaderName: item.uploader_name ?? '',
  remark: item.remark ?? '',
  createdAt: item.created_at ?? '',
})

const parseFilenameFromDisposition = (value: string | null) => {
  if (!value) {
    return ''
  }
  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }
  const basicMatch = value.match(/filename="?([^";]+)"?/i)
  return basicMatch?.[1] ?? ''
}

export const uploadFileApi = async (payload: {
  file: File
  businessType: UploadBusinessType
  businessId?: number
  remark?: string
  usage?: 'avatar' | 'attachment'
  onUploadProgress?: (event: { loaded: number; total?: number }) => void
}): Promise<UploadedFileItem> => {
  const formData = new FormData()
  formData.append('file', payload.file)
  formData.append('businessType', payload.businessType)
  if (payload.businessId !== undefined) {
    formData.append('businessId', String(payload.businessId))
  }
  if (payload.remark) {
    formData.append('remark', payload.remark)
  }
  if (payload.usage) {
    formData.append('usage', payload.usage)
  }

  const result = await request.post<FormData, BackendFileItem>('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (event) => {
      if (!payload.onUploadProgress) {
        return
      }
      payload.onUploadProgress({
        loaded: event.loaded,
        total: typeof event.total === 'number' ? event.total : undefined,
      })
    },
  })

  return mapFile(result)
}

export const getFileListApi = async (params: {
  businessType: UploadBusinessType
  businessId?: number
  current?: number
  pageSize?: number
}): Promise<PaginationResult<UploadedFileItem>> => {
  const result = await request.get<never, BackendFilePayload>('/files', {
    params: {
      businessType: params.businessType,
      businessId: params.businessId,
      current: params.current ?? 1,
      pageSize: params.pageSize ?? 10,
    },
  })

  return {
    list: (result.list ?? []).map(mapFile),
    total: result.total ?? 0,
    current: result.current ?? result.page ?? 1,
    pageSize: result.pageSize ?? 10,
  }
}

export const getFileDetailApi = async (id: number): Promise<UploadedFileItem> => {
  const result = await request.get<never, BackendFileItem>(`/files/${id}`)
  return mapFile(result)
}

export const downloadFileApi = async (id: number): Promise<{ blob: Blob; filename: string }> => {
  const token = storage.getToken()
  const response = await fetch(`/api/files/${id}/download`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) {
    throw new Error('下载失败')
  }

  const blob = await response.blob()
  const filename = parseFilenameFromDisposition(response.headers.get('content-disposition')) || `file-${id}`
  return { blob, filename }
}

export const deleteFileApi = async (id: number): Promise<boolean> => {
  await request.delete<never, null>(`/files/${id}`)
  return true
}
