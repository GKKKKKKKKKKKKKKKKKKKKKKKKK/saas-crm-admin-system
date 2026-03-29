// simplified for public showcase
const demoPermissions = [
  { id: 1n, code: "dashboard.view", name: "看板查看", module: "dashboard" },
  { id: 2n, code: "customers.read", name: "客户查看", module: "customers" },
];

const demoRoles = [
  { id: 1n, name: "演示管理员", code: "showcase_admin", description: "simplified for portfolio version", created_at: new Date(), role_permissions: demoPermissions.map((permission) => ({ permissions: permission })) },
];

export const roleService = {
  async list(..._args: any[]) {
    return demoRoles;
  },
  async permissions(..._args: any[]) {
    return demoPermissions;
  },
  async create(..._args: any[]) {
    return demoRoles[0];
  },
  async update(..._args: any[]) {
    return demoRoles[0];
  },
  async remove(..._args: any[]) {
    return { success: true, notice: "simplified for public showcase" };
  },
};
