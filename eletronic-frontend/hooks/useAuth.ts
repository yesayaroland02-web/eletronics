
import { useState, useCallback } from "react";
import { api } from "@/config/axios";
import { AuthPayload, AuthResponse, User } from "../interfaces/auth";

export function useAuth() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (payload: AuthPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>(
        "/api/auth/register",
        payload,
      );

      return response.data;
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.messagge ||
        "Gagal melakukan registrasi";

      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (payload: AuthPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>(
        "/api/auth/login",
        payload,
      );

      const data = response.data.data;

      if (data.token) {
        localStorage.setItem("accessToken", data.token);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      return response.data;
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.messagge ||
        "Gagal melakukan login";

      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
  }, []);

  const getCurrentUser = useCallback((): User | null => {
    if (typeof window === "undefined") {
      return null;
    }

    const saved = localStorage.getItem("user");

    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved) as User;
    } catch {
      return null;
    }
  }, []);

  return {
    loading,
    error,
    register,
    login,
    logout,
    getCurrentUser,
  };
}