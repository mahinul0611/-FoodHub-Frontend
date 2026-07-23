"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { api, getErrorMessage } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { Order } from "@/lib/types";

export function CancelOrderButton({
  order,
  onCancelled,
}: {
  order: Order;
  onCancelled?: () => void;
}) {
  const { toast } = useToast();
  const [cancelling, setCancelling] = useState(false);

  const status = (order.status ?? "").toUpperCase();
  if (status !== "PLACED") return null;

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }
    setCancelling(true);
    try {
      await api.patch(`/orders/${order.id}/cancel`, {});
      toast("Order cancelled.", "success");
      if (onCancelled) {
        onCancelled();
      } else {
        window.location.reload();
      }
    } catch (err) {
      toast(getErrorMessage(err), "error");
      setCancelling(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="danger" loading={cancelling} onClick={handleCancel}>
        Cancel order
      </Button>
      {(order.paymentStatus ?? "").toUpperCase() === "PAID" ? (
        <span className="text-xs text-neutral-500">
          Paid online {"\u2014"} your refund will be processed after
          cancellation.
        </span>
      ) : null}
    </div>
  );
}