import apiClient from "./apiClient";

export const listProviders = async () => {
  const response = await apiClient.get("/providers");
  return response.data;
};
