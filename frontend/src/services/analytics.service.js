import apiClient from "./apiClient";

export const getAnalytics = async () => {
  const response = await apiClient.get("/analytics");
  return response.data;
};
