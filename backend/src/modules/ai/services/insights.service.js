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
    console.log(`[AI INSIGHTS SERVICE] Generating insights for ${transactions.length} transactions`);
    const prompt = insightsPrompt(transactions);
    
    const raw = await callGemini(prompt);
    console.log(`[AI INSIGHTS SERVICE] Received raw response from Gemini`);

    const parsed = parseInsights(raw);
    console.log(`[AI INSIGHTS SERVICE] Parsed insights response`);

    const validated = validateInsights(parsed);
    console.log(`[AI INSIGHTS SERVICE] Validated insights data`);

    return validated;
};