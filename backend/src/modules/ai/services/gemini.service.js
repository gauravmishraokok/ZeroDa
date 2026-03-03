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

const agent = new https.Agent({ family: 4 });

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export const callGemini = async (prompt, attempt = 1) => {
  const MAX_RETRIES = 1;

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
      throw new Error("No candidates returned");
    }

    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("Full response:", JSON.stringify(response.data, null, 2));
      throw new Error("Empty AI response");
    }

    return text.trim();
  }
  catch (error) {
    
    if (attempt < MAX_RETRIES) {
      console.error(`Retrying Gemini... (${attempt})`);
      return callGemini(prompt, attempt + 1);
    }

    console.error("Final Gemini Error:", error.response?.data || error.message);
    throw new Error("AI service failed");
  }
};