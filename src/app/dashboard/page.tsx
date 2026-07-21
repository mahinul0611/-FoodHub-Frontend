"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui";
import { api, asArray } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Order } from "@/lib/types";
import { formatDate, formatPrice, orderTotal, roleOf } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const payload = await api.get("/orders");
        if (!cancelled) setOrders(asArray<Order>(payload));
      } catch {
        // Stats are best-effort; the profile card still renders.
      } finally {
        if (!cancelled) setOrdersLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) return null;

  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const totalSpent = orders.reduce((sum, order) => sum + orderTotal(order), 0);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
            {initials}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-neutral-900">
                {user.name ?? "Customer"}
              </h2>
              <Badge className="border-brand-200 bg-brand-50 text-brand-700">
                {roleOf(user)}
              </Badge>
            </div>
            <p className="truncate text-sm text-neutral-500">{user.email}</p>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-neutral-500">Phone</dt>
            <dd className="mt-0.5 font-medium text-neutral-900">
              {user.phone ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Member since</dt>
            <dd className="mt-0.5 font-medium text-neutral-900">
              {formatDate(user.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Account status</dt>
            <dd className="mt-0.5 font-medium text-neutral-900">
              {typeof user.status === "string" ? user.status : "Active"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">Total orders</p>
          <p className="mt-1 text-3xl font-bold text-neutral-900">
            {ordersLoaded ? orders.length : "\u2026"}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">Total spent</p>
          <p className="mt-1 text-3xl font-bold text-neutral-900">
            {ordersLoaded ? formatPrice(totalSpent) : "\u2026"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/orders"
          className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-600 px-5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          View my orders
        </Link>
        <Link
          href="/meals"
          className="inline-flex min-h-[44px] items-center rounded-lg border border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          Order more food
        </Link>
      </div>
    </div>
  );
}
