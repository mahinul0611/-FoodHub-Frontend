"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Meal } from "./types";
import { toNumber } from "./utils";
import { useAuth } from "@/lib/auth-context"; // 🆕 ইউজারের তথ্য আনার জন্য

export interface CartItem {
  meal: Meal;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (meal: Meal, quantity?: number) => void;
  removeItem: (mealId: string) => void;
  setQuantity: (mealId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  count: 0,
  total: 0,
  addItem: () => {},
  removeItem: () => {},
  setQuantity: () => {},
  clear: () => {},
});

export function useCart(): CartContextValue {
  return useContext(CartContext);
}

const MAX_QUANTITY = 99;

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); // 🆕 কারেন্ট ইউজারকে বের করা হলো
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // 🆕 ডাইনামিক স্টোরেজ কি: ইউজার লগইন থাকলে তার আইডির নামে, নাহলে গেস্ট
  const STORAGE_KEY = user?.id ? `BiteBear-cart-${user.id}` : "BiteBear-cart-guest";

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(
            parsed.filter(
              (item): item is CartItem =>
                Boolean(item) &&
                typeof item === "object" &&
                Boolean((item as CartItem).meal) &&
                typeof (item as CartItem).meal.id === "string" &&
                typeof (item as CartItem).quantity === "number" &&
                (item as CartItem).quantity > 0,
            ),
          );
        }
      } else {
        // 🆕 যদি এই ইউজারের কোনো কার্ট না থাকে, তবে কার্ট ফাঁকা করে দাও
        setItems([]); 
      }
    } catch {
      // Ignore a corrupted cart and start fresh.
      setItems([]);
    }
    setHydrated(true);
  }, [STORAGE_KEY]); // 🆕 STORAGE_KEY পরিবর্তন হলে (লগইন/লগআউট করলে) এটি আবার রান করবে

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage may be unavailable (private mode); the cart still works in memory.
    }
  }, [items, hydrated, STORAGE_KEY]); // 🆕 STORAGE_KEY ডিপেন্ডেন্সিতে অ্যাড করা হলো

  const addItem = useCallback((meal: Meal, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.meal.id === meal.id);
      if (existing) {
        return prev.map((item) =>
          item.meal.id === meal.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, MAX_QUANTITY),
              }
            : item,
        );
      }
      return [...prev, { meal, quantity: Math.min(quantity, MAX_QUANTITY) }];
    });
  }, []);

  const removeItem = useCallback((mealId: string) => {
    setItems((prev) => prev.filter((item) => item.meal.id !== mealId));
  }, []);

  const setQuantity = useCallback((mealId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.meal.id !== mealId);
      }
      return prev.map((item) =>
        item.meal.id === mealId
          ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }
          : item,
      );
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + toNumber(item.meal.price) * item.quantity,
        0,
      ),
    [items],
  );

  return (
    <CartContext.Provider
      value={{ items, count, total, addItem, removeItem, setQuantity, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}