import apiClient from "./apiClient";

export const getDashboard = async () => {
  const response = await apiClient.get("/dashboard");
  return response.data;
};
