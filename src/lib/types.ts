export type Role = "USER" | "PROVIDER" | "ADMIN";

export interface AppUser {
  id: string;
  name?: string;
  email?: string;
  role?: Role | string;
  phone?: string;
  image?: string | null;
  status?: string;
  address?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface Category {
  id: string;
  name: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface Review {
  id?: string;
  ratings?: number;
  rating?: number;
  comment?: string;
  user?: AppUser | null;
  createdAt?: string;
  [key: string]: unknown;
}

export interface Meal {
  id: string;
  name: string;
  price: number | string;
  quantity?: number;
  description?: string;
  categoryId?: string;
  category?: Category | null;
  providerId?: string;
  provider?: AppUser | null;
  status?: string;
  isOnDiet?: boolean;
  image?: string | null;
  imageUrl?: string | null;
  reviews?: Review[];
  createdAt?: string;
  [key: string]: unknown;
}

export interface OrderItem {
  id?: string;
  mealsId?: string;
  mealId?: string;
  quantity?: number;
  price?: number | string;
  meals?: Meal | null;
  meal?: Meal | null;
  [key: string]: unknown;
}

export interface Order {
  id: string;
  status?: string;
  address?: string;
  contactNumber?: string;
  totalPrice?: number | string;
  total?: number | string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  user?: AppUser | null;
  customer?: AppUser | null;
  createdAt?: string;
  [key: string]: unknown;
}

export interface AdminStats {
  totalUsers?: number;
  totalProviders?: number;
  totalMeals?: number;
  totalOrders?: number;
  totalRevenue?: number;
  [key: string]: unknown;
}

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
] as const;

export const MEAL_STATUSES = ["AVAILABLE", "UNAVAILABLE"] as const;

export const USER_STATUSES = ["ACTIVATE", "SUSPEND"] as const;
