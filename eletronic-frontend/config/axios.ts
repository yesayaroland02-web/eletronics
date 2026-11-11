import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_DEV_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://eletronics-snowy.vercel.app"
    : "http://localhost:8000");

console.log("API Base URL:", API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);