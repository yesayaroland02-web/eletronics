"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/config/axios";

interface CheckoutOrder {
  id: string;
  totalAmount: string | number;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productId = searchParams.get("productId") || "";
  const productName = searchParams.get("productName") || "Produk";
  const price = Number(searchParams.get("price") || 0);

  const [quantity, setQuantity] = useState(
    Math.max(1, Number(searchParams.get("quantity") || 1))
  );

  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ======================================================
  // HITUNG DURASI MENGINAP
  // ======================================================

  

  // ======================================================
  // HITUNG TOTAL HARGA
  // Harga kamar x jumlah kamar
  // ======================================================

  const estimatedTotal = price * quantity;

  // ======================================================
  // FORMAT RUPIAH
  // ======================================================

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  // ======================================================
  // CREATE CHECKOUT
  // ======================================================

  async function handleCreateCheckout(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    // Validasi produk
    if (!productId) {
      setError("ID produk tidak ditemukan. Silakan pilih pr kembali.");
      return;
    }

    // Validasi harga
    if (!Number.isFinite(price) || price <= 0) {
      setError("Harga kamar tidak ditemukan. Silakan pilih kamar kembali.");
      return;
    }


    // Validasi jumlah kamar
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Jumlah produk minimal 1.");
      return;
    }

    // Validasi login
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    try {
      setLoading(true);

      // Request checkout melalui Axios
      const response = await api.post("/api/checkout", {
        items: [
          {
            productId,
            quantity,
          },
        ],
      });

      const result = response.data;

      // Menyesuaikan kemungkinan struktur response backend
      const checkoutData =
        result.order ||
        result.data?.order ||
        result.data;

      if (
        !checkoutData?.id ||
        checkoutData.totalAmount === undefined
      ) {
        throw new Error(
          result.message || "Data pesanan dari server tidak lengkap."
        );
      }

      const newOrder: CheckoutOrder = {
        id: checkoutData.id,
        totalAmount: checkoutData.totalAmount,
      };

      setOrder(newOrder);

      // Simpan order sementara
      sessionStorage.setItem(
        "hotel_checkout_order",
        JSON.stringify(newOrder)
      );

      setMessage(
        "Pesanan berhasil dibuat. Silakan lakukan pembayaran."
      );
    } catch (err: unknown) {
      console.error("Checkout error:", err);

      const axiosError = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      setError(
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Terjadi kesalahan saat membuat pesanan."
      );
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // UPLOAD PAYMENT PROOF
  // ======================================================

  async function handleUploadProof(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    // Validasi order
    if (!order) {
      setError("Buat pesanan terlebih dahulu.");
      return;
    }

    // Validasi file
    if (!paymentProof) {
      setError("Pilih bukti pembayaran terlebih dahulu.");
      return;
    }

    // Validasi ukuran file
    if (paymentProof.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5 MB.");
      return;
    }

    // Validasi format file
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(
        paymentProof.type
      )
    ) {
      setError("File harus berformat JPG, PNG, atau WEBP.");
      return;
    }

    // Validasi login
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Silakan login kembali.");
      router.push("/login");
      return;
    }

    // FormData untuk upload gambar
    const formData = new FormData();
    formData.append("paymentProof", paymentProof);

