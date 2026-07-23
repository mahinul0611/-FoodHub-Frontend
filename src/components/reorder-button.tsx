"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { api, asArray, getErrorMessage } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import type { Meal, Order } from "@/lib/types";

type ReorderItem = {
  mealsId?: string;
  quantity?: number;
  meals?: { name?: string } | null;
};

export function ReorderButton({ order }: { order: Order }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleReorder = async () => {
    setLoading(true);
    try {
      const orderItems = (order.orderItems ?? []) as unknown as ReorderItem[];
      if (orderItems.length === 0) {
        throw new Error("This order has no items to reorder.");
      }

      const meals = asArray<Meal>(await api.get("/meals/"));
      const mealById = new Map(meals.map((meal) => [meal.id, meal]));

      let added = 0;
      let skipped = 0;
      for (const item of orderItems) {
        const meal = item.mealsId ? mealById.get(item.mealsId) : undefined;
        const unavailable =
          !meal ||
          ["UNAVAILABLE", "STOCKOUT"].includes(
            (meal.status ?? "").toUpperCase(),
          );
        if (unavailable) {
          skipped += 1;
          continue;
        }
        addItem(meal, item.quantity && item.quantity > 0 ? item.quantity : 1);
        added += 1;
      }

      if (added === 0) {
        throw new Error(
          "None of the items from this order are available right now.",
        );
      }
      if (skipped > 0) {
        toast(
          `${added} item(s) added to cart. ${skipped} item(s) are no longer available.`,
          "success",
        );
      } else {
        toast("All items added to your cart!", "success");
      }
      router.push("/cart");
    } catch (err) {
      toast(getErrorMessage(err), "error");
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" loading={loading} onClick={handleReorder}>
      Order again
    </Button>
  );
}