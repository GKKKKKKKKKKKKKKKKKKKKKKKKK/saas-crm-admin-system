import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge, Card, Descriptions, Divider, Drawer, Empty, Input, Popconfirm, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import PermissionButton from '@/components/PermissionButton'
import { feedback } from '@/utils/feedback'
import { getPermissionModuleLabel } from '@/utils/permission'
import {
  deletePermissionPresetApi,
  getPermissionPresetDetailApi,
  getPermissionPresetsApi,
} from '@/api/permissionPreset'
import type { PermissionPreset, PermissionPresetListItem } from '@/types/permissionPreset'
import { useEmptyResultPrompt } from '@/hooks/useEmptyResultPrompt'
import TableEmpty from '@/components/TableEmpty'

interface PermissionPresetListPanelProps {
  embedded?: boolean
  refreshKey?: number
  onCreatePreset?: () => void
  onEditPreset?: (preset: PermissionPreset) => void
}

const PermissionPresetListPanel = ({ embedded = false, refreshKey = 0, onCreatePreset, onEditPreset }: PermissionPresetListPanelProps) => {
  const [list, setList] = useState<PermissionPresetListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState<PermissionPreset | null>(null)
  const emptyResultPrompt = useEmptyResultPrompt()

  const loadList = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getPermissionPresetsApi({ current: page, pageSize, keyword: keyword || undefined })
      setList(result.list)
      setTotal(result.total)
      emptyResultPrompt.onFetchSuccess({
        listLength: result.list.length,
        total: result.total,
        page,
      })
    } catch {
    } finally {
      setLoading(false)
    }
  }, [keyword, page, pageSize])

  useEffect(() => {
    void loadList()
  }, [loadList, refreshKey])

  const handleOpenDetail = async (id: number) => {
    try {
      const presetDetail = await getPermissionPresetDetailApi(id)
      setDetail(presetDetail)
      setDetailOpen(true)
    } catch {
      feedback.error('预设详情加载失败')
    }
  }

  const columns: ColumnsType<PermissionPresetListItem> = useMemo(() => [
    { title: '预设名称', dataIndex: 'name' },
    { title: '预设编码', dataIndex: 'code' },
    { title: '预设描述', dataIndex: 'description', render: (value) => value || '-' },
    { title: '权限数量', dataIndex: 'permissionCount', render: (value) => <Tag color="blue">{value}</Tag> },
    { title: '更新时间', dataIndex: 'updatedAt', render: (value) => value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-' },
    {
      title: '操作',
      width: 220,
      render: (_, record) => (
        <Space>
          <PermissionButton
            permission="permissionPreset.update"
            type="link"
            onClick={async () => {
              if (!onEditPreset) {
                return
              }
              try {
                const presetDetail = await getPermissionPresetDetailApi(record.id)
                onEditPreset(presetDetail)
              } catch {
                feedback.error('预设详情加载失败')
              }
            }}
          >
            编辑
          </PermissionButton>
          <PermissionButton permission="permissionPreset.read" type="link" onClick={async () => { await handleOpenDetail(record.id) }}>
            查看
          </PermissionButton>
          <Popconfirm
            title="确认删除该记录吗？"
            description="此操作不可恢复"
            onConfirm={async () => {
              try {
                await deletePermissionPresetApi(record.id)
                feedback.success('删除成功')
                void loadList()
              } catch {
                feedback.error('删除失败，请稍后重试')
              }
            }}
          >
            <PermissionButton permission="permissionPreset.delete" type="link" danger>
              删除
            </PermissionButton>
          </Popconfirm>
        </Space>
      ),
    },
  ], [loadList, onEditPreset])

  const permissionGroups = useMemo(() => {
    const map = new Map<string, PermissionPreset['permissions']>()
    detail?.permissions.forEach((permission) => {
      const moduleKey = permission.module || '未分组'
      const group = map.get(moduleKey) ?? []
      group.push(permission)
      map.set(moduleKey, group)
    })
    return Array.from(map.entries()).map(([moduleName, permissions]) => ({
      moduleName: moduleName === '未分组' ? moduleName : getPermissionModuleLabel(moduleName),
      permissions,
    }))
  }, [detail?.permissions])

  const detailTitle = (
    <Space direction="vertical" size={2}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        预设详情
      </Typography.Title>
      <Typography.Text type="secondary">
        {detail?.code || '未设置编码'} · {detail?.permissions.length ?? 0} 项权限
      </Typography.Text>
    </Space>
  )

  return (
    <>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Input.Search
          allowClear
          placeholder="按预设名称或编码搜索"
          style={{ width: 320 }}
          onSearch={(value) => {
            emptyResultPrompt.markTriggered({ keyword: value.trim() })
            setPage(1)
            setKeyword(value.trim())
          }}
        />
        <PermissionButton permission="permissionPreset.create" type="primary" onClick={onCreatePreset}>
          新增预设
        </PermissionButton>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={list}
        size={embedded ? 'middle' : 'large'}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage)
            setPageSize(nextPageSize)
          },
        }}
        locale={{ emptyText: <TableEmpty /> }}
      />
      <Drawer
        title={detailTitle}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={680}
        destroyOnClose
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card size="small" bordered={false}>
            <Descriptions column={2} size="middle" labelStyle={{ color: 'rgba(0, 0, 0, 0.45)' }}>
              <Descriptions.Item label="预设名称" span={2}>
                <Typography.Text strong style={{ fontSize: 16 }}>
                  {detail?.name || '未命名预设'}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="预设编码">
                <Typography.Text code>{detail?.code || '未设置编码'}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="权限数量">
                <Badge
                  count={detail?.permissions.length ?? 0}
                  showZero
                  color="#1677ff"
                  style={{ boxShadow: 'none' }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="预设描述" span={2}>
                <Typography.Text type={detail?.description ? undefined : 'secondary'}>
                  {detail?.description || '未填写描述'}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="更新时间" span={2}>
                {detail?.updatedAt ? dayjs(detail.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '暂无更新时间'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            size="small"
            bordered={false}
            title={
              <Space>
                <Typography.Text strong>权限列表</Typography.Text>
                <Typography.Text type="secondary">
                  共 {detail?.permissions.length ?? 0} 项
                </Typography.Text>
              </Space>
            }
          >
            {permissionGroups.length ? (
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {permissionGroups.map((group, index) => (
                  <Space key={group.moduleName} direction="vertical" size={8} style={{ width: '100%' }}>
                    <Typography.Text strong>{group.moduleName}</Typography.Text>
                    <Space wrap size={[8, 8]}>
                      {group.permissions.map((permission) => (
                        <Tag key={permission.id || permission.code} color="blue">
                          {permission.name || permission.code}
                        </Tag>
                      ))}
                    </Space>
                    {index !== permissionGroups.length - 1 ? <Divider style={{ margin: '4px 0' }} /> : null}
                  </Space>
                ))}
              </Space>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无权限" />
            )}
          </Card>
        </Space>
      </Drawer>
    </>
  )
}

export default PermissionPresetListPanel
