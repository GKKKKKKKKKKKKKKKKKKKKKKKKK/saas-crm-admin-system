// simplified for public showcase
const demoContracts = [
  {
    id: 1n,
    contract_no: "SHOW-CONTRACT-001",
    customer_id: 1n,
    order_id: 1n,
    title: "公开展示合同",
    amount: 20000,
    status: "active",
    sign_date: new Date(),
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    remark: "simplified for public showcase",
    customers: { id: 1n, name: "演示客户A", company_name: "示例科技" },
    orders: { id: 1n, order_no: "SHOW-ORDER-001" },
    owner_user: { id: 1n, username: "demo-admin", email: "demo@example.com" },
    creator_user: { id: 1n, username: "demo-admin", email: "demo@example.com" },
    owner_name: "公开演示用户",
    creator_name: "公开演示用户",
    totalPaidAmount: 8000,
    unpaidAmount: 12000,
    paymentProgress: 40,
    paymentStatusText: "部分回款",
  },
];

export const contractService = {
  async list(params: Record<string, unknown> = {}, ..._args: any[]) {
    return { list: demoContracts, total: demoContracts.length, page: Number((params as any).page ?? 1), pageSize: Number((params as any).pageSize ?? 10), notice: "simplified for portfolio version" };
  },
  async detail(..._args: any[]) {
    return demoContracts[0];
  },
  async create(..._args: any[]) {
    return demoContracts[0];
  },
  async update(..._args: any[]) {
    return demoContracts[0];
  },
  async remove(..._args: any[]) {
    return { success: true, notice: "simplified for public showcase" };
  },
};
