import { prisma } from "../config/prisma.js";

type QueryClient = any;

export const passwordResetTokenRepository = {
  create(
    payload: {
      userId: bigint;
      token: string;
      expiresAt: Date;
    },
    client: QueryClient = prisma,
  ) {
    return client.password_reset_tokens.create({
      data: {
        user_id: payload.userId,
        token: payload.token,
        expires_at: payload.expiresAt,
      },
    });
  },

  findValidByToken(tokenHash: string, rawToken: string, client: QueryClient = prisma) {
    return client.password_reset_tokens.findFirst({
      where: {
        OR: [{ token: tokenHash }, { token: rawToken }],
        used_at: null,
        expires_at: {
          gt: new Date(),
        },
      },
    });
  },

  markUsed(id: bigint, client: QueryClient = prisma) {
    return client.password_reset_tokens.update({
      where: { id },
      data: {
        used_at: new Date(),
      },
    });
  },

  invalidateActiveByUserId(userId: bigint, client: QueryClient = prisma) {
    return client.password_reset_tokens.updateMany({
      where: {
        user_id: userId,
        used_at: null,
        expires_at: {
          gt: new Date(),
        },
      },
      data: {
        used_at: new Date(),
      },
    });
  },
};
