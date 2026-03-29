import { Router } from "express";
import { fileController } from "../controllers/file.controller.js";
import { fileUploadSingle } from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/upload", fileUploadSingle("file"), fileController.upload);
router.get("/", fileController.list);
router.get("/:id", fileController.detail);
router.get("/:id/download", fileController.download);
router.delete("/:id", fileController.remove);

export default router;
