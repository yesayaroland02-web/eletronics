"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const router = useRouter();
  const { login, register, loading, error } = useAuth();

  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<"CUSTOMER" | "ADMIN">("CUSTOMER");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const res = await login({ email, password });
        setSuccessMsg("Login berhasil! Mengalihkan...");
        setTimeout(() => {
          if (res?.data?.user?.role === "ADMIN") {
            router.push("/admin/dashboard");
          } else {
            router.push("/products");
          }
        }, 800);
      } else {
        await register({ name, email, password, role });
        setSuccessMsg(`Registrasi berhasil sebagai ${role}! Silakan masuk.`);
        setIsLogin(true);
        setPassword("");
      }
    } catch (err) {
      // Ditangani oleh hook useAuth
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        {/* Header App */}
        <div className="text-center mb-8">
          <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Elektronik
          </span>
          <p className="text-gray-500 text-sm mt-1">
            {isLogin ? "Masuk ke akun Anda" : "Buat akun baru pilihan Anda"}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-gray-100 mb-6">
          <button
            type="button"
            className={`flex-1 pb-3 text-center font-semibold text-sm transition-all ${
              isLogin
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
            onClick={() => {
              setIsLogin(true);
              setSuccessMsg(null);
            }}
          >
            Masuk
          </button>
          <button
            type="button"
            className={`flex-1 pb-3 text-center font-semibold text-sm transition-all ${
              !isLogin
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
            onClick={() => {
              setIsLogin(false);
              setSuccessMsg(null);
            }}
          >
            Daftar Akun
          </button>
        </div>

        {/* Notifikasi Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field Nama saat Register */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
              />
            </div>
          )}

          {/* Field Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
            />
          </div>

          {/* Field Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
            />
          </div>

          {/* Pilihan Role (Khusus Registrasi) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Pilih Role Akun
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("CUSTOMER")}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition ${
                    role === "CUSTOMER"
                      ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>👤</span>
                  <span>User / Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("ADMIN")}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition ${
                    role === "ADMIN"
                      ? "border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-500/20"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>⚡</span>
                  <span>Admin</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {role === "ADMIN"
                  ? "Admin dapat mengakses dashboard dan mengelola stok & produk."
                  : "User biasa dapat melihat katalog produk dan melakukan belanja."}
              </p>
            </div>
          )}

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading
              ? "Memproses..."
              : isLogin
              ? "Masuk Sekarang"
              : `Daftar Sebagai ${role}`}
          </button>
        </form>
      </div>
    </div>
  );
}
