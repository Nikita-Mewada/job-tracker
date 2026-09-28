import axios from "axios";
import { showToast } from "../utils/toast.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthEndpoint = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/signup");

    if (status === 401 && !isAuthEndpoint) {
      const hadToken = Boolean(localStorage.getItem("token"));
      localStorage.removeItem("token");
      if (hadToken) {
        showToast("Session expired — please log in again", "warning");
        window.location.href = "/login";
      }
    } else if (status >= 500) {
      showToast("Something went wrong on the server. Please try again.", "error");
    } else if (!error.response) {
      showToast("Can't reach the server — check your connection.", "error");
    }

    return Promise.reject(error);
  }
);

export default api;

