import axios from "axios";
import { clearAdminSession } from "../auth/session";

const axiosClient = axios.create({
    baseURL: "/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach auth tokens automatically if required
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const expiresAt = Number(localStorage.getItem("tokenExpiresAt"));
  if (token && (!expiresAt || expiresAt <= Date.now())) {
    clearAdminSession();
    window.dispatchEvent(new Event("masar-session-expired"));
  }
  const validToken = localStorage.getItem("token");
  if (validToken) {
    config.headers.Authorization = `Bearer ${validToken}`;
    }
    return config;
});
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/auth/login")) {
      clearAdminSession();
      window.dispatchEvent(new Event("masar-session-expired"));
    }
    return Promise.reject(error);
  }
);
export default axiosClient;