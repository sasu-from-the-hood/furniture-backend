import axios from "axios";
import { toast } from "react-toastify";
import { API_URL } from "../config/index";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.defaults.headers.common["Content-Type"] = "application/json";
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.log(error);
    console.log("Currently in interceptor");

    if (error.response) {
      if (error.response.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          console.log("Refreshing token...");

          const response = await axios.get(`${API_URL}/auth/refresh`, {
            withCredentials: true,
          });

          console.log("Response from refresh token", response);

          const newToken = response.data.token;
          localStorage.setItem("token", newToken);
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          console.log("Retrying original request with new token");
          // Immediately retry the original request without requiring further action
          return axiosInstance(originalRequest);
        } catch (err) {
          console.log("Error refreshing token:", err);
          toast.error("Session expired. Please log in again.");
        }
      } else if (error.response.status === 401) {
        toast.error("Please login first.");
      }
    } else {
      // Network error or server not responding
      toast.error("Network error. Please check your connection.");
      console.error("Network Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
