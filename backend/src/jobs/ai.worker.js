/*
    AI Worker

    1. Handles processing of messages from the AI queue
    2. Utilizes the processMessage function to process the message
    3. Utilizes the createTransaction function to create a new transaction
*/
import { Worker } from "bullmq";
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config({ path : "../../.env" });

import { processMessage } from "../modules/ai/services/transactionAI.service.js";
import { createTransaction } from "../modules/transactions/transactions.service.js";

const connection = new Redis({maxRetriesPerRequest: null});

export const aiWorker = new Worker(
  "ai-processing",
  async (job) => {
    const { message, userId } = job.data;

    console.log("Processing job:", job.id);

    try {
      const aiData = await processMessage(message);

      const transaction = await createTransaction(aiData, userId);

      return transaction;
    } catch (err) {
      console.error("Worker Error:", err.message);
      throw err; // IMPORTANT for BullMQ
    }
  },
  { connection }
);