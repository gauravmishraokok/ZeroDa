/*
    Transaction Controller

    1. Handles transaction creation, retrieval, and deletion operations
    2. Adds a new transaction using the createTransaction service using data and user ID (from auth middleware)
    3. Retrieves transactions using the getTransactions service using query user ID and query parameters performing pagination and filtering 
    4. Deletes a transaction using the deleteTransaction service using transaction ID (from params) and user ID
    5. Exports controller functions for creating, retrieving, and deleting transactions
*/
import { createTransaction, getTransactions, deleteTransaction } from './transactions.service.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const addTransaction = asyncHandler(async (req, res) => {
    console.log(`[TRANSACTION] Adding transaction for user: ${req.user._id}`);
    const transaction = await createTransaction(req.body, req.user._id);
    console.log(`[TRANSACTION] Transaction created: ${transaction._id}`);

    res.status(201).json({
        success : true,
        message : "Transaction added successfully",
        data : transaction, 
    });
});


export const fetchTransaction = asyncHandler(async (req, res) => {
    console.log(`[TRANSACTION] Fetching transactions for user: ${req.user._id}`);
    const transactions = await getTransactions(req.query, req.user._id);
    console.log(`[TRANSACTION] Retrieved ${transactions.length} transactions`);

    res.status(200).json({
        success : true,
        message : "Transactions fetched successfully",
        data : transactions, 
    });
});


export const removeTransaction = asyncHandler(async (req, res) => {
    console.log(`[TRANSACTION] Deleting transaction: ${req.params.id} for user: ${req.user._id}`);
    const transaction = await deleteTransaction(req.params.id, req.user._id);
    console.log(`[TRANSACTION] Transaction deleted: ${req.params.id}`);

    res.status(200).json({
        success : true,
        message : "Transaction deleted successfully",
        data : transaction, 
    });
});