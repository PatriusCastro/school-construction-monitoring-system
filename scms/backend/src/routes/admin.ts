import { Router } from "express";
import multer from "multer";
import { uploadSitePlan } from "../controllers/adminController";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post("/upload-site-plan", upload.single("file"), uploadSitePlan);

export default router;
