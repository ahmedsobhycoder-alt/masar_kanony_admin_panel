import axiosClient from "./axoisClient";

export const getGovernorates = async (params = {}) => {
  const response = await axiosClient.get("/governorates", { params });
  return response.data;
};

export const createGovernorate = async (name) => {
  const response = await axiosClient.post("/governorates", { name });
  return response.data;
};

export const updateGovernorate = async (id, data) => {
  const response = await axiosClient.put(`/governorates/${id}`, data);
  return response.data;
};

export const deleteGovernorate = async (id) => {
  const response = await axiosClient.delete(`/governorates/${id}`);
  return response.data;
};