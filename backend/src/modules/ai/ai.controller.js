/*
  AI Controller

  1. Handles parsing messages and generating insights from transactions
  2. Utilizes the parseMessageController and generateInsightsController functions
  3. Utilizes the aiQueue for queue management which utilizes bullmq and ioredis
*/
import { aiQueue } from "../../queues/ai.queues.js";
import { generateInsights } from "./services/insights.service.js";
import { getTransactions } from "../transactions/transactions.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import AppError from "../../utils/AppError.js";

export const parseMessageController = asyncHandler(async (req, res) => {
    console.log(`[AI] Parsing message for user: ${req.user.id}`);
    const { message } = req.body;

    if (!message) {
      throw new AppError("Message is required", 400, "MESSAGE_REQUIRED");
    }

    // Push job to queue instead of processing here
    const job = await aiQueue.add("process-message", {
      message,
      userId: req.user.id,
    }
    , {
      attempts : 2,
      backoff : {
        type : "exponential",
        delay : 5000
      }
    });

    console.log(`[AI] Message queued for processing, job ID: ${job.id}`);
    res.status(202).json({
      success: true,
      message: "Message queued for processing",
      data: { jobId: job.id }, // Useful for tracking
    });
});

export const generateInsightsController = asyncHandler(async (req, res) => {
    console.log(`[AI] Generating insights for user: ${req.user.id}`);
    const transactions = await getTransactions({}, req.user.id);
    console.log(`[AI] Retrieved ${transactions.length} transactions for analysis`);

    const insights = await generateInsights(transactions);
    console.log(`[AI] Insights generated successfully`);

    res.status(200).json({
      success: true,
      message: "Insights generated successfully",
      data: insights,
    });
});