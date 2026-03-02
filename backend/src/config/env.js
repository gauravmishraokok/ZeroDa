/* 
    Environment Configuration

    1. Loads environment variables from .env file
    2. Centralizes access to required environment variables
    3. Exports a structured env object for consistent usage across the app
*/
import dotenv from 'dotenv';

dotenv.config();

export const env = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY
};