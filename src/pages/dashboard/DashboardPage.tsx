import { Card, Col, List, Row, Space, Typography } from 'antd'
import { MoneyCollectOutlined, TeamOutlined, ShoppingCartOutlined, RiseOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { getDashboardApi } from '@/api/dashboard'
import type { DashboardStats, OrderItem } from '@/types'
import StatCard from '@/components/StatCard'
import StatusTag from '@/components/StatusTag'

const orderStatusLabelMap: Record<OrderItem['status'], string> = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  cancelled: '已取消',
}

const getOrderStatusLabel = (status: OrderItem['status']) => orderStatusLabelMap[status] ?? status

const DashboardPage = () => {
  const [data, setData] = useState<DashboardStats>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const result = await getDashboardApi()
      setData(result)
      setLoading(false)
    }
    void fetchData()
  }, [])

  const chartOption = useMemo(() => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['成交金额', '订单数量'] },
    xAxis: { type: 'category', data: data?.trend.map((item) => item.month) ?? [] },
    yAxis: [
      { type: 'value', name: '金额' },
      { type: 'value', name: '订单数' },
    ],
    series: [
      {
        name: '成交金额',
        type: 'line',
        smooth: true,
        data: data?.trend.map((item) => item.amount) ?? [],
      },
      {
        name: '订单数量',
        type: 'bar',
        yAxisIndex: 1,
        data: data?.trend.map((item) => item.orders) ?? [],
      },
    ],
  }), [data])

  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      <div>
        <Typography.Title level={3} style={{ marginBottom: 8 }}>经营仪表盘</Typography.Title>
        <Typography.Text type="secondary">聚合展示客户增长、订单履约与收入走势，体现真实后台首页的数据运营场景。</Typography.Text>
      </div>
      <div className="stats-grid">
        <StatCard title="客户总数" value={data?.customerTotal ?? 0} prefix={<TeamOutlined />} />
        <StatCard title="订单总数" value={data?.orderTotal ?? 0} prefix={<ShoppingCartOutlined />} />
        <StatCard title="本月新增客户" value={data?.monthlyCustomers ?? 0} prefix={<RiseOutlined />} />
        <StatCard title="成交金额" value={data?.dealAmount ?? 0} prefix={<MoneyCollectOutlined />} suffix="元" />
      </div>
      <Row gutter={16}>
        <Col span={16}>
          <Card className="page-card dashboard-panel-card" loading={loading} title="经营趋势">
            <ReactECharts option={chartOption} className="dashboard-chart" />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="page-card dashboard-panel-card" loading={loading} title="最近订单">
            <List
              className="recent-order-list"
              dataSource={data?.recentOrders ?? []}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta title={item.orderNo} description={`${item.customerName} · ${item.product}`} />
                  <div className="recent-order-meta">
                    <Typography.Text strong>¥{item.amount.toLocaleString()}</Typography.Text>
                    <div>
                      <StatusTag status={item.status} text={getOrderStatusLabel(item.status)} />
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  )
}

export default DashboardPage
