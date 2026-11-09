"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/interfaces/auth";

export default function Navbar() {
  const { logout, getCurrentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/products" className="flex items-center space-x-2">
              <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Elektronik
              </span>
            </Link>

            <div className="hidden sm:flex space-x-4">
              <Link
                href="/products"
                className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 rounded-md transition"
              >
                Katalog Produk
              </Link>
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  className="text-indigo-600 hover:text-indigo-800 font-semibold px-3 py-2 rounded-md bg-indigo-50 transition"
                >
                  ⚡ Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 p-2 rounded-xl border border-gray-200 transition cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {(user.name || user.email || "U")[0].toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">
                      {user.name || user.email.split("@")[0]}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span>{user.email}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Masuk Sebagai
                      </p>
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {user.name || user.email.split("@")[0]}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <div className="mt-2">
                        <span
                          className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          Role: {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium"
                        >
                          ⚡ Dashboard Admin (Produk & Pesanan)
                        </Link>
                      )}
                      <Link
                        href="/products"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                      >
                        🛍️ Katalog Produk & Belanja
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center space-x-2 transition cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition shadow-xs"
              >
                Masuk / Daftar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
