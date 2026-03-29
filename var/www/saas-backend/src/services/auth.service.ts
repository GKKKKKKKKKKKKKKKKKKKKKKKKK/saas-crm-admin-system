import { env } from "../config/env.js";

const demoPermissions = ["dashboard.view", "customers.read", "orders.read", "users.read", "roles.read", "profile.read", "notifications.view"];
const demoUser = { id: 1n, name: "公开演示用户", username: "demo-admin", email: "demo@example.com", phone: "13800000000", department: "Showcase", position: "Viewer", status: "active", avatar_url: "", role: { id: 1n, name: "演示角色", code: "showcase" }, permissions: demoPermissions };

export const authService = {
  async login(..._args: any[]) { return { token: "demo-access-token", user: demoUser, permissions: demoPermissions, notice: "demo-only showcase response" }; },
  async me(..._args: any[]) { return { ...demoUser, notice: "demo-only showcase response" }; },
  async updateProfile(..._args: any[]) { return { ...demoUser, notice: "demo-only showcase response" }; },
  async inviteUser(payload: { email?: string; roleId?: bigint; invitedBy?: bigint } = {}, ..._args: any[]) { return { invite_link: `${env.FRONTEND_BASE_URL}/accept-invite?code=demo-invite`, email: payload.email ?? "demo@example.com", roleId: payload.roleId ?? 1n, invitedBy: payload.invitedBy ?? 1n, notice: "demo-only showcase response" }; },
  async acceptInvite(..._args: any[]) { return { success: true, notice: "demo-only showcase response" }; },
  async forgotPassword(payload: { email?: string } = {}, ..._args: any[]) { return { email: payload.email ?? "demo@example.com", reset_link: `${env.FRONTEND_BASE_URL}/reset-password?code=demo-reset`, notice: "demo-only showcase response" }; },
  async resetPassword(..._args: any[]) { return { success: true, notice: "demo-only showcase response" }; },
};
