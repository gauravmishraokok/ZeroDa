export const parseTransaction = (text) => {

    try{
        const jsonMatch = text.match(/\{[\s\S]*\}/); // Extract JSON from text
        if(!jsonMatch) throw new Error("Invalid AI Output Format");

        const data = JSON.parse(jsonMatch[0]);

        if(typeof data.amount === "string"){
            data.amount = parseFloat(data.amount.replace(/[^\d.-]/g, "")); // Remove non-numeric characters
        }

        return data;
        
    }
    catch(error){
        throw new Error("Failed to parse transaction");
    }

};