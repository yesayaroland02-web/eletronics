
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { api } from "../../config/axios";

interface OrderItem {
  id: string;
  quantity: number;
  price: string | number;
  product: {
    id: string;
    title: string;
    imageUrl?: string | null;
    price?: string | number;
  };
}

interface Transaction {
  id: string;
  totalAmount: string | number;
  status: "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";
  paymentProof?: string | null;
  createdAt: string;
  items: OrderItem[];
}

const statusConfig = {
  PENDING: {
    label: "Menunggu Pembayaran",
    className: "bg-yellow-100 text-yellow-700",
  },
  PAID: {
    label: "Sudah Dibayar",
    className: "bg-blue-100 text-blue-700",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-red-100 text-red-700",
  },
  COMPLETED: {
    label: "Selesai",
    className: "bg-green-100 text-green-700",
  },
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));

  // Mengambil riwayat transaksi
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("Silakan login terlebih dahulu.");
        return;
      }

      const response = await api.get("/api/orders/my-orders");

      const result = response.data;
      const orderData = result.data;

      if (!Array.isArray(orderData)) {
        throw new Error("Format data transaksi tidak sesuai.");
      }

      setTransactions(orderData);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal mengambil riwayat transaksi."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Hotel Reservation
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Riwayat Transaksi
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Lihat seluruh riwayat pemesanan kamar hotel Anda.
            </p>
          </div>

          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-50"
          >
            {loading ? "Memuat..." : "↻ Refresh"}
          </button>
        </div>

        {/* Summary */}
        {!loading && !error && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Total Transaksi
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {transactions.length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Menunggu Pembayaran
              </p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">
                {transactions.filter(
                  (item) => item.status === "PENDING"
                ).length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Sudah Dibayar
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {transactions.filter(
                  (item) => item.status === "PAID"
                ).length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Selesai
              </p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {transactions.filter(
                  (item) => item.status === "COMPLETED"
                ).length}
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-gray-500">
              Memuat riwayat transaksi...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-700">{error}</p>

            <button
              onClick={fetchTransactions}
              className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && transactions.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-20 text-center shadow-sm">
            <div className="text-5xl">🛏️</div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Belum Ada Transaksi
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Anda belum memiliki riwayat pemesanan kamar hotel.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Cari Kamar Hotel
            </Link>
          </div>
        )}

        {/* Transaction List */}
        {!loading && !error && transactions.length > 0 && (
          <div className="space-y-5">
            {transactions.map((transaction) => {
              const status =
                statusConfig[transaction.status] ||
                statusConfig.PENDING;

              return (
                <div
                  key={transaction.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Card Header */}
                  <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                    <div>
                      <p className="text-xs text-gray-400">
                        ID Transaksi
                      </p>

                      <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                        {transaction.id}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400">
                          Tanggal Pemesanan
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-800">
                          {formatDate(transaction.createdAt)}
                        </p>

                        <div className="mt-5 space-y-4">
                          {transaction.items?.map((item) => {
                            // Harga satu kamar dikalikan jumlah kamar
                            const unitPrice = Number(item.price);
                            const subtotal =
                              unitPrice * Number(item.quantity);

                            return (
                              <div
                                key={item.id}
                                className="flex items-center gap-4"
                              >
                                {item.product.imageUrl ? (
                                  <img
                                    src={item.product.imageUrl}
                                    alt={item.product.title}
                                    className="h-16 w-20 rounded-xl object-cover"
                                  />
                                ) : (
                                  <div className="flex h-16 w-20 items-center justify-center rounded-xl bg-gray-100 text-2xl">
                                    🛏️
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-gray-900">
                                    {item.product.title}
                                  </p>

                                  <p className="mt-1 text-sm text-gray-500">
                                    {item.quantity} kamar
                                  </p>

                                  <p className="mt-1 text-sm text-gray-600">
                                    {formatRupiah(subtotal)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="border-t border-gray-100 pt-5 md:min-w-52 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                        <p className="text-sm text-gray-500">
                          Total Pembayaran
                        </p>

                        <p className="mt-2 text-xl font-bold text-blue-600">
                          {formatRupiah(
                            Number(transaction.totalAmount)
                          )}
                        </p>

                        {transaction.status === "PENDING" && (
                          <Link
                            href={`/transactions/${transaction.id}`}
                            className="mt-2 block rounded-xl border border-blue-600 px-5 py-3 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                          >
                            Selesaikan Pembayaran
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}