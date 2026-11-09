import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_WARMAD_PROD_URL ||
  process.env.NEXT_PUBLIC_WARMAD_DEV_URL ||
  "http://localhost:8000";

console.log("API Base URL:", API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
  }
  return config;
});