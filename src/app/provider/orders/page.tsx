// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { OrderCard } from "@/components/order-card";
// import {
//   Button,
//   EmptyState,
//   ErrorState,
//   Select,
//   Spinner,
// } from "@/components/ui";
// import { api, asArray, getErrorMessage } from "@/lib/api";
// import { useToast } from "@/lib/toast-context";
// import { ORDER_STATUSES, type Order } from "@/lib/types";

// function OrderStatusUpdater({
//   order,
//   onUpdated,
// }: {
//   order: Order;
//   onUpdated: (status: string) => void;
// }) {
//   const { toast } = useToast();
//   const [status, setStatus] = useState(order.status ?? ORDER_STATUSES[0]);
//   const [saving, setSaving] = useState(false);

//   const options = Array.from(
//     new Set([...ORDER_STATUSES, order.status].filter(Boolean)),
//   ) as string[];

//   const handleUpdate = async () => {
//     setSaving(true);
//     try {
//       await api.patch(`/provider/orders/${order.id}`, { status });
//       toast("Order status updated", "success");
//       onUpdated(status);
//     } catch (err) {
//       toast(getErrorMessage(err), "error");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="flex items-center gap-2">
//       <Select
//         value={status}
//         onChange={(e) => setStatus(e.target.value)}
//         aria-label="Order status"
//         className="min-w-[140px]"
//       >
//         {options.map((option) => (
//           <option key={option} value={option}>
//             {option}
//           </option>
//         ))}
//       </Select>
//       <Button
//         variant="secondary"
//         loading={saving}
//         disabled={status === order.status}
//         onClick={handleUpdate}
//       >
//         Update
//       </Button>
//     </div>
//   );
// }

// export default function ProviderOrdersPage() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       // Incoming orders for a provider may be exposed on different routes
//       // depending on the backend, so try the provider-specific endpoints
//       // first and fall back to the generic /orders route.
//       const endpoints = ["/provider/orders", "/provider", "/orders"];
//       let list: Order[] = [];
//       let succeeded = false;
//       let lastError: unknown = null;

//       for (const endpoint of endpoints) {
//         try {
//           const payload = await api.get(endpoint);
//           succeeded = true;
//           list = asArray<Order>(payload);
//           if (list.length > 0) break;
//         } catch (err) {
//           lastError = err;
//         }
//       }
//       if (!succeeded) {
//         throw lastError ?? new Error("Failed to load orders");
//       }
//       setOrders(list);
//     } catch (err) {
//       setError(getErrorMessage(err));
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     void load();
//   }, [load]);

//   if (loading) {
//     return (
//       <div className="flex justify-center py-16">
//         <Spinner />
//       </div>
//     );
//   }

//   if (error) {
//     return <ErrorState message={error} onRetry={load} />;
//   }

//   if (orders.length === 0) {
//     return (
//       <EmptyState
//         icon={"\uD83D\uDCE6"}
//         title="No orders yet"
//         description="Orders for your meals will show up here."
//       />
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {orders.map((order, index) => (
//         <OrderCard
//           key={order.id ?? index}
//           order={order}
//           showCustomer
//           actions={
//             order.id ? (
//               <OrderStatusUpdater
//                 order={order}
//                 onUpdated={(status) =>
//                   setOrders((current) =>
//                     current.map((o) =>
//                       o.id === order.id ? { ...o, status } : o,
//                     ),
//                   )
//                 }
//               />
//             ) : undefined
//           }
//         />
//       ))}
//     </div>
//   );
// }



"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { OrderCard } from "@/components/order-card";
import {
  Button,
  EmptyState,
  ErrorState,
  Select,
  Spinner,
} from "@/components/ui";
import { api, asArray, getErrorMessage } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { ORDER_STATUSES, type Order } from "@/lib/types";

const PAGE_SIZE = 5; // Prottek page-e 5 ta kore order dekhabe (karon order card gulo boro hoy)

function OrderStatusUpdater({
  order,
  onUpdated,
}: {
  order: Order;
  onUpdated: (status: string) => void;
}) {
  const { toast } = useToast();
  const [status, setStatus] = useState(order.status ?? ORDER_STATUSES[0]);
  const [saving, setSaving] = useState(false);

  const options = Array.from(
    new Set([...ORDER_STATUSES, order.status].filter(Boolean)),
  ) as string[];

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.patch(`/provider/orders/${order.id}`, { status });
      toast("Order status updated", "success");
      onUpdated(status);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        aria-label="Order status"
        className="min-w-[140px]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      <Button
        variant="secondary"
        loading={saving}
        disabled={status === order.status}
        onClick={handleUpdate}
      >
        Update
      </Button>
    </div>
  );
}

export default function ProviderOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoints = ["/provider/orders", "/provider", "/orders"];
      let list: Order[] = [];
      let succeeded = false;
      let lastError: unknown = null;

      for (const endpoint of endpoints) {
        try {
          const payload = await api.get(endpoint);
          succeeded = true;
          list = asArray<Order>(payload);
          if (list.length > 0) break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!succeeded) {
        throw lastError ?? new Error("Failed to load orders");
      }
      setOrders(list);
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
        description="Orders for your meals will show up here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {paginatedOrders.map((order, index) => (
        <OrderCard
          key={order.id ?? index}
          order={order}
          showCustomer
          actions={
            order.id ? (
              <OrderStatusUpdater
                order={order}
                onUpdated={(status) =>
                  setOrders((current) =>
                    current.map((o) =>
                      o.id === order.id ? { ...o, status } : o,
                    ),
                  )
                }
              />
            ) : undefined
          }
        />
      ))}

      {totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            {"\u2190"} Previous
          </Button>
          <span className="text-sm font-medium text-neutral-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Next {"\u2192"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}