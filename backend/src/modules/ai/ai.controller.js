/*
  AI Controller

  1. Handles parsing messages and generating insights from transactions
  2. Utilizes the parseMessageController and generateInsightsController functions
  3. Utilizes the aiQueue for queue management which utilizes bullmq and ioredis
*/
import { aiQueue } from "../../queues/ai.queues.js";
import { generateInsights } from "./services/insights.service.js";
import { getTransactions } from "../transactions/transactions.service.js";

export const parseMessageController = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
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

    res.status(202).json({
      success: true,
      message: "Message queued for processing",
      jobId: job.id, // Useful for tracking
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const generateInsightsController = async (req, res) => {
  try {
    const transactions = await getTransactions({}, req.user.id);

    const insights = await generateInsights(transactions);

    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};