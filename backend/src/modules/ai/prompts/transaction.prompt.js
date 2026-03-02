/*
    Transaction Prompt

    1. Defines the prompt for extracting transaction details from a message, Separated for easy iteration and prompt engineering
*/ 
export const transactionPrompt = (message) => `
Extract transaction details from this message:

"${message}"

Return STRICT JSON:
{
  "amount": number,
  "type": "income" | "expense",
  "category": string and one of the following: ["income","food & dining","transport","shopping","entertainment","health","education","bills","investment","rent","miscellaneous"],
  "note": string,
  "date": ISO string
}

Rules:
- No backticks
- No explanation
- Only JSON
- Category MUST BE STRICTLY from the given list.
`;