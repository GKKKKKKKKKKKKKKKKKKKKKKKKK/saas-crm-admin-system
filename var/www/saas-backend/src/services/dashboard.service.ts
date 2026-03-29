// simplified for public showcase
const buildTrend = () => Array.from({ length: 7 }, (_, index) => ({
  date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  count: 5 + index,
  amount: 1000 + index * 300,
}));

export const dashboardService = {
  async summary(..._args: any[]) {
    return {
      customerTotal: 32,
      orderTotal: 58,
      monthCustomerTotal: 12,
      monthOrderAmount: 35600,
      notice: "simplified for public showcase",
    };
  },

  async charts(..._args: any[]) {
    return {
      orderTrend7Days: buildTrend(),
      orderStatusDistribution: [
        { status: "pending", count: 11 },
        { status: "processing", count: 27 },
        { status: "completed", count: 20 },
      ],
      notice: "simplified for portfolio version",
    };
  },

  async recentOrders(limit = 5, ..._args: any[]) {
    return Array.from({ length: Math.max(1, limit) }, (_, index) => ({
      id: BigInt(index + 1),
      order_no: `SHOW-ORDER-${String(index + 1).padStart(3, "0")}`,
      customer_id: 1n,
      customer_name: "演示客户",
      amount: 1000 + index * 200,
      status: "processing",
      created_at: new Date(),
      notice: "simplified for public showcase",
    }));
  },
};
