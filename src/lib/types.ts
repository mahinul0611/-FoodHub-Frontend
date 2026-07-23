export type Role = "USER" | "PROVIDER" | "ADMIN";
// Feature flag: set to true to require phone verification before ordering.
export const PHONE_VERIFICATION_ENABLED = false;
export interface AppUser {
  id: string;
  name?: string;
  email?: string;
  role?: Role | string;
  phone?: string;
  phoneVerified?: boolean; // 👈 notun
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
  paymentMethod?: string;
  paymentStatus?: string;
  transactionId?: string;
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
  "PLACED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
] as const;

export const COMPLAINT_CATEGORIES = [
  "FOOD_QUALITY",
  "MISSING_ITEMS",
  "LATE_DELIVERY",
  "WRONG_ORDER",
  "OTHER",
] as const;

export const COMPLAINT_CATEGORY_LABELS: Record<string, string> = {
  FOOD_QUALITY: "Food quality",
  MISSING_ITEMS: "Missing items",
  LATE_DELIVERY: "Late delivery",
  WRONG_ORDER: "Wrong order",
  OTHER: "Other",
};

export const COMPLAINT_STATUSES = [
  "OPEN",
  "IN_REVIEW",
  "RESOLVED",
  "REJECTED",
] as const;

export interface Complaint {
  id: string;
  orderId?: string;
  userId?: string;
  providerId?: string;
  category?: string;
  description?: string;
  status?: string;
  resolution?: string;
  user?: AppUser | null;
  provider?: AppUser | null;
  createdAt?: string;
  [key: string]: unknown;
}

export const MEAL_STATUSES = ["AVAILABLE", "STOCKOUT"] as const;

export const USER_STATUSES = ["ACTIVATE", "SUSPEND"] as const;

export const PAYMENT_METHODS = ["COD", "SSLCOMMERZ","STRIPE"] as const;