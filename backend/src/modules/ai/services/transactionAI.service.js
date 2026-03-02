/*
    Transaction AI Service

    1. Handles communication with the Gemini AI service for extracting transaction details from a message
    2. Uses the transaction prompt to generate the appropriate prompt for Gemini
    3. Utilizes the parseTransaction function to parse the response from Gemini
    4. Utilizes the validateTransaction function to validate the parsed data
*/
import { callGemini } from "./gemini.service.js";
import { transactionPrompt } from "../prompts/transaction.prompt.js";
import { parseTransaction } from "../parsers/transaction.parser.js";
import { validateTransaction } from "../validators/transaction.validator.js";


export const processMessage = async (message) => {

    const prompt = transactionPrompt(message);
    
    const raw = await callGemini(prompt);

    const parsed = await parseTransaction(raw);

    const validated = await validateTransaction(parsed);

    return validated;

};