// simplified for public showcase
const demoLogs = [
  {
    id: 1n,
    user_id: 1n,
    module: "showcase",
    action: "view",
    detail: "simplified for portfolio version",
    created_at: new Date(),
    users: { id: 1n, username: "demo", email: "demo@example.com" },
  },
];

export const logService = {
  async createLog(..._args: any[]) {
    return { success: true, notice: "simplified for public showcase" };
  },
  async list(page: number, pageSize: number) {
    return { list: demoLogs, total: demoLogs.length, page, pageSize, notice: "simplified for portfolio version" };
  },
};
