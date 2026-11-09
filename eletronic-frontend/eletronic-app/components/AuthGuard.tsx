"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek token di client-side (localStorage atau cookies)
    const token = localStorage.getItem("accessToken"); // Sesuaikan key token Anda

    if (!token) {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col w-screen h-screen justify-center items-center bg-gray-50">
        <h1 className="text-blue-500 font-semibold animate-pulse">
          Memeriksa sesi...
        </h1>
      </div>
    );
  }

  // Jika belum login, tampilkan pop-up / modal blokir akses
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center flex flex-col items-center animate-in fade-in zoom-in duration-200">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-inner">
            🔒
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Akses Dibatasi
          </h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            Sesi Anda tidak ditemukan atau sudah berakhir. Silakan masuk kembali
            untuk mengakses katalog produk Warmad Mart.
          </p>
          <button
            onClick={() => router.push("/auth")} // Sesuaikan route halaman login Anda
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            Kembali ke Halaman Login
          </button>
        </div>
      </div>
    );
  }

  // Jika sudah login, render halaman SSR aslinya
  return <>{children}</>;
}