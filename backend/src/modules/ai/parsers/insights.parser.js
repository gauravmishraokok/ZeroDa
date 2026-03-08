/*
    Insights Parser

    1. Handles parsing of insights data
    2. Returns the parsed data after removing the "html" prefix if present and parsing JSON
*/
export const parseInsights = (text) => {
  try {
    const cleanedText = text.replace(/^html\s*/i, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    throw new Error("Failed to parse insights response");
  }
};