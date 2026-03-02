/*
    Transaction Controller

    1. Handles transaction creation, retrieval, and deletion operations
    2. Adds a new transaction using the createTransaction service using data and user ID (from auth middleware)
    3. Retrieves transactions using the getTransactions service using query user ID and query parameters performing pagination and filtering 
    4. Deletes a transaction using the deleteTransaction service using transaction ID (from params) and user ID
    5. Exports controller functions for creating, retrieving, and deleting transactions
*/
import { createTransaction, getTransactions, deleteTransaction } from './transactions.service.js';

export const addTransaction = async (req, res) => {
    try{
        const transaction = await createTransaction(req.body, req.user._id);
        
        res.status(201).json({
            success : true,
            message : "Transaction added successfully",
            data : transaction, 
        });
    }
    catch(error){
        res.status(400).json({
            success : false,
            error : error.message
        });
    }
};


export const fetchTransaction = async (req, res) => {
    try{
        const transactions = await getTransactions(req.query, req.user._id);

        res.status(200).json({
            success : true,
            message : "Transactions fetched successfully",
            data : transactions, 
        });
    }
    catch(error){
        res.status(400).json({
            success : false,
            error : error.message
        });
    }
};


export const removeTransaction = async (req, res) => {
    try{
        const transaction = await deleteTransaction(req.params.id, req.user._id);

        res.status(200).json({
            success : true,
            message : "Transaction deleted successfully",
            data : transaction, 
        });
    }
    catch(error){
        res.status(400).json({
            success : false,
            error : error.message
        });
    }
}