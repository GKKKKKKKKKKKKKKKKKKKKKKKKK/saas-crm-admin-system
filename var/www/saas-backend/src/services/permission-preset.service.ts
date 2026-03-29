// simplified for public showcase
const demoPermissions = [
  { id: 1n, name: "看板查看", code: "dashboard.view", module: "dashboard" },
  { id: 2n, name: "客户查看", code: "customers.read", module: "customers" },
];

const demoPreset = {
  id: 1n,
  name: "演示权限模板",
  code: "showcase_preset",
  description: "simplified for portfolio version",
  createdAt: new Date(),
  updatedAt: new Date(),
  permissions: demoPermissions,
};

export const permissionPresetService = {
  async list(params: Record<string, unknown> = {}, ..._args: any[]) {
    return {
      list: [{ id: demoPreset.id, name: demoPreset.name, code: demoPreset.code, description: demoPreset.description, permissionCount: demoPreset.permissions.length, createdAt: demoPreset.createdAt, updatedAt: demoPreset.updatedAt }],
      total: 1,
      page: Number(params.page ?? 1),
      pageSize: Number(params.pageSize ?? 10),
      notice: "simplified for public showcase",
    };
  },
  async detail(..._args: any[]) {
    return demoPreset;
  },
  async options(..._args: any[]) {
    return [{ label: demoPreset.name, value: Number(demoPreset.id), code: demoPreset.code }];
  },
  async create(..._args: any[]) {
    return demoPreset;
  },
  async update(..._args: any[]) {
    return demoPreset;
  },
  async remove(..._args: any[]) {
    return { success: true, notice: "simplified for portfolio version" };
  },
};
