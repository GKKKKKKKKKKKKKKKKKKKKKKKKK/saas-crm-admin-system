import { Card, Statistic } from 'antd'
import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: number | string
  prefix?: ReactNode
  suffix?: string
}

const StatCard = ({ title, value, prefix, suffix }: StatCardProps) => (
  <Card className="page-card metric-card">
    <Statistic className="metric-statistic" title={title} value={value} prefix={prefix} suffix={suffix} />
  </Card>
)

export default StatCard
