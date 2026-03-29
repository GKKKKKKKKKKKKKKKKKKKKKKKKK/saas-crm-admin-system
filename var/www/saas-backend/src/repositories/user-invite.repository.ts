import { prisma } from "../config/prisma.js";

type QueryClient = any;

export const userInviteRepository = {
  findValidByToken(tokenHash: string, rawToken: string, client: QueryClient = prisma) {
    return client.user_invites.findFirst({
      where: {
        OR: [{ token: tokenHash }, { token: rawToken }],
        status: "pending",
        expires_at: {
          gt: new Date(),
        },
      },
    });
  },

  findPendingByEmail(email: string, client: QueryClient = prisma) {
    return client.user_invites.findFirst({
      where: {
        email,
        status: "pending",
        expires_at: {
          gt: new Date(),
        },
      },
    });
  },

  create(
    payload: {
      email: string;
      roleId: bigint;
      invitedBy: bigint;
      token: string;
      expiresAt: Date;
    },
    client: QueryClient = prisma,
  ) {
    return client.user_invites.create({
      data: {
        email: payload.email,
        role_id: payload.roleId,
        invited_by: payload.invitedBy,
        token: payload.token,
        status: "pending",
        expires_at: payload.expiresAt,
      },
    });
  },

  markAccepted(id: bigint, client: QueryClient = prisma) {
    return client.user_invites.update({
      where: { id },
      data: {
        status: "accepted",
        accepted_at: new Date(),
      },
    });
  },

  markExpiredByEmail(email: string, client: QueryClient = prisma) {
    return client.user_invites.updateMany({
      where: {
        email,
        status: "pending",
        expires_at: {
          lte: new Date(),
        },
      },
      data: {
        status: "expired",
      },
    });
  },
};
