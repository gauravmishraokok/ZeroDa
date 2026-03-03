/*
    AI Routes

    1. Handles parsing messages using POST request and generating insights using GET request
    2. Utilizes the parseMessageController and generateInsightsController functions
    */
import express from "express";
import { parseMessageController, generateInsightsController } from "./ai.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/parse", authenticate, parseMessageController);
router.get("/insights", authenticate, generateInsightsController);

export default router;