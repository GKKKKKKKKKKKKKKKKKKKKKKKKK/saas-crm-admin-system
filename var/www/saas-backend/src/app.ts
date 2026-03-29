import cors from "cors";
import express from "express";
import path from "node:path";
import { roleController } from "./controllers/role.controller.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { requirePermission } from "./middlewares/permission.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import logRoutes from "./routes/log.routes.js";
import orderRoutes from "./routes/order.routes.js";
import contractRoutes from "./routes/contract.routes.js";
import customerFollowUpRoutes from "./routes/customer-follow-up.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import roleRoutes from "./routes/role.routes.js";
import permissionPresetRoutes from "./routes/permission-preset.routes.js";
import userRoutes from "./routes/user.routes.js";
import fileRoutes from "./routes/file.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { successResponse } from "./utils/response.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/health", (_req: any, res: any) => {
  return successResponse(res, { status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", authenticate, userRoutes);
app.use("/api/roles", authenticate, roleRoutes);
app.get("/api/permissions", authenticate, requirePermission("roles.read"), roleController.permissions);
app.use("/api/permission-presets", authenticate, permissionPresetRoutes);
app.use("/api/customers", authenticate, customerRoutes);
app.use("/api/orders", authenticate, orderRoutes);
app.use("/api/customer-follow-ups", authenticate, customerFollowUpRoutes);
app.use("/api/contracts", authenticate, contractRoutes);
app.use("/api/payments", authenticate, paymentRoutes);
app.use("/api/dashboard", authenticate, requirePermission("order.read"), dashboardRoutes);
app.use("/api/logs", authenticate, logRoutes);
app.use("/api/files", authenticate, fileRoutes);
app.use("/api/admin", authenticate, adminRoutes);
app.use("/api/notifications", authenticate, notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
