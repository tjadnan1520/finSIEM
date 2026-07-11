import apiClient from "./apiClient";

export const listAlerts = async () => {
  const response = await apiClient.get("/alerts");
  return response.data;
};

export const getAlert = async (id) => {
  const response = await apiClient.get(`/alerts/${id}`);
  return response.data;
};
