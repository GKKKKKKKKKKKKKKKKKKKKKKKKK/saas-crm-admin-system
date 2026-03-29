import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

const router = Router();

router.get("/", requirePermission("user.manage"), userController.list);
router.post("/", requirePermission("user.manage"), userController.create);
router.put("/:id", requirePermission("user.manage"), userController.update);
router.delete("/:id", requirePermission("user.manage"), userController.remove);

export default router;
