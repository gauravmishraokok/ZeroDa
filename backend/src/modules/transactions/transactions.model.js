/*
    Transaction Model

    1. Defines the schema of transaction data in the DB
    2. Exports the transaction model for use
*/
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true,
            index : true
        },
        amount : {
            type : Number,
            required : true
        },
        type : {
            type : String,
            enum : ["income", "expense"],
            required : true
        },
        category : {
            type : String,
            required : true
        },
        note : {
            type : String,
        },
        date : {
            type : Date,
            required : true, 
            index : true
        },
        isDeleted : {
            type : Boolean,
            default : false
        }
    },
    {
        timestamps : true
    }
);

export const transactionModel = mongoose.model("Transaction", transactionSchema);