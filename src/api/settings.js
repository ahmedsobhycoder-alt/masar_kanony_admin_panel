import axiosClient from "./axoisClient";

export const getAppConfig = async () => {
  const response = await axiosClient.get("/appConfig/");
  return response.data;
};

export const createAppConfig = async (data) => {
  const response = await axiosClient.post("/appConfig/", data);
  return response.data;
};

export const updateAppConfig = async (data) => {
  const response = await axiosClient.put("/appConfig/", data);
  return response.data;
};

export const deleteAppConfig = async () => {
  const response = await axiosClient.delete("/appConfig/");
  return response.data;
};

export const getAppPolicy = async (type) => {
  const response = await axiosClient.get(`/appPolicies/${type}`);
  return response.data;
};

export const createAppPolicy = async (type, data) => {
  const response = await axiosClient.post(`/appPolicies/${type}`, data);
  return response.data;
};

export const updateAppPolicy = async (type, data) => {
  const response = await axiosClient.put(`/appPolicies/${type}`, data);
  return response.data;
};

export const deleteAppPolicy = async (type) => {
  const response = await axiosClient.delete(`/appPolicies/${type}`);
  return response.data;
};