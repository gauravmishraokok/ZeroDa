/*
    Insights Validator

    1. Handles validation of insights data
    2. Throws error if data is invalid
*/

export const validateInsights = (data) => {
  if (!data) throw new Error("No insights data");

  data.positiveHabits ??= [];
  data.negativeHabits ??= [];
  data.categoryInsights ??= [];
  data.trends ??= [];
  data.recommendations ??= [];

  return data;
};