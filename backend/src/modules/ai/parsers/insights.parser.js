/*
    Insights Parser

    1. Handles parsing of insights data
    2. Returns the parsed data after removing the "html" prefix if present
*/
export const parseInsights = (text) => {
  return text.replace(/^html\s*/i, "").trim(); 
};