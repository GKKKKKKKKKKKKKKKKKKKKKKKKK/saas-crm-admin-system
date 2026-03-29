const demoCustomers = [
  { id: 1n, name: "演示客户A", company_name: "示例科技", phone: "13800000000", email: "demo@example.com", status: "active", remark: "demo-only showcase data", created_at: new Date(), users: { id: 1n, username: "demo-admin", email: "demo@example.com" } },
  { id: 2n, name: "演示客户B", company_name: "公开展示有限公司", phone: "13800000000", email: "demo@example.com", status: "pending", remark: "demo-only showcase data", created_at: new Date(), users: { id: 1n, username: "demo-admin", email: "demo@example.com" } },
];

export const customerService = {
  async list(params: Record<string, unknown> = {}, ..._args: any[]) {
    return { list: demoCustomers, total: demoCustomers.length, page: Number(params.page ?? 1), pageSize: Number(params.pageSize ?? 10), notice: "demo-only showcase response" };
  },
  async detail(id?: bigint, ..._args: any[]) {
    return demoCustomers.find((item) => item.id === id) ?? demoCustomers[0];
  },
  async create(..._args: any[]) {
    return demoCustomers[0];
  },
  async update(..._args: any[]) {
    return demoCustomers[0];
  },
  async remove(..._args: any[]) {
    return { success: true, notice: "demo-only showcase response" };
  },
};
