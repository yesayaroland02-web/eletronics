"use client";

import { useEffect, useState } from "react";
import { Product } from "@/interfaces/product";
import { useOrder } from "@/hooks/useOrder";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

export default function ProductsPage() {
  const { checkout, loading: checkoutLoading } = useOrder();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart state: Record<productId, quantity>
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  async function loadProducts() {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/products/");
      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.products)
        ? data.products
        : [];
      setProducts(list);
    } catch (err) {
      console.error("Gagal load produk:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function addToCart(product: Product) {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const current = prev[product.id] || 0;
      if (current >= product.stock) {
        alert("Jumlah pesanan melebihi sisa stok yang tersedia!");
        return prev;
      }
      return { ...prev, [product.id]: current + 1 };
    });
    setCartOpen(true);
  }

  function updateQuantity(productId: string, qty: number, maxStock: number) {
    if (qty <= 0) {
      setCart((prev) => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
    } else {
      if (qty > maxStock) {
        alert("Jumlah pesanan melebihi sisa stok!");
        return;
      }
      setCart((prev) => ({ ...prev, [productId]: qty }));
    }
  }

  const cartItems = Object.entries(cart)
    .map(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId);
      return product ? { product, quantity } : null;
    })
    .filter(Boolean) as { product: Product; quantity: number }[];

  const totalCartPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const totalCartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  async function handleCheckout() {
    if (cartItems.length === 0) return;
    setOrderError(null);
    setOrderSuccess(null);

    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const result = await checkout(payload);
      setOrderSuccess(`Pesanan berhasil dibuat! ID Order: ${result.id.substring(0, 8)}...`);
      setCart({});
      setCartOpen(false);
      await loadProducts(); // Refresh stok produk
    } catch (err: any) {
      setOrderError(err.message || "Gagal melakukan checkout");
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Banner & Cart Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                Katalog Produk Elektronik
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Pilih produk elektronik impian Anda dan lakukan pemesanan secara instan.
              </p>
            </div>

            {/* Floating/Fixed Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer self-start sm:self-auto"
            >
              <span>🛒 Keranjang Belanja</span>
              {totalCartCount > 0 && (
                <span className="bg-amber-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>

          {/* Notifikasi Checkout */}
          {orderSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>{orderSuccess}</span>
              </div>
              <button
                onClick={() => setOrderSuccess(null)}
                className="text-emerald-700 hover:text-emerald-900 text-sm font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}

          {orderError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{orderError}</span>
              </div>
              <button
                onClick={() => setOrderError(null)}
                className="text-red-700 hover:text-red-900 text-sm font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Grid Produk */}
          {loading ? (
            <div className="py-24 text-center text-gray-400 font-semibold">
              Memuat katalog produk...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-20 text-center shadow-xs">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                📦
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                Belum Ada Produk Tersedia
              </h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Katalog saat ini sedang diperbarui. Admin dapat menambahkan produk melalui Admin Dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const inCartQty = cart[product.id] || 0;
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
                  >
                    {/* Foto Produk */}
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
                      <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-blue-700 font-semibold text-xs px-2.5 py-1 rounded-lg shadow-xs">
                        {product.category}
                      </span>
                    </div>

                    {/* Rincian Produk */}
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
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-[11px] text-gray-400 uppercase font-semibold">Harga</p>
                            <p className="font-extrabold text-blue-600 text-lg">
                              Rp {Number(product.price).toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] text-gray-400 uppercase font-semibold">Stok</p>
                            <span
                              className={`font-bold text-xs px-2 py-0.5 rounded ${
                                product.stock > 0
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {product.stock > 0 ? `${product.stock} unit` : "Habis"}
                            </span>
                          </div>
                        </div>

                        {/* Tombol Beli / Tambah ke Keranjang */}
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock <= 0}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm hover:shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>{inCartQty > 0 ? `Tambah Lagi (${inCartQty})` : "Pesan Sekarang"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Modal Drawer Keranjang Belanja & Checkout */}
        {cartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
              {/* Header Drawer */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🛍️</span>
                  <h2 className="text-lg font-bold text-gray-900">Keranjang Belanja</h2>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <p className="text-4xl mb-2">🛒</p>
                    <p className="font-semibold">Keranjang masih kosong</p>
                    <p className="text-xs text-gray-400 mt-1">Pilih barang elektronik favoritmu di katalog.</p>
                  </div>
                ) : (
                  cartItems.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 truncate">
                          {product.title}
                        </h4>
                        <p className="text-xs text-blue-600 font-semibold mt-0.5">
                          Rp {Number(product.price).toLocaleString("id-ID")}
                        </p>
                      </div>

                      {/* Control Qty */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1, product.stock)}
                          className="w-7 h-7 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 font-bold text-sm text-gray-600 flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-sm text-gray-800">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1, product.stock)}
                          className="w-7 h-7 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 font-bold text-sm text-gray-600 flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Checkout */}
              {cartItems.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                    <span>Total Item:</span>
                    <span className="font-bold text-gray-900">{totalCartCount} item</span>
                  </div>
                  <div className="flex justify-between items-center text-base font-bold text-gray-900">
                    <span>Total Tagihan:</span>
                    <span className="text-xl text-blue-600">
                      Rp {totalCartPrice.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl shadow-md hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {checkoutLoading ? "Memproses Checkout..." : "⚡ Selesaikan Pesanan (Checkout)"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
