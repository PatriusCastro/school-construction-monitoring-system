import { Router } from "express";
import { addProgressUpdate, getProgress } from "../controllers/progressController";

const router = Router();
router.get("/", getProgress);
router.post("/", addProgressUpdate);

export default router;