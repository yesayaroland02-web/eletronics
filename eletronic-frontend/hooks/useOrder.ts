import { useState } from "react";
import { api } from "@/config/axios";
import { Order, CheckoutPayload } from "../interfaces/order";

export function useOrder() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout(payload: CheckoutPayload) {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<{ message: string; data: Order }>(
        "/api/orders",
        payload,
      );
      return response.data.data;
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Gagal memproses pesanan / checkout";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllOrders() {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<{ message: string; data: Order[] }>(
        "/api/orders",
      );
      setOrders(response.data.data || []);
      return response.data.data;
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Gagal mengambil daftar pesanan";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    orderId: string,
    status: "PENDING" | "PAID" | "CANCELLED" | "COMPLETED",
  ) {
    setLoading(true);
    setError(null);

    try {
      const response = await api.patch<{ message: string; data: Order }>(
        `/api/orders/${orderId}/status`,
        { status },
      );
      await fetchAllOrders();
      return response.data.data;
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Gagal memperbarui status pesanan";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }

  return {
    orders,
    loading,
    error,
    checkout,
    fetchAllOrders,
    updateStatus,
  };
}