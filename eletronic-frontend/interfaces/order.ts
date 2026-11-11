export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number | string;
  product?: {
    id: string;
    title: string;
    price: number | string;
    imageUrl?: string | null;
  };
}

export interface Order {
  id: string;
  totalAmount: number | string;
  status: "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  userId?: string | null;
  user?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
  items: OrderItem[];
}

export interface CheckoutPayload {
  items: {
    productId: string;
    quantity: number;
  }[];
}