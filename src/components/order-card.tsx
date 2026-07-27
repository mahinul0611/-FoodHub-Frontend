"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui";
import { DELIVERY_CHARGE } from "@/lib/types"; // 🆕 ডেলিভারি চার্জ ইমপোর্ট করা হলো
import type { Order } from "@/lib/types";
import {
  formatDate,
  formatPrice,
  orderItems,
  orderTotal,
  statusBadgeClass,
  toNumber,
} from "@/lib/utils";

import { OrderTimeline } from "@/components/order-timeline";

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

  // 🆕 সাবটোটাল ক্যালকুলেট করা হচ্ছে (সবগুলো আইটেমের দামের যোগফল)
  const subtotal = items.reduce((sum, item) => {
    const meal = item.meals ?? item.meal;
    const quantity = item.quantity ?? 1;
    const unit = toNumber(item.price ?? meal?.price);
    return sum + unit * quantity;
  }, 0);

  // 🆕 ডেলিভারি চার্জ এবং ডিসকাউন্ট ক্যালকুলেট করা হচ্ছে
  const finalTotal = toNumber(orderTotal(order));
  // যদি ব্যাকএন্ড থেকে ডেলিভারি চার্জ না আসে, তবে ডিফল্ট DELIVERY_CHARGE ব্যবহার করবে
  const delivery = toNumber(order.deliveryCharge ?? DELIVERY_CHARGE);
  // Total = Subtotal + Delivery - Discount 
  // সুতরাং, Discount = Subtotal + Delivery - Total
  const calculatedDiscount = Math.max(0, subtotal + delivery - finalTotal);
  const discount = toNumber(order.discount ?? calculatedDiscount);

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
        <div className="flex flex-wrap items-center gap-2">
          {typeof order.paymentStatus === "string" && order.paymentStatus ? (
            <Badge className={statusBadgeClass(order.paymentStatus)}>
              {order.paymentStatus}
            </Badge>
          ) : null}
          <Badge className={statusBadgeClass(order.status)}>
            {order.status ?? "PLACED"}
          </Badge>
        </div>
        <OrderTimeline status={order.status} />
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
              {"📍"} {order.address}
            </>
          ) : null}
          {order.address && order.contactNumber ? " · " : ""}
          {order.contactNumber ? (
            <>
              {"📞"} {order.contactNumber}
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
                    {"×"} {quantity}
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

      {/* 🆕 নতুন যোগ করা Order Breakdown (Subtotal, Delivery, Discount) */}
      <dl className="mt-3 space-y-2 border-t border-neutral-100 pt-3 text-sm text-neutral-600">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd className="font-medium text-neutral-900">{formatPrice(subtotal)}</dd>
        </div>
        
        <div className="flex justify-between">
          <dt>Delivery charge</dt>
          <dd className="font-medium text-neutral-900">{formatPrice(delivery)}</dd>
        </div>

        {discount > 0 ? (
          <div className="flex justify-between text-green-700">
            <dt>Discount {order.couponCode ? `(${order.couponCode})` : ""}</dt>
            <dd className="font-medium">-{formatPrice(discount)}</dd>
          </div>
        ) : null}
      </dl>

      {/* Total Section (একটু বোল্ড করে দেওয়া হয়েছে) */}
      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="text-sm font-semibold text-neutral-900">Total</span>
        <span className="text-lg font-bold text-neutral-900">
          {formatPrice(finalTotal)}
        </span>
      </div>

      {actions ? (
        <div className="mt-4 border-t border-neutral-100 pt-4">{actions}</div>
      ) : null}
    </div>
  );
}