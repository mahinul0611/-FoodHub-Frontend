"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, asArray } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import type { Order } from "@/lib/types";
import { roleOf } from "@/lib/utils";

const POLL_INTERVAL_MS = 30_000;

const STATUS_LABELS: Record<string, string> = {
  PLACED: "placed",
  PREPARING: "being prepared",
  READY: "ready",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

function statusLabel(status: string): string {
  return STATUS_LABELS[status.toUpperCase()] ?? status.toLowerCase();
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function OrderNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const checkingRef = useRef(false);

  const userId = user && roleOf(user) === "USER" ? user.id : null;

  const check = useCallback(async () => {
    if (!userId || checkingRef.current) return;
    checkingRef.current = true;
    try {
      const payload = await api.get("/orders");
      const orders = asArray<Order>(payload);

      const statusKey = `foodhub-order-status-${userId}`;
      const promptedKey = `foodhub-review-prompted-${userId}`;
      const isFirstRun = localStorage.getItem(statusKey) === null;
      const known = readJson<Record<string, string>>(statusKey, {});
      const prompted = readJson<string[]>(promptedKey, []);

      const next: Record<string, string> = {};
      let promptedChanged = false;

      for (const order of orders) {
        const status = String(order.status ?? "").toUpperCase();
        next[order.id] = status;

        if (isFirstRun) {
          // Don't notify or prompt for anything that happened before this
          // feature started tracking; just remember the current state.
          if (status === "DELIVERED" && !prompted.includes(order.id)) {
            prompted.push(order.id);
            promptedChanged = true;
          }
          continue;
        }

        const previous = known[order.id];
        if (previous && previous !== status) {
          toast(
            `Your order #${order.id.slice(0, 8)} is now ${statusLabel(status)}.`,
            status === "CANCELLED" ? "error" : "success",
          );
        }

        if (status === "DELIVERED" && !prompted.includes(order.id)) {
          setReviewOrder((current) => current ?? order);
        }
      }

      localStorage.setItem(statusKey, JSON.stringify(next));
      if (promptedChanged) {
        localStorage.setItem(promptedKey, JSON.stringify(prompted));
      }
    } catch {
      // Polling is best-effort; ignore network hiccups.
    } finally {
      checkingRef.current = false;
    }
  }, [toast, userId]);

  useEffect(() => {
    setReviewOrder(null);
    if (!userId) return;
    void check();
    const interval = setInterval(() => void check(), POLL_INTERVAL_MS);
    const onFocus = () => void check();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [userId, check]);

  const dismiss = useCallback(() => {
    if (!reviewOrder || !userId) return;
    const promptedKey = `foodhub-review-prompted-${userId}`;
    const prompted = readJson<string[]>(promptedKey, []);
    if (!prompted.includes(reviewOrder.id)) {
      prompted.push(reviewOrder.id);
      localStorage.setItem(promptedKey, JSON.stringify(prompted));
    }
    setReviewOrder(null);
  }, [reviewOrder, userId]);

  if (!reviewOrder) return null;

  const items = reviewOrder.items ?? reviewOrder.orderItems ?? [];
  const first = items[0];
  const mealId =
    first?.mealsId ?? first?.mealId ?? first?.meals?.id ?? first?.meal?.id;
  const mealName = first?.meals?.name ?? first?.meal?.name;

  return (
    <div className="fixed bottom-4 right-4 z-[90] w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
      <p className="text-sm font-semibold text-neutral-900">
        Order delivered {"\uD83C\uDF89"}
      </p>
      <p className="mt-1 text-sm text-neutral-500">
        {mealName
          ? `Enjoyed ${mealName}? A quick review would mean a lot!`
          : "Enjoyed your meal? A quick review would mean a lot!"}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Link
          href={mealId ? `/meals/${mealId}` : "/dashboard/orders"}
          onClick={dismiss}
          className="inline-flex min-h-[36px] items-center justify-center rounded-lg bg-brand-600 px-3 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          Leave a review
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex min-h-[36px] items-center justify-center rounded-lg px-3 text-sm font-medium text-neutral-500 transition hover:bg-neutral-100"
        >
          Skip
        </button>
      </div>
    </div>
  );
}