/*
    AI Queue

    1. Handles communication with the Gemini AI service
    2. Utilizes bullmq for queue management
    3. Utilizes ioredis for Redis connection
*/
import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis({maxRetriesPerRequest: null});

export const aiQueue = new Queue("ai-processing", { connection });