import { Router } from "express";
import { roleController } from "../controllers/role.controller.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

const router = Router();

router.get("/", requirePermission("roles.read"), roleController.list);
router.post("/", requirePermission("roles.create"), roleController.create);
router.put("/:id", requirePermission("roles.update"), roleController.update);
router.delete("/:id", requirePermission("roles.delete"), roleController.remove);

export default router;
