/*
    Insights Service

    1. Handles communication with the Gemini AI service for generating insights from transactions
    2. Uses the insights prompt to generate the appropriate prompt for Gemini
*/
import { callGemini } from './gemini.service.js';
import { insightsPrompt } from '../prompts/insights.prompt.js';
import { parseInsights } from '../parsers/insights.parser.js';
import { validateInsights } from '../validators/insights.validator.js';

export const generateInsights = async (transactions) => {
    const prompt = insightsPrompt(transactions);
    
    const raw = await callGemini(prompt);

    const parsed = parseInsights(raw);
    
    const validated = validateInsights(parsed);

    return validated;
};