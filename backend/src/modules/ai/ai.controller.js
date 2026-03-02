import { processMessage } from "./services/transactionAi.service.js";
import { generateInsights } from "./services/insights.service.js";
import { getTransactions } from "../transactions/transactions.service.js";
import { createTransaction } from "../transactions/transactions.service.js";

export const parseMessageController = async (req, res) => {
  try {
    const { message } = req.body;

    const data = await processMessage(message);

    const transaction = await createTransaction(data, req.user._id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(400).json({
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
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};