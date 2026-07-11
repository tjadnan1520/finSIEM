import apiClient from "./apiClient";

export const listAgents = async () => {
  const response = await apiClient.get("/agents");
  return response.data;
};
