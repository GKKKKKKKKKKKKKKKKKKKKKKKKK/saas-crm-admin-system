import { Button, Space, Tooltip } from 'antd'
import type { ReactNode } from 'react'

interface RowActionItem {
  key: string
  label: string
  icon?: ReactNode
  onClick?: () => void
  danger?: boolean
  disabled?: boolean
  tooltip?: string
  hidden?: boolean
  render?: (node: ReactNode) => ReactNode
}

interface RowActionsProps {
  items: RowActionItem[]
}

const RowActions = ({ items }: RowActionsProps) => (
  <Space size={4} className="row-actions">
    {items.filter((item) => !item.hidden).map((item) => {
      const buttonNode = (
        <Button
          type="text"
          size="small"
          icon={item.icon}
          danger={item.danger}
          disabled={item.disabled}
          onClick={item.onClick}
          className="row-actions-btn"
        >
          {item.label}
        </Button>
      )

      const withTooltip = item.tooltip
        ? <Tooltip title={item.tooltip}>{buttonNode}</Tooltip>
        : buttonNode

      const finalNode = item.render ? item.render(withTooltip) : withTooltip
      return <span key={item.key}>{finalNode}</span>
    })}
  </Space>
)

export default RowActions
