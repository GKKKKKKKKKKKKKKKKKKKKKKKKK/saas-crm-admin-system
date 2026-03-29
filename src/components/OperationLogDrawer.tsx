import { Drawer, Empty, List, Space, Tag, Typography } from 'antd'
import type { OperationLogItem } from '@/types'

const actionLabelMap: Record<OperationLogItem['action'], string> = {
  delete: '删除',
  batch_delete: '批量删除',
  status_update: '状态切换',
  export: '导出',
  edit_save: '编辑保存',
  batch_status_update: '批量状态切换',
  create: '新增',
  update: '更新',
  read: '标记已读',
  read_all: '全部已读',
}

const moduleLabelMap: Record<OperationLogItem['module'], string> = {
  customers: '客户管理',
  orders: '订单管理',
  users: '用户管理',
  roles: '角色权限',
  customer_follow_ups: '客户跟进',
  contracts: '合同管理',
  payments: '回款管理',
  notifications: '通知中心',
}

interface OperationLogDrawerProps {
  open: boolean
  onClose: () => void
  logs: OperationLogItem[]
}

const OperationLogDrawer = ({ open, onClose, logs }: OperationLogDrawerProps) => (
  <Drawer title="操作日志" open={open} onClose={onClose} width={560}>
    {!logs.length ? (
      <Empty description="暂无日志" />
    ) : (
      <List
        dataSource={logs}
        renderItem={(item) => (
          <List.Item>
            <Space direction="vertical" size={4}>
              <Space>
                <Tag color="blue">{moduleLabelMap[item.module]}</Tag>
                <Tag color="purple">{actionLabelMap[item.action]}</Tag>
                <Typography.Text type="secondary">{item.createdAt}</Typography.Text>
              </Space>
              <Typography.Text>{item.description}</Typography.Text>
              <Typography.Text type="secondary">操作人：{item.actor}，对象：{item.target}</Typography.Text>
            </Space>
          </List.Item>
        )}
      />
    )}
  </Drawer>
)

export default OperationLogDrawer
