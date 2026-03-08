/*
    Transaction Service

    1. Utilizes the transaction model for database operations
    2. Handles transaction creation using data and user ID
    3. Handles transaction retrieval using query and user ID with pagination and filtering
    4. Handles transaction deletion
    5. Exports functions for creating, retrieving, and deleting transactions
*/
import { transactionModel } from "./transactions.model.js";

export const createTransaction = async(data, userId) => {
    console.log(`[TRANSACTION SERVICE] Creating transaction for user: ${userId}`);
    return await transactionModel.create({
        ...data,
        userId
    });    
};

export const getTransactions = async(query, userId) => {
    console.log(`[TRANSACTION SERVICE] Fetching transactions for user: ${userId}`);
    const { page = 1, limit = 10, category, type} = query;

    const filter = {
        userId,
        isDeleted : false
    };

    if(category) filter.category = category;
    if(type) filter.type = type;

    const transactions = await transactionModel.find(filter)
    .sort({date : -1})
    .skip((page - 1) * limit)
    .limit(Number(limit));

    console.log(`[TRANSACTION SERVICE] Found ${transactions.length} transactions`);
    return transactions;
}



export const deleteTransaction = async (transactionId, userId) => {
  console.log(`[TRANSACTION SERVICE] Soft deleting transaction: ${transactionId} for user: ${userId}`);
  return await transactionModel.findOneAndUpdate(
    { _id: transactionId, userId },
    { isDeleted: true },
    { new: true }
  );
};