    try {
      setUploading(true);

      // Upload melalui Axios
      // Authorization otomatis ditambahkan interceptor
      const response = await api.post(
        `/api/checkout/${order.id}/payment-proof`,
        formData
      );

      const result = response.data;

      // Hapus order sementara
      sessionStorage.removeItem("hotel_checkout_order");

      alert(
        result.message ||
          "Bukti pembayaran berhasil diunggah! Silakan tunggu verifikasi admin."
      );

      router.replace("/products");
    } catch (err: unknown) {
      console.error("Upload payment proof error:", err);

      const axiosError = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      setError(
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Gagal mengunggah bukti pembayaran."
      );
    } finally {
      setUploading(false);
    }
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <main className="min-h-screen bg-[#0B0B0D] px-4 py-12 text-[#F4F0E8]">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.3em] text-[#D6A85F]">
            Produk
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            Checkout Pesanan
          </h1>

          <p className="mt-3 text-sm text-gray-400">
            Lengkapi informasi pemesanan dan lakukan pembayaran.
          </p>
        </div>

        {/* Notifikasi */}
        {(error || message) && (
          <div
            className={`mb-6 rounded-xl border p-4 text-sm ${
              error
                ? "border-red-500/30 bg-red-500/10 text-red-300"
                : "border-green-500/30 bg-green-500/10 text-green-300"
            }`}
          >
            {error || message}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">

          {/* Form Checkout */}
          <section>
            {!order ? (
              <form
                onSubmit={handleCreateCheckout}
                className="rounded-2xl border border-[#292930] bg-[#121216] p-6 md:p-8"
              >
                <h2 className="mb-6 text-xl font-semibold">
                  Informasi Pemesanan
                </h2>

                {/* Nama kamar */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm text-gray-300">
                    Nama Produk
                  </label>

                  <div className="rounded-xl border border-[#292930] bg-[#1C1C22] px-4 py-3">
                    {productName}
                  </div>
                </div>

                {/* Harga kamar */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm text-gray-300">
                    Harga Produk
                  </label>

                  <div className="rounded-xl border border-[#292930] bg-[#1C1C22] px-4 py-3 font-semibold text-[#D6A85F]">
                    {formatRupiah(price)}
                  </div>
                </div>


                {/* Jumlah kamar */}
                <div className="mt-6">
                  <label className="mb-2 block text-sm text-gray-300">
                    Jumlah Produk
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Number(e.target.value))
                    }
                    required
                    className="w-full rounded-xl border border-[#292930] bg-[#1C1C22] px-4 py-3 text-white outline-none focus:border-[#D6A85F]"
                  />
                </div>

                {/* Total */}
                <div className="mt-8 rounded-xl bg-[#1C1C22] p-5">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Harga produk</span>
                    <span>{formatRupiah(price)}</span>
                  </div>

                  <div className="mt-3 flex justify-between text-sm text-gray-400">
                    <span>Jumlah produk</span>
                    <span>{quantity}</span>
                  </div>

                  <div className="my-4 border-t border-[#292930]" />

                  <div className="flex justify-between gap-4 font-semibold">
                    <span>Total pembayaran</span>

                    <span className="text-right text-[#D6A85F]">
                      {formatRupiah(estimatedTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !productId ||
                    !Number.isFinite(price) ||
                    price <= 0
                  }
                  className="mt-6 w-full rounded-xl bg-[#C62828] px-5 py-4 font-semibold transition hover:bg-[#E5484D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Memproses..." : "Buat Pesanan"}
                </button>
              </form>
            ) : (
              /* Pembayaran */
              <div className="rounded-2xl border border-[#292930] bg-[#121216] p-6 md:p-8">
                <p className="text-sm text-green-400">
                  Pesanan berhasil dibuat
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Selesaikan Pembayaran
                </h2>

                <p className="mt-2 break-all text-sm text-gray-400">
                  ID Pesanan: {order.id}
                </p>

                {/* Detail pembayaran */}
                <div className="mt-6 rounded-xl border border-[#292930] bg-[#1C1C22] p-5">
                  <p className="text-sm text-gray-400">
                    Total pembayaran
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#D6A85F]">
                    {formatRupiah(Number(order.totalAmount))}
                  </p>

                  <div className="mt-5 border-t border-[#292930] pt-5">
                    <p className="font-semibold">
                      Instruksi Transfer
                    </p>

                    <p className="mt-3 text-sm text-gray-400">
                      Silakan transfer sesuai total pembayaran ke
                      rekening resmi kami.
                    </p>

                    <div className="mt-4 space-y-2 text-sm">
                      <p>
                        Bank:{" "}
                        <span className="text-[#D6A85F]">
                          BRI
                        </span>
                      </p>

                      <p>
                        Nomor rekening:{" "}
                        <span className="text-[#D6A85F]">
                          08123456789
                        </span>
                      </p>

                      <p>
                        Atas nama:{" "}
                        <span className="text-[#D6A85F]">
                          Penjualan Eletronik
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload bukti pembayaran */}
                <form
                  onSubmit={handleUploadProof}
                  className="mt-7"
                >
                  <label
                    htmlFor="paymentProof"
                    className="mb-3 block text-sm font-medium"
                  >
                    Upload Bukti Pembayaran
                  </label>

                  <input
                    id="paymentProof"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) =>
                      setPaymentProof(
                        e.target.files?.[0] || null
                      )
                    }
                    className="w-full rounded-xl border border-[#292930] bg-[#1C1C22] p-3 text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-[#D6A85F] file:px-4 file:py-2 file:font-semibold file:text-black"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    JPG, PNG, atau WEBP. Maksimal 5 MB.
                  </p>

                  {paymentProof && (
                    <p className="mt-3 break-all text-sm text-[#D6A85F]">
                      File: {paymentProof.name}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={uploading || !paymentProof}
                    className="mt-6 w-full rounded-xl bg-[#C62828] px-5 py-4 font-semibold transition hover:bg-[#E5484D] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading
                      ? "Mengunggah bukti..."
                      : "Kirim Bukti Pembayaran"}
                  </button>
                </form>
              </div>
            )}
          </section>

          {/* Ringkasan Pesanan */}
          <aside className="h-fit rounded-2xl border border-[#292930] bg-[#121216] p-6">
            <h2 className="mb-6 text-lg font-semibold">
              Ringkasan Pesanan
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">produk</span>
                <span className="text-right">{productName}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Harga Produk</span>
                <span className="text-right">
                  {formatRupiah(price)}
                </span>
              </div>


              <div className="flex justify-between">
                <span className="text-gray-400">Jumlah Produk</span>
                <span>{quantity}</span>
              </div>

              <div className="border-t border-[#292930] pt-4">
                <div className="flex justify-between gap-4 font-semibold">
                  <span>Total</span>

                  <span className="text-right text-[#D6A85F]">
                    {formatRupiah(
                      order
                        ? Number(order.totalAmount)
                        : estimatedTotal
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-xl border border-[#D6A85F]/20 bg-[#D6A85F]/5 p-4">
              <p className="text-sm font-medium text-[#D6A85F]">
                Informasi Pembayaran
              </p>

              <p className="mt-2 text-xs leading-6 text-gray-400">
                Stok Produk akan dikurangi setelah bukti pembayaran
                berhasil diunggah dan diproses oleh server.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// ======================================================
// CHECKOUT PAGE
// ======================================================

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0B0B0D] text-white">
          Memuat halaman checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}