import apiClient from "./apiClient";

export const listTransactions = async () => {
  const response = await apiClient.get("/transactions");
  return response.data;
};

export const createTransaction = async (payload) => {
  const response = await apiClient.post("/transactions", payload);
  return response.data;
};
