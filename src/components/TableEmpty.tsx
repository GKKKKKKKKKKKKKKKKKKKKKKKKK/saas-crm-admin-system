import { Empty, Typography } from 'antd'

interface TableEmptyProps {
  description?: string
}

const TableEmpty = ({ description = '暂无匹配数据，请调整筛选条件后重试' }: TableEmptyProps) => (
  <div className="table-empty-wrap">
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={null}>
      <Typography.Text type="secondary">{description}</Typography.Text>
    </Empty>
  </div>
)

export default TableEmpty
