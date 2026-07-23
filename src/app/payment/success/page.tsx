"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PaymentSuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
        {"\u2705"}
      </div>
      <h1 className="mt-4 text-2xl font-bold text-neutral-900">
        Payment successful!
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        {orderId
          ? `Your payment for order #${orderId.slice(0, 8)} has been received.`
          : "Your payment has been received."}{" "}
        We{"\u2019"}re getting your food ready.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/dashboard/orders"
          className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-600 px-5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          View my orders
        </Link>
        <Link
          href="/meals"
          className="inline-flex min-h-[44px] items-center rounded-lg border border-neutral-200 px-5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          Browse meals
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessContent />
    </Suspense>
  );
}