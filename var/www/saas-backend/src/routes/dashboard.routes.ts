import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/summary", dashboardController.summary);
router.get("/charts", dashboardController.charts);
router.get("/recent-orders", dashboardController.recentOrders);

export default router;
