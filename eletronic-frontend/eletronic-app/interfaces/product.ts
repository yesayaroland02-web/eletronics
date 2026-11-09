export interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl?: string;
  stock: number;
  price: number;
}

export interface CreateProductPayload {
  title: string;
  category: string;
  description: string;
  imageUrl?: string;
  stock: number;
  price: number;
}

export interface UpdateProductPayload {
  title?: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  stock?: number;
  price?: number;
}