import { Router } from "express";
import { customerFollowUpController } from "../controllers/customer-follow-up.controller.js";
import { requireAnyPermission } from "../middlewares/permission.middleware.js";

const router = Router();

router.get("/", requireAnyPermission(["customer_followups.view", "customer_followups.read"]), customerFollowUpController.list);
router.post("/", requireAnyPermission(["customer_followups.create"]), customerFollowUpController.create);
router.put("/:id", requireAnyPermission(["customer_followups.update"]), customerFollowUpController.update);
router.delete("/:id", requireAnyPermission(["customer_followups.delete"]), customerFollowUpController.remove);

export default router;
