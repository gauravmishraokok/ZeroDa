/* 
    Database Connection Manager

    1. Establishes connection to MongoDB using MONGO_URI
    2. Logs successful connection with host information
    3. Terminates the process if connection fails (fail-fast strategy)
*/
import mongoose from "mongoose";
import { env } from "../config/env.js";

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(env.MONGO_URI);
        console.log(`MongoDB connected: ${connection.connection.host}`);
        return connection;
    }
    catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};