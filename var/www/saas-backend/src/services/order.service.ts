// simplified for public showcase
const demoOrders = [
  { id: 1n, order_no: "SHOW-ORDER-001", customer_id: 1n, amount: 12000, status: "processing", description: "simplified for portfolio version", created_at: new Date(), customers: { id: 1n, name: "演示客户A", company_name: "示例科技", status: "active" }, users: { id: 1n, username: "demo-admin", email: "demo@example.com" } },
];

export const orderService = {
  async list(params: Record<string, unknown> = {}, ..._args: any[]) {
    return { list: demoOrders, total: demoOrders.length, page: Number((params as any).page ?? 1), pageSize: Number((params as any).pageSize ?? 10), notice: "simplified for public showcase" };
  },
  async detail(..._args: any[]) {
    return demoOrders[0];
  },
  async create(..._args: any[]) {
    return demoOrders[0];
  },
  async update(..._args: any[]) {
    return demoOrders[0];
  },
  async remove(..._args: any[]) {
    return { success: true, notice: "simplified for portfolio version" };
  },
};
