
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { OrderCard } from "@/components/order-card";
import { EmptyState, ErrorState, Spinner } from "@/components/ui";
import { api, asArray, getErrorMessage } from "@/lib/api";
import type { Order } from "@/lib/types";
import { Pagination } from "@/components/pagination";

const PAGE_SIZE = 10;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await api.get("/admin/orders");
      const ordersData = (payload as any)?.result ?? payload;
      setOrders(asArray<Order>(ordersData));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return orders.slice(start, start + PAGE_SIZE);
  }, [orders, page]);

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        description="All platform orders will appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {paginatedOrders.map((order, index) => (
          <OrderCard key={order.id ?? index} order={order} showCustomer />
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="pt-2">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>
      ) : null}
    </div>
  );
}

