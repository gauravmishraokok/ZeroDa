import AppError from "../../../utils/AppError.js";

export const validateTransaction = (data) => {
  if (!data.amount || isNaN(data.amount)) {
    throw new AppError("Invalid amount", 400, "INVALID_AMOUNT");
  }

  if (!["income", "expense"].includes(data.type)) {
    data.type = "expense";
  }

  if (!data.date) {
    data.date = new Date();
  }

  return data;
};