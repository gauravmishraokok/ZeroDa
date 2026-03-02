import express from "express";
import { parseMessageController, generateInsightsController } from "./ai.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/parse", authenticate, parseMessageController);
router.get("/insights", authenticate, generateInsightsController);

export default router;