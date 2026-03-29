import { CameraOutlined, LoadingOutlined, ZoomInOutlined } from '@ant-design/icons'
import { Avatar, Button, Card, Col, Descriptions, Form, Input, Modal, Progress, Row, Slider, Typography, message } from 'antd'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import type { ChangeEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { uploadFileApi } from '@/api/files'
import { getProfileApi } from '@/api/auth'
import { getAvatarBgColor, getAvatarText } from '@/utils/avatar'
import { cropImageToFile } from '@/utils/cropImage'

type ProfileFormValues = {
  name: string
  username: string
  email: string
  phone: string
  position: string
  department: string
}

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const setUser = useAuthStore((state) => state.setUser)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [uploadPercent, setUploadPercent] = useState(0)
  const [progressAvailable, setProgressAvailable] = useState(false)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [cropModalVisible, setCropModalVisible] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)


  const initialValues = useMemo<ProfileFormValues>(() => ({
    name: user?.name ?? user?.username ?? '',
    username: user?.username ?? '',
    email: user?.email ?? '',
    phone: user?.mobile ?? '',
    position: user?.position ?? user?.title ?? '',
    department: user?.department ?? '',
  }), [user])

  useEffect(() => {
    form.setFieldsValue(initialValues)
  }, [form, initialValues])

  useEffect(() => () => {
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl)
    }
  }, [selectedImageUrl])

  const resetCropState = () => {
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl)
    }
    setSelectedFile(null)
    setSelectedImageUrl('')
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setCropModalVisible(false)
  }

  const validateAvatarFile = (file: File) => {
    if (!user?.id) {
      message.error('用户信息不存在')
      return false
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      message.error('仅支持 JPG/PNG/WEBP 图片')
      return false
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error('头像文件不能超过 5MB')
      return false
    }
    return true
  }

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) {
      message.error('用户信息不存在')
      return
    }

    try {
      setAvatarUploading(true)
      setUploadPercent(0)
      setProgressAvailable(false)
      await uploadFileApi({
        file,
        businessType: 'user',
        businessId: user.id,
        usage: 'avatar',
        onUploadProgress: (event) => {
          if (typeof event.total === 'number' && event.total > 0) {
            setProgressAvailable(true)
            setUploadPercent(Math.min(100, Math.max(0, Math.round((event.loaded / event.total) * 100))))
            return
          }
          setProgressAvailable(false)
        },
      })
      const latestUser = await getProfileApi()
      setUser(latestUser)
      message.success('头像上传成功')
    } catch {
      message.error('头像上传失败')
    } finally {
      setAvatarUploading(false)
      setUploadPercent(0)
      setProgressAvailable(false)
    }
  }

  const handleAvatarChoose = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    if (!validateAvatarFile(file)) {
      event.target.value = ''
      return
    }

    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl)
    }
    const nextUrl = URL.createObjectURL(file)
    setSelectedFile(file)
    setSelectedImageUrl(nextUrl)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setCropModalVisible(true)
    event.target.value = ''
  }

  const handleCropCancel = () => {
    if (avatarUploading) {
      return
    }
    resetCropState()
  }

  const handleCropConfirm = async () => {
    if (avatarUploading) {
      return
    }
    if (!selectedFile || !selectedImageUrl || !croppedAreaPixels) {
      message.error('请先调整裁剪区域')
      return
    }
    try {
      const croppedFile = await cropImageToFile({
        imageSrc: selectedImageUrl,
        cropArea: {
          x: croppedAreaPixels.x,
          y: croppedAreaPixels.y,
          width: croppedAreaPixels.width,
          height: croppedAreaPixels.height,
        },
        fileName: selectedFile.name,
        mimeType: selectedFile.type || 'image/png',
      })
      await handleAvatarUpload(croppedFile)
      resetCropState()
    } catch {
      message.error('裁剪失败，请重试')
    }
  }

  const triggerAvatarSelect = () => {
    if (avatarUploading || cropModalVisible) {
      return
    }
    fileInputRef.current?.click()
  }

  const handleSubmit = async (values: ProfileFormValues) => {
    setSubmitting(true)
    try {
      await updateProfile({
        name: values.name,
        email: values.email,
        mobile: values.phone,
        position: values.position,
        department: values.department,
      })
      message.success('保存成功')
    } catch (error) {
      const nameError = (
        error as {
          response?: { data?: { data?: { fieldErrors?: Record<string, string[]> }; message?: string } }
          data?: { fieldErrors?: Record<string, string[]> }
          message?: string
        }
      ).response?.data?.data?.fieldErrors?.name?.[0]
        ?? (
          error as {
            response?: { data?: { data?: { fieldErrors?: Record<string, string[]> }; message?: string } }
            data?: { fieldErrors?: Record<string, string[]> }
            message?: string
          }
        ).data?.fieldErrors?.name?.[0]
      const fallback = '保存失败，请稍后重试'
      const backendMessage = (
        error as {
          response?: { data?: { data?: { fieldErrors?: Record<string, string[]> }; message?: string } }
          data?: { fieldErrors?: Record<string, string[]> }
          message?: string
        }
      ).response?.data?.message
        ?? (
          error as {
            response?: { data?: { data?: { fieldErrors?: Record<string, string[]> }; message?: string } }
            data?: { fieldErrors?: Record<string, string[]> }
            message?: string
          }
        ).message
      message.error(nameError ?? backendMessage ?? fallback)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitFailed = () => {
    message.error('请先修正表单校验错误后再提交')
  }

  return (
    <>
      <Row gutter={16}>
        <Col span={10}>
          <Card className="page-card" title="个人信息">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div className={`avatar-wrapper ${avatarUploading ? 'loading' : ''}`} onClick={triggerAvatarSelect} role="button" tabIndex={0} aria-disabled={avatarUploading} onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  triggerAvatarSelect()
                }
              }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name ?? user?.username ?? 'avatar'} className="avatar" />
                ) : (
                  <Avatar
                    size={120}
                    className="avatar avatar-fallback"
                    style={{
                      backgroundColor: getAvatarBgColor(user?.name ?? user?.username),
                      color: '#fff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                    }}
                  >
                    {getAvatarText(user?.name ?? user?.username)}
                  </Avatar>
                )}
                <div className="avatar-mask">
                  {avatarUploading ? (
                    progressAvailable ? (
                      <Progress
                        type="circle"
                        percent={uploadPercent}
                        size={60}
                        strokeWidth={6}
                        showInfo
                        className="avatar-upload-progress"
                      />
                    ) : (
                      <>
                        <LoadingOutlined />
                        <span>上传中...</span>
                      </>
                    )
                  ) : (
                    <>
                      <CameraOutlined />
                      <span>更换头像</span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChoose}
                />
              </div>
              <Typography.Title level={4} style={{ marginTop: 16 }}>{user?.name ?? user?.username}</Typography.Title>
              <Typography.Text type="secondary">{user?.position || user?.title || '-'}</Typography.Text>
            </div>
            <Descriptions column={1}>
              <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{user?.email}</Descriptions.Item>
              <Descriptions.Item label="手机">{user?.mobile}</Descriptions.Item>
              <Descriptions.Item label="职位">{user?.position || user?.title || '-'}</Descriptions.Item>
              <Descriptions.Item label="部门">{user?.department || '-'}</Descriptions.Item>
              <Descriptions.Item label="角色">{user?.role}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={14}>
          <Card className="page-card" title="修改资料">
            <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleSubmit} onFinishFailed={handleSubmitFailed}>
              <Form.Item label="用户名" name="username"><Input readOnly /></Form.Item>
              <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }, { min: 2, message: '姓名至少 2 个字符' }]}><Input /></Form.Item>
              <Form.Item label="邮箱" name="email" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入合法邮箱' }]}><Input /></Form.Item>
              <Form.Item label="手机" name="phone" rules={[{ required: true, message: '请输入手机' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入合法手机号' }]}><Input /></Form.Item>
              <Form.Item label="职位" name="position"><Input /></Form.Item>
              <Form.Item label="部门" name="department"><Input /></Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting}>保存修改</Button>
            </Form>
          </Card>
        </Col>
      </Row>
      <Modal
        title="裁剪头像"
        open={cropModalVisible}
        onCancel={handleCropCancel}
        onOk={() => {
          void handleCropConfirm()
        }}
        okText="确认上传"
        cancelText="取消"
        confirmLoading={avatarUploading}
        maskClosable={!avatarUploading}
        keyboard={!avatarUploading}
        closable={!avatarUploading}
        centered
      >
        <div className="avatar-cropper-wrap">
          {selectedImageUrl ? (
            <Cropper
              image={selectedImageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_: Area, areaPixels: Area) => {
                setCroppedAreaPixels(areaPixels)
              }}
            />
          ) : null}
        </div>
        <div className="avatar-cropper-zoom" aria-label="图片缩放控制">
          <div className="avatar-cropper-zoom-label">
            <ZoomInOutlined />
            <span>缩放大小</span>
          </div>
          <Slider min={1} max={3} step={0.1} value={zoom} onChange={setZoom} />
        </div>
      </Modal>
    </>
  )
}

export default ProfilePage
