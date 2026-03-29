// simplified for public showcase
const demoNotifications = [
  {
    id: 1n,
    type: "system",
    title: "公开演示通知",
    content: "simplified for portfolio version",
    level: "info",
    is_read: false,
    created_at: new Date(),
    recipient_user: { id: 1n, username: "demo-admin", email: "demo@example.com" },
    sender_user: null,
  },
];

export const notificationService = {
  async list(params: Record<string, unknown> = {}, ..._args: any[]) {
    return { list: demoNotifications, total: demoNotifications.length, page: Number((params as any).page ?? 1), pageSize: Number((params as any).pageSize ?? 10), notice: "simplified for public showcase" };
  },
  async unreadCount(..._args: any[]) {
    return { unreadCount: demoNotifications.filter((item) => !item.is_read).length, notice: "simplified for portfolio version" };
  },
  async markAsRead(..._args: any[]) {
    return { updated: true, notice: "simplified for public showcase" };
  },
  async markAllAsRead(..._args: any[]) {
    return { updatedCount: demoNotifications.length, notice: "simplified for portfolio version" };
  },
  async createNotification(payload: { recipientUserId: bigint; type: string; title: string; content: string; level: string; businessType?: string; businessId?: bigint }) {
    return {
      id: 999n,
      recipient_user_id: payload.recipientUserId,
      type: payload.type,
      title: payload.title,
      content: payload.content,
      level: payload.level,
      business_type: payload.businessType ?? null,
      business_id: payload.businessId ?? null,
      is_read: false,
      notice: "simplified for public showcase",
    };
  },
};
