import AppError from "../../../utils/AppError.js";

export const parseTransaction = (text) => {

    try{
        const jsonMatch = text.match(/\{[\s\S]*\}/); // Extract JSON from text
        if(!jsonMatch) throw new AppError("Invalid AI Output Format", 500, "AI_PARSE_ERROR");

        const data = JSON.parse(jsonMatch[0]);

        if(typeof data.amount === "string"){
            data.amount = parseFloat(data.amount.replace(/[^\d.-]/g, "")); // Remove non-numeric characters
        }

        return data;

    }
    catch(error){
        if (error instanceof AppError) throw error;
        throw new AppError("Failed to parse transaction", 500, "TRANSACTION_PARSE_ERROR");
    }

};