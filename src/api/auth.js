import axiosClient from "./axoisClient";

export const login = async (email, password) => {
  const response = await axiosClient.post("/auth/login", { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await axiosClient.post("/auth/logout");
  return response.data;
};

export const requestPasswordReset = async (email) => {
  const response = await axiosClient.post("/auth/forgetPassword", { email });
  return response.data;
};