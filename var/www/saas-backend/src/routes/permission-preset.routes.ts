import { Router } from "express";
import { permissionPresetController } from "../controllers/permission-preset.controller.js";
import { requireAnyPermission, requirePermission } from "../middlewares/permission.middleware.js";

const router = Router();

router.get("/", requirePermission("permissionPreset.read"), permissionPresetController.list);
router.get("/options", requirePermission("roles.read"), permissionPresetController.options);
router.get("/:id", requirePermission("permissionPreset.read"), permissionPresetController.detail);
router.post("/", requireAnyPermission(["permissionPreset.create", "role.manage"]), permissionPresetController.create);
router.put("/:id", requirePermission("permissionPreset.update"), permissionPresetController.update);
router.delete("/:id", requirePermission("permissionPreset.delete"), permissionPresetController.remove);

export default router;
