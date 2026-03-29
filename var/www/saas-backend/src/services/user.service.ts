// simplified for public showcase
const demoUsers = [
  {
    id: 1n,
    username: "demo",
    name: "公开演示用户",
    email: "demo@example.com",
    phone: "",
    department: "Showcase",
    position: "Viewer",
    status: "active",
    created_at: new Date(),
    roles: {
      id: 1n,
      name: "演示角色",
      code: "showcase",
    },
  },
];

export const userService = {
  async list(..._args: any[]) {
    return demoUsers;
  },
  async create(..._args: any[]) {
    return demoUsers[0];
  },
  async update(..._args: any[]) {
    return demoUsers[0];
  },
  async remove(..._args: any[]) {
    return { success: true, notice: "simplified for public showcase" };
  },
};
