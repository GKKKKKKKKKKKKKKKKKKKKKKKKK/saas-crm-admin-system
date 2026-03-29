import { Router } from "express";
import { customerController } from "../controllers/customer.controller.js";
import { customerFollowUpController } from "../controllers/customer-follow-up.controller.js";
import { requireAnyPermission, requirePermission } from "../middlewares/permission.middleware.js";

const router = Router();

router.get("/", requirePermission("customer.read"), customerController.list);
router.post("/", requirePermission("customer.create"), customerController.create);
router.get("/:id", requirePermission("customer.read"), customerController.detail);
router.get("/:id/follow-ups", requireAnyPermission(["customer_followups.view", "customer_followups.read"]), customerFollowUpController.timelineByCustomer);
router.put("/:id", requirePermission("customer.update"), customerController.update);
router.delete("/:id", requirePermission("customer.delete"), customerController.remove);

export default router;
