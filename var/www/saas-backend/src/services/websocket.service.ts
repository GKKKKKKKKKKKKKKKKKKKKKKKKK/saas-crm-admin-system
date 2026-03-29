// simplified for public showcase
import type { Server as HttpServer } from "node:http";

export const initWebSocketService = (_server: HttpServer) => {
  return {
    close: () => undefined,
    notice: "simplified for public showcase",
  };
};

export const pushNotificationToUser = (_recipientUserId: bigint, _notification: unknown) => {
  return {
    delivered: false,
    notice: "simplified for portfolio version",
  };
};
