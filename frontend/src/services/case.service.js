import apiClient from "./apiClient";

export const listCases = async () => {
  const response = await apiClient.get("/cases");
  return response.data;
};

export const getCase = async (id) => {
  const response = await apiClient.get(`/cases/${id}`);
  return response.data;
};

export const listFieldOfficers = async ({ caseId, areaId, providerId, region } = {}) => {
  const response = await apiClient.get("/cases/field-officers", {
    params: {
      ...(caseId ? { caseId } : {}),
      ...(areaId ? { areaId } : {}),
      ...(providerId ? { providerId } : {}),
      ...(region ? { region } : {})
    }
  });
  return response.data;
};

export const transferCase = async (id, assignedToId) => {
  const response = await apiClient.post(`/cases/${id}/transfer`, { assignedToId });
  return response.data;
};

export const resolveCase = async (id) => {
  const response = await apiClient.post(`/cases/${id}/resolve`);
  return response.data;
};
