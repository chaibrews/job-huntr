import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { getUserTags } from "../controllers/tagsController";

const router = Router();
router.use(authenticate);

router.get("/", getUserTags);

export default router;
