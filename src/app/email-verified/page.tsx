"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function EmailVerifiedPage() {
  const { user, loading, refresh } = useAuth();

  useEffect(() => {
    // The verification link may have just signed the user in, so refresh
    // the session to pick up the new cookie.
    void refresh();
  }, [refresh]);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
          {"\u2705"}
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-neutral-900">
          Email verified!
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Your FoodHub account is ready to use.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {!loading && user ? (
            <Link
              href="/meals"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Browse meals
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Log in
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}