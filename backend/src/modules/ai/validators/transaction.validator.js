export const validateTransaction = (data) => {
  if (!data.amount || isNaN(data.amount)) {
    throw new Error("Invalid amount");
  }

  if (!["income", "expense"].includes(data.type)) {
    data.type = "expense";
  }

  if (!data.date) {
    data.date = new Date();
  }

  return data;
};