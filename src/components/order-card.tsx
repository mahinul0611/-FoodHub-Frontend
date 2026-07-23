"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui";
import type { Order } from "@/lib/types";
import {
  formatDate,
  formatPrice,
  orderItems,
  orderTotal,
  statusBadgeClass,
  toNumber,
} from "@/lib/utils";

export function OrderCard({
  order,
  showCustomer = false,
  actions,
}: {
  order: Order;
  showCustomer?: boolean;
  actions?: ReactNode;
}) {
  const items = orderItems(order);
  const customer = order.user ?? order.customer;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            Order #{String(order.id).slice(0, 8)}
          </p>
          <p className="text-xs text-neutral-500">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge className={statusBadgeClass(order.status)}>
          {order.status ?? "PLACED"}
        </Badge>
      </div>

      {showCustomer && customer ? (
        <p className="mt-3 text-sm text-neutral-600">
          <span className="font-medium text-neutral-700">Customer:</span>{" "}
          {customer.name ?? customer.email ?? "Unknown"}
        </p>
      ) : null}

      {order.address || order.contactNumber ? (
        <p className="mt-1 text-sm text-neutral-600">
          {order.address ? (
            <>
              {"\uD83D\uDCCD"} {order.address}
            </>
          ) : null}
          {order.address && order.contactNumber ? " \u00B7 " : ""}
          {order.contactNumber ? (
            <>
              {"\uD83D\uDCDE"} {order.contactNumber}
            </>
          ) : null}
        </p>
      ) : null}

      {items.length > 0 ? (
        <ul className="mt-4 divide-y divide-neutral-100 border-t border-neutral-100">
          {items.map((item, index) => {
            const meal = item.meals ?? item.meal;
            const quantity = item.quantity ?? 1;
            const unit = toNumber(item.price ?? meal?.price);
            return (
              <li
                key={item.id ?? index}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <span className="text-neutral-700">
                  {meal?.name ?? "Meal"}{" "}
                  <span className="text-neutral-400">
                    {"\u00D7"} {quantity}
                  </span>
                </span>
                <span className="font-medium text-neutral-900">
                  {formatPrice(unit * quantity)}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="text-sm text-neutral-500">Total</span>
        <span className="text-base font-bold text-neutral-900">
          {formatPrice(orderTotal(order))}
        </span>
      </div>

      {actions ? (
        <div className="mt-4 border-t border-neutral-100 pt-4">{actions}</div>
      ) : null}
    </div>
  );
}
