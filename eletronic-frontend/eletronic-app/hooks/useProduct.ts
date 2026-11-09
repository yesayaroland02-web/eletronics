import { useState, useEffect } from "react";
import { api } from "@/config/axios";
import {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/interfaces/product";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

 

async function getProducts() {
  console.log("1. getProducts() dipanggil");

  setLoading(true);
  setError(null);

  try {
    console.log("2. Mengirim request ke API:", api.defaults.baseURL);

    const response = await api.get("/api/products/");

    console.log("3. Products API response:", response.data);

    const result = response.data;
    const productList = Array.isArray(result)
      ? result
      : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.products)
          ? result.products
          : [];

    setProducts(productList);
  } catch (error: any) {
    console.error("4. Gagal mengambil produk:", error);
    setError(
      error.response?.data?.message ||
      error.message ||
      "Gagal fetching produk"
    );
  } finally {
    setLoading(false);
  }
}


  // 1. Tambahkan parameter imageFile opsional
  async function createProduct(
    payload: CreateProductPayload,
    imageFile?: File,
  ) {
    setLoading(true);
    setError(null);

    try {
      // 2. Gunakan FormData karena mengirim file dan data teks sekaligus
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("category", payload.category);
      if (payload.description)
        formData.append("description", payload.description);
      formData.append("price", String(payload.price));
      formData.append("stock", String(payload.stock));

      // 3. Masukkan file gambar jika ada
     
      // Upload gambar harus menggunakan field "imageUrl"
      if (imageFile) {
        formData.append("imageUrl", imageFile);
      }

      const response = await api.post<Product>(
        "/api/products/",
        formData
      );

      await getProducts();
      return response.data;
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Gagal menambahkan produk"
      );
    } finally {
      setLoading(false);
    }
  }


  // 4. Tambahkan parameter imageFile opsional untuk update
 
  async function updateProduct(
    payload: UpdateProductPayload,
    id: string,
    imageFile?: File,
  ) {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      if (payload.title !== undefined)
        formData.append("title", payload.title);

      if (payload.category !== undefined)
        formData.append("category", payload.category);

      if (payload.description !== undefined)
        formData.append("description", payload.description);

      if (payload.price !== undefined)
        formData.append("price", String(payload.price));

      if (payload.stock !== undefined)
        formData.append("stock", String(payload.stock));

      if (imageFile) {
        formData.append("imageUrl", imageFile);
      }

      const response = await api.put<Product>(
        `/api/products/${id}`,
        formData
      );

      await getProducts();
      return response.data;
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Gagal mengubah produk"
      );
    } finally {
      setLoading(false);
    }
  }


  async function softDelete(id: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await api.delete(`/api/products/${id}/soft-delete`);
      await getProducts();
      return response.data;
    } catch (error: any) {
      setError(error.response?.data?.messagge || "Gagal menghapus produk");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getProducts();
  }, []);

  return { products, error, loading, createProduct, updateProduct, softDelete };
}