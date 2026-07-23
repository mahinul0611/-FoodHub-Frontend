"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PaymentFailedContent() {
  const params = useSearchParams();
  const cancelled = params.get("reason") === "cancelled";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
        {"\u274C"}
      </div>
      <h1 className="mt-4 text-2xl font-bold text-neutral-900">
        {cancelled ? "Payment cancelled" : "Payment failed"}
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        {cancelled
          ? "You cancelled the payment, so the order was not completed."
          : "Something went wrong with the payment, so the order was not completed."}{" "}
        No money was charged. You can order again anytime.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/meals"
          className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-600 px-5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          Order again
        </Link>
        <Link
          href="/dashboard/orders"
          className="inline-flex min-h-[44px] items-center rounded-lg border border-neutral-200 px-5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          View my orders
        </Link>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailedContent />
    </Suspense>
  );
}