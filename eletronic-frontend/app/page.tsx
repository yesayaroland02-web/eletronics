
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      router.replace("/products");
    } else {
      router.replace("/auth");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0B0D] text-white">
      Memeriksa status login...
    </div>
  );
}