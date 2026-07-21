"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { OrderCard } from "@/components/order-card";
import { EmptyState, ErrorState, Spinner } from "@/components/ui";
import { api, asArray, getErrorMessage } from "@/lib/api";
import type { Order } from "@/lib/types";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await api.get("/orders");
      setOrders(asArray<Order>(payload));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={"\uD83D\uDCE6"}
        title="No orders yet"
        description="When you place an order, it will show up here."
        action={
          <Link
            href="/meals"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-600 px-5 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Browse meals
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <OrderCard key={order.id ?? index} order={order} />
      ))}
    </div>
  );
}
