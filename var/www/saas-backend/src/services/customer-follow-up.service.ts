// simplified for public showcase
const demoFollowUps = [
  {
    id: 1n,
    customer_id: 1n,
    follow_up_type: "phone",
    content: "simplified for portfolio version",
    result: "继续跟进",
    next_follow_up_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    created_at: new Date(),
    users: { id: 1n, username: "demo-admin", email: "demo@example.com" },
    customers: { id: 1n, name: "演示客户A", company_name: "示例科技" },
    creator_name: "公开演示用户",
  },
];

export const customerFollowUpService = {
  async list(params: Record<string, unknown> = {}, ..._args: any[]) {
    return { list: demoFollowUps, total: demoFollowUps.length, page: Number((params as any).page ?? 1), pageSize: Number((params as any).pageSize ?? 10), notice: "simplified for public showcase" };
  },
  async timelineByCustomer(..._args: any[]) {
    return demoFollowUps;
  },
  async create(..._args: any[]) {
    return demoFollowUps[0];
  },
  async update(..._args: any[]) {
    return demoFollowUps[0];
  },
  async remove(..._args: any[]) {
    return { success: true, notice: "simplified for portfolio version" };
  },
};
