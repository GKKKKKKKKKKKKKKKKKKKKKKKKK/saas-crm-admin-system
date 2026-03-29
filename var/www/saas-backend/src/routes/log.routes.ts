import { Router } from "express";
import { logController } from "../controllers/log.controller.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

const router = Router();

router.get("/", requirePermission("user.manage"), logController.list);

export default router;
