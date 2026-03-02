/*
    Insights Prompt

    1. Defines the prompt for generating insights from transaction data, Separated for easy iteration and prompt engineering
*/
export const insightsPrompt = (transactions) => `
Analyze the following transaction data and return structured financial insights.

Return STRICT JSON in this format:

{
  "positiveHabits": [string],
  "negativeHabits": [string],
  "categoryInsights": [
    {
      "category": string,
      "percentage": number,
      "comment": string
    }
  ],
  "trends": [string],
  "recommendations": [string]
}

RULES:
- ONLY JSON
- NO explanations
- NO markdown
- NO backticks
- Keep insights concise
- Use realistic financial reasoning

Transactions:
${JSON.stringify(transactions)}
`;
