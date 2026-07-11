import apiClient from "./apiClient";

export const getManagementData = async () => {
  const response = await apiClient.get("/management");
  return response.data;
};

export const createProvider = async (payload) => {
  const response = await apiClient.post("/providers", payload);
  return response.data;
};

export const removeProvider = async (id) => {
  const response = await apiClient.delete(`/providers/${id}`);
  return response.data;
};

export const createOperator = async (payload) => {
  const response = await apiClient.post("/management/operators", payload);
  return response.data;
};

export const removeOperator = async (id) => {
  const response = await apiClient.delete(`/management/operators/${id}`);
  return response.data;
};

export const createAgent = async (payload) => {
  const response = await apiClient.post("/agents", payload);
  return response.data;
};

export const removeAgent = async (id) => {
  const response = await apiClient.delete(`/agents/${id}`);
  return response.data;
};
