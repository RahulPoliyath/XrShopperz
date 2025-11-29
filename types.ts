
export enum Category {
  ELECTRONICS = 'Electronics',
  FASHION = 'Fashion',
  HOME = 'Home & Living',
  SPORTS = 'Sports',
  TOYS = 'Toys'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  isOnSale?: boolean;
  salePrice?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderStatusHistory {
  status: string;
  date: string;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  address: string;
  city: string;
  items: CartItem[];
  total: number;
  date: string; // ISO string for easier serialization
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  trackingId?: string;
  trackingUrl?: string;
  statusHistory?: OrderStatusHistory[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type ViewMode = 'shop' | 'admin' | 'cart' | 'orders' | 'wishlist';