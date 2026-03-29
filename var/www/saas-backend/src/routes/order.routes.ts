import { Router } from "express";
import { orderController } from "../controllers/order.controller.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

const router = Router();

router.get("/", requirePermission("order.read"), orderController.list);
router.post("/", requirePermission("order.create"), orderController.create);
router.get("/:id", requirePermission("order.read"), orderController.detail);
router.put("/:id", requirePermission("order.update"), orderController.update);
router.delete("/:id", requirePermission("order.delete"), orderController.remove);

export default router;
