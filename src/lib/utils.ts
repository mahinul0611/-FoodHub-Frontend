import type { AppUser, Order, OrderItem } from "./types";

/**
 * Coerces API values into numbers. Some backends serialize numeric fields
 * (e.g. Prisma Decimal prices) as strings, so `"250"` must count as 250.
 */
export function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function formatPrice(value: number | string | null | undefined): string {
  const n = toNumber(value);
  return `\u09F3${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function formatDate(value?: string): string {
  if (!value) return "\u2014";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "\u2014";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function roleOf(user: AppUser | null | undefined): string {
  return String(user?.role ?? "").toUpperCase();
}

export function statusBadgeClass(status?: string): string {
  const s = (status ?? "").toUpperCase();
  if (
    [
      "DELIVERED",
      "AVAILABLE",
      "ACTIVE",
      "ACTIVATE",
      "COMPLETED",
      "READY",
      "RESOLVED",
    ].includes(s)
  ) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (
    ["CANCELLED", "BLOCKED", "SUSPEND", "UNAVAILABLE", "REJECTED"].includes(s)
  ) {
    return "bg-red-50 text-red-700 border-red-200";
  }
  if (["PREPARING", "IN_REVIEW"].includes(s)) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export function mealImage(meal: {
  image?: string | null;
  imageUrl?: string | null;
}): string | null {
  const src = meal.imageUrl || meal.image;
  return typeof src === "string" && /^https?:\/\//.test(src) ? src : null;
}

export function orderItems(order: Order): OrderItem[] {
  return order.items ?? order.orderItems ?? [];
}

export function orderTotal(order: Order): number {
  const direct = toNumber(order.totalPrice ?? order.total);
  if (direct > 0) return direct;
  return orderItems(order).reduce((sum, item) => {
    const unit = toNumber(item.price ?? item.meals?.price ?? item.meal?.price);
    return sum + unit * toNumber(item.quantity ?? 1);
  }, 0);
}

/** Turns camelCase / snake_case keys into a human readable label. */
export function prettifyKey(key: string): string {
  const spaced = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .trim()
    .toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
