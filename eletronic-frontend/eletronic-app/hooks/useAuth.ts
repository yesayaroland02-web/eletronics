import { useState } from "react";
import { api } from "@/config/axios";
import { AuthPayload, AuthResponse, User } from "@/interfaces/auth";

export function useAuth() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function register(payload: AuthPayload) {
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
  }

  async function login(payload: AuthPayload) {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>("/api/auth/login", payload);
      const data = response.data.data;

      // Simpan token & data user ke localStorage
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
  }

  function logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
  }

  function getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  return { loading, error, register, login, logout, getCurrentUser };
}
