"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProducts } from "../../../hooks/useProduct";
import { useAuth } from "../../../hooks/useAuth";
import { useOrder } from "../../../hooks/useOrder";
import { Product, CreateProductPayload } from "../../../interfaces/product";
import { Order } from "../../../interfaces/order";
import Navbar from "../../../components/Navbar";

export default function AdminDashboard() {
  const router = useRouter();
  const { getCurrentUser } = useAuth();
  const { products, loading: productsLoading, error: productError, createProduct, updateProduct, softDelete } =
    useProducts();
  const { orders, fetchAllOrders, updateStatus, loading: ordersLoading, error: orderError } = useOrder();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // View state: 'orders' | 'products' | 'form'
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "form">("orders");
  const [editing, setEditing] = useState<Product | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setAuthChecked(true);
    if (user?.role === "ADMIN") {
      fetchAllOrders();
    }
  }, []);

  function openProductForm(product: Product | null = null) {
    setEditing(product);
    setTitle(product?.title ?? "");
    setCategory(product?.category ?? "");
    setDescription(product?.description ?? "");
    setPrice(String(product?.price ?? ""));
    setStock(String(product?.stock ?? ""));
    setImageFile(null);
    setActiveTab("form");
  }

  async function handleSubmitProduct(e: FormEvent) {
    e.preventDefault();

    const payload: CreateProductPayload = {
      title,
      category,
      description,
      price: Number(price),
      stock: Number(stock),
    };

    const result = editing
      ? await updateProduct(payload, editing.id, imageFile || undefined)
      : await createProduct(payload, imageFile || undefined);

    if (result) {
      setEditing(null);
      setActiveTab("products");
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    await softDelete(id);
  }

  async function handleStatusChange(orderId: string, newStatus: "PENDING" | "PAID" | "CANCELLED" | "COMPLETED") {
    await updateStatus(orderId, newStatus);
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Memeriksa izin akun...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-xl mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg border border-gray-100 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            🔒
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Halaman ini khusus untuk akun dengan Role <strong>ADMIN</strong>. Silakan login menggunakan akun Admin Anda.
          </p>
          <button
            onClick={() => router.push("/auth")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-md"
          >
            Buka Halaman Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Admin */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Panel Kontrol Admin
              </h1>
              <span className="bg-purple-100 text-purple-700 font-bold text-xs px-2.5 py-1 rounded-full">
                ADMIN
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Pantau pesanan masuk secara real-time dan kelola katalog produk Anda.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs self-start md:self-auto">
            <button
              onClick={() => {
                setActiveTab("orders");
                fetchAllOrders();
              }}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition cursor-pointer flex items-center gap-2 ${
                activeTab === "orders"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span>📦 Pesanan Masuk</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-black ${
                  activeTab === "orders" ? "bg-blue-800 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition cursor-pointer flex items-center gap-2 ${
                activeTab === "products"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span>📋 Kelola Produk</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-black ${
                  activeTab === "products" ? "bg-blue-800 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                {products.length}
              </span>
            </button>

            <button
              onClick={() => openProductForm(null)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition cursor-pointer ${
                activeTab === "form"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              ➕ Tambah Produk
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {(productError || orderError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-semibold text-sm">
            {productError || orderError}
          </div>
        )}

        {/* TAB 1: DAFTAR PESANAN MASUK (ORDERS) */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="font-extrabold text-gray-900">
                Semua Pesanan Pelanggan ({orders.length})
              </h2>
              <button
                onClick={() => fetchAllOrders()}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                🔄 Segarkan Pesanan
              </button>
            </div>

            {ordersLoading ? (
              <div className="py-20 text-center text-gray-400 font-semibold">
                Memuat daftar pesanan...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-4xl mb-2">📭</p>
                <p className="font-bold text-gray-700 text-lg">Belum Ada Pesanan Masuk</p>
                <p className="text-gray-400 text-sm mt-1">
                  Pesanan yang dibuat oleh customer di halaman katalog akan otomatis tampil di sini.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-gray-50/60 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-sm text-gray-900">
                            #{order.id.substring(0, 8)}
                          </span>
                          <span
                            className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                              order.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.status === "PAID"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Waktu Pesan: {new Date(order.createdAt).toLocaleString("id-ID")}
                        </p>
                      </div>

                      {/* Customer Info */}
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-400">Pemesan:</p>
                        <p className="text-sm font-bold text-gray-800">
                          {order.user?.name || "Customer"}
                        </p>
                        <p className="text-xs text-gray-500">{order.user?.email || "Email tidak tersedia"}</p>
                      </div>
                    </div>

                    {/* Order Items Table/List */}
                    <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 mb-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Rincian Barang yang Dipesan:
                      </p>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">
                                {item.product?.title || "Produk"}
                              </span>
                              <span className="text-gray-400 text-xs">x{item.quantity}</span>
                            </div>
                            <span className="font-medium text-gray-700">
                              Rp {(Number(item.price) * item.quantity).toLocaleString("id-ID")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total & Action Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-xs text-gray-400">Total Pembayaran:</span>
                        <p className="text-xl font-black text-blue-600">
                          Rp {Number(order.totalAmount).toLocaleString("id-ID")}
                        </p>
                      </div>

                      {/* Ubah Status Button Group */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-500 mr-1">Update Status:</span>
                        {order.status !== "PAID" && (
                          <button
                            onClick={() => handleStatusChange(order.id, "PAID")}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition cursor-pointer"
                          >
                            Set PAID (Dibayar)
                          </button>
                        )}
                        {order.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleStatusChange(order.id, "COMPLETED")}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition cursor-pointer"
                          >
                            Set COMPLETED (Selesai)
                          </button>
                        )}
                        {order.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleStatusChange(order.id, "CANCELLED")}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs transition cursor-pointer"
                          >
                            Batalkan & Restock
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KELOLA PRODUK */}
        {activeTab === "products" && (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-extrabold text-gray-900">
                Katalog Produk ({products.length})
              </h2>
            </div>

            {productsLoading ? (
              <div className="py-20 text-center text-gray-400 font-semibold">
                Memuat daftar produk...
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-gray-500">Belum ada produk yang tersimpan.</p>
                <button
                  onClick={() => openProductForm(null)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700"
                >
                  Tambah Produk Pertama
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
                    <tr>
                      <th className="px-6 py-4">Foto</th>
                      <th className="px-6 py-4">Judul Produk</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Harga</th>
                      <th className="px-6 py-4">Stok</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition">
                        <td className="px-6 py-4">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-xs">
                              IMG
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {item.title}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">
                          Rp {Number(item.price).toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-xs ${
                              item.stock <= 5
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {item.stock} Produk
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => openProductForm(item)}
                            className="px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 font-semibold rounded-lg text-xs transition cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(item.id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg text-xs transition cursor-pointer"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FORM TAMBAH / EDIT PRODUK */}
        {activeTab === "form" && (
          <div className="max-w-2xl bg-white rounded-2xl shadow-xs border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {editing ? "Edit Produk" : "Tambah Produk Baru"}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Lengkapi informasi produk dibawah ini.
            </p>

            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Judul Produk
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: iPhone 15 Pro Max 256GB"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Misal: Smartphone"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Stok
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    min="0"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Harga (Rupiah)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Contoh: 15000000"
                  min="0"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan spesifikasi dan keunggulan produk..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Upload Foto Produk (Opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={productsLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {productsLoading ? "Menyimpan..." : editing ? "Perbarui Produk" : "Simpan Produk"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("products")}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl text-sm transition cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}