
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "../../interfaces/product";
import AuthGuard from "../../components/AuthGuard";
import Navbar from "../../components/Navbar";
import { api } from "../../config/axios";

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/api/products/");

      console.log("Products API response:", res.data);

      const data = res.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.products)
            ? data.products
            : [];

      setProducts(list);
    } catch (err: unknown) {
      console.error("Gagal load produk:", err);

      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        console.error(
          "API Error:",
          (err as { response?: { data?: unknown } }).response?.data
        );
      }

      setError("Gagal mengambil data produk. Silakan coba kembali.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // Format harga kamar
  function formatRupiah(amount: number | string) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  }

  // Booking kamar dan kirim data ke halaman checkout
  function handleBooking(product: Product) {
    const roomPrice = Number(product.price);

    if (
      !product.id ||
      !Number.isFinite(roomPrice) ||
      roomPrice <= 0
    ) {
      alert("Data produk atau harga produk tidak valid.");
      return;
    }

    if (product.stock <= 0) {
      alert("Maaf, produk sedang tidak tersedia.");
      return;
    }

    const params = new URLSearchParams({
      productId: String(product.id),
      productName: product.title,
      price: String(roomPrice),
      quantity: "1",
    });

    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Katalog Produk
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Pilih produk yang kamu inginkan dan lakukan
              pemesanan dengan mudah.
            </p>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="py-24 text-center text-gray-400 font-semibold">
              Memuat katalog produk...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
              <p className="font-semibold text-red-700">
                {error}
              </p>

              <button
                onClick={loadProducts}
                className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Coba Lagi
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-20 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🏨
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-1">
                Belum Ada Produk Tersedia
              </h2>

              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Katalog produk saat ini sedang diperbarui.
                Silakan kunjungi kembali nanti.
              </p>
            </div>
          ) : (
            /* Grid Kamar */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Foto Kamar */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-gray-300 font-bold text-base">
                        Foto Produk
                      </div>
                    )}

                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-blue-700 font-semibold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                      {product.category}
                    </span>
                  </div>

                  {/* Informasi Kamar */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-blue-600 transition">
                        {product.title}
                      </h3>

                      {product.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-[11px] text-gray-400 uppercase font-semibold">
                            Harga 
                          </p>

                          <p className="font-extrabold text-blue-600 text-lg">
                            {formatRupiah(product.price)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[11px] text-gray-400 uppercase font-semibold">
                            Stok
                          </p>

                          <span
                            className={`font-bold text-xs px-2 py-1 rounded ${
                              product.stock > 0
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {product.stock > 0
                              ? `${product.stock} produk`
                              : "Habis"}
                          </span>
                        </div>
                      </div>

                      {/* Tombol Booking */}
                      <button
                        onClick={() => handleBooking(product)}
                        disabled={product.stock <= 0}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm hover:shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {product.stock > 0
                          ? "Pesan Sekarang"
                          : "Produk Habis"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}