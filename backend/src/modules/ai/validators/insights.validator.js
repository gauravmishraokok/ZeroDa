/*
    Insights Validator

    1. Handles validation of insights data
    2. Throws error if data is invalid
*/
import AppError from "../../../utils/AppError.js";

export const validateInsights = (data) => {
  if (!data) throw new AppError("No insights data", 400, "INVALID_INSIGHTS_DATA");

  data.positiveHabits ??= [];
  data.negativeHabits ??= [];
  data.categoryInsights ??= [];
  data.trends ??= [];
  data.recommendations ??= [];

  return data;
};