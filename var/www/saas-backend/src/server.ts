import { app } from "./app.js";
import { env } from "./config/env.js";
import { startNotificationScheduler } from "./schedulers/notification.scheduler.js";
import { initWebSocketService } from "./services/websocket.service.js";
import { createServer } from "node:http";

const server = createServer(app);

initWebSocketService(server);
startNotificationScheduler();

server.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
