import { Router } from "express";
import { notificationController } from "../controllers/notification.controller.js";
import { requireAnyPermission } from "../middlewares/permission.middleware.js";

const router = Router();

router.get("/", requireAnyPermission(["notifications.view", "notifications.read"]), notificationController.list);
router.get("/unread-count", requireAnyPermission(["notifications.view", "notifications.read"]), notificationController.unreadCount);
router.post("/:id/read", requireAnyPermission(["notifications.read", "notifications.view"]), notificationController.readOne);
router.post("/read-all", requireAnyPermission(["notifications.read", "notifications.view"]), notificationController.readAll);

export default router;
