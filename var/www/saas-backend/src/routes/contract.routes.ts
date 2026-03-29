import { Router } from "express";
import { contractController } from "../controllers/contract.controller.js";
import { requireAnyPermission } from "../middlewares/permission.middleware.js";

const router = Router();

router.get("/", requireAnyPermission(["contracts.view", "contracts.read"]), contractController.list);
router.get("/:id", requireAnyPermission(["contracts.view", "contracts.read"]), contractController.detail);
router.post("/", requireAnyPermission(["contracts.create"]), contractController.create);
router.put("/:id", requireAnyPermission(["contracts.update"]), contractController.update);
router.delete("/:id", requireAnyPermission(["contracts.delete"]), contractController.remove);

export default router;
