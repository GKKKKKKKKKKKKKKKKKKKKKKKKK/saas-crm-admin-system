// simplified for public showcase
const demoPayments = [
  {
    id: 1n,
    contract_id: 1n,
    order_id: 1n,
    customer_id: 1n,
    amount: 5000,
    payment_date: new Date(),
    payment_method: "bank",
    status: "confirmed",
    remark: "simplified for public showcase",
    created_at: new Date(),
    contracts: { id: 1n, contract_no: "SHOW-CONTRACT-001", customer_id: 1n, order_id: 1n },
    orders: { id: 1n, order_no: "SHOW-ORDER-001" },
    customers: { id: 1n, name: "演示客户A", company_name: "示例科技" },
    users: { id: 1n, username: "demo-admin", email: "demo@example.com" },
    creator_name: "公开演示用户",
  },
];

export const paymentService = {
  async list(params: Record<string, unknown> = {}, ..._args: any[]) {
    return { list: demoPayments, total: demoPayments.length, page: Number((params as any).page ?? 1), pageSize: Number((params as any).pageSize ?? 10), notice: "simplified for portfolio version" };
  },
  async detail(..._args: any[]) {
    return demoPayments[0];
  },
  async create(..._args: any[]) {
    return demoPayments[0];
  },
  async update(..._args: any[]) {
    return demoPayments[0];
  },
  async remove(..._args: any[]) {
    return { success: true, notice: "simplified for public showcase" };
  },
};
