/*
    User Model

    1. Defines the schema of user data in the DB
    2. Exports the user model for use
*/
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            select: false
        }
    }
);

export const userModel = mongoose.model("User", userSchema);