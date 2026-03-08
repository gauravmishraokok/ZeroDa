/*
    Gemini Service

    1. Handles communication with the Gemini AI service
    2. Utilizes axios for HTTP requests
    3. Exports a function for calling the Gemini AI service
    4. All changes in Gemini API should be changed here ONLY
*/
import axios from "axios";
import { env } from "../../../config/env.js";
import https from "https";
import AppError from "../../../utils/AppError.js";

const agent = new https.Agent({ family: 4 });

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export const callGemini = async (prompt, attempt = 1) => {
  const MAX_RETRIES = 1;
  console.log(`[GEMINI SERVICE] Calling Gemini API (attempt ${attempt})`);

  try {
    const response = await axios.post(
      GEMINI_URL,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": env.GEMINI_API_KEY,
        },
        timeout: 20000,
        httpsAgent: agent
      }
    );

    const candidate = response.data?.candidates?.[0];

    if (!candidate) {
      console.error(`[GEMINI SERVICE] No candidates returned`);
      throw new AppError("No candidates returned from AI service", 500, "AI_NO_CANDIDATES");
    }

    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      console.error(`[GEMINI SERVICE] Empty AI response`);
      throw new AppError("Empty AI response", 500, "AI_EMPTY_RESPONSE");
    }

    console.log(`[GEMINI SERVICE] Successfully received response (${text.length} chars)`);
    return text.trim();
  }
  catch (error) {
    
    if (attempt < MAX_RETRIES) {
      console.error(`[GEMINI SERVICE] Retrying Gemini... (${attempt})`);
      return callGemini(prompt, attempt + 1);
    }

    console.error(`[GEMINI SERVICE] Final Gemini Error:`, error.response?.data || error.message);
    throw new AppError("AI service failed", 500, "AI_SERVICE_ERROR");
  }
};