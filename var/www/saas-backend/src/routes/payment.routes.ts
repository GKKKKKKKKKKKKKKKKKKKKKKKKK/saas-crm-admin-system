import { Router } from "express";
import { paymentController } from "../controllers/payment.controller.js";
import { requireAnyPermission } from "../middlewares/permission.middleware.js";

const router = Router();

router.get("/", requireAnyPermission(["payments.view", "payments.read"]), paymentController.list);
router.get("/:id", requireAnyPermission(["payments.view", "payments.read"]), paymentController.detail);
router.post("/", requireAnyPermission(["payments.create"]), paymentController.create);
router.put("/:id", requireAnyPermission(["payments.update"]), paymentController.update);
router.delete("/:id", requireAnyPermission(["payments.delete"]), paymentController.remove);

export default router;
