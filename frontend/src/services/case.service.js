import apiClient from "./apiClient";

export const listCases = async () => {
  const response = await apiClient.get("/cases");
  return response.data;
};

export const getCase = async (id) => {
  const response = await apiClient.get(`/cases/${id}`);
  return response.data;
};
