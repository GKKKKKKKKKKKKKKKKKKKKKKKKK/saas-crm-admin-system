import { Space } from 'antd'
import type { ReactNode } from 'react'

interface ListToolbarProps {
  left: ReactNode
  right: ReactNode
}

const ListToolbar = ({ left, right }: ListToolbarProps) => (
  <div className="list-toolbar">
    <Space size={10} wrap className="list-toolbar-group">
      {left}
    </Space>
    <Space size={10} wrap className="list-toolbar-group list-toolbar-group-right">
      {right}
    </Space>
  </div>
)

export default ListToolbar
