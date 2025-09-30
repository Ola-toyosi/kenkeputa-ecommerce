// -----------------------------
// User
// -----------------------------
export interface User {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
}

// -----------------------------
// Product
// -----------------------------
export interface Product {
  id: number;
  title: string;
  description?: string;
  price: number;
  inventory_count: number;
  category?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

// -----------------------------
// CartItem
// -----------------------------
export interface CartItem {
  id: number;
  user: number | User;
  product: Product;
  quantity: number;
  subtotal: number;
}

// -----------------------------
// Order + OrderItem
// -----------------------------
export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  user: number | User;
  created_at: string;
  total_price: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
}
