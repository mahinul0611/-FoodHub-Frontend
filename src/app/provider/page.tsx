"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, asArray, unwrap } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Meal, Order } from "@/lib/types";
import { prettifyKey } from "@/lib/utils";

type ProviderInfo = Record<string, unknown> | null;

function ownsMeal(meal: Meal, ids: Set<string>): boolean {
  const candidates = [
    meal.providerId,
    meal.provider?.id,
    meal.provider?.userId,
  ];
  return candidates.some(
    (value) => typeof value === "string" && ids.has(value),
  );
}

export default function ProviderOverviewPage() {
  const { user } = useAuth();
  const [provider, setProvider] = useState<ProviderInfo>(null);
  const [mealCount, setMealCount] = useState<number | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      let providerPayload: ProviderInfo = null;
      try {
        const raw = unwrap<unknown>(await api.get("/provider"));
        if (raw && typeof raw === "object" && !Array.isArray(raw)) {
          providerPayload = raw as Record<string, unknown>;
        }
      } catch {
        // Provider info is best-effort.
      }
      if (!cancelled) setProvider(providerPayload);

      try {
        const meals = asArray<Meal>(await api.get("/meals/?limit=1000"));
        const ids = new Set<string>([user.id]);
        for (const key of ["id", "userId", "providerId"]) {
          const value = providerPayload?.[key];
          if (typeof value === "string") ids.add(value);
        }
        const embedded = providerPayload?.meals;
        if (!cancelled) {
          setMealCount(
            Array.isArray(embedded)
              ? embedded.length
              : meals.filter((meal) => ownsMeal(meal, ids)).length,
          );
        }
      } catch {
        if (!cancelled) setMealCount(null);
      }

      try {
        const orders = asArray<Order>(await api.get("/provider/orders"));
        if (!cancelled) setOrderCount(orders.length);
      } catch {
        if (!cancelled) setOrderCount(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const infoEntries = provider
    ? Object.entries(provider).filter(
        ([, value]) => typeof value === "string" || typeof value === "number",
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">My meals</p>
          <p className="mt-1 text-3xl font-bold text-neutral-900">
            {mealCount ?? "\u2014"}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">Orders received</p>
          <p className="mt-1 text-3xl font-bold text-neutral-900">
            {orderCount ?? "\u2014"}
          </p>
        </div>
      </div>

      {infoEntries.length > 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-base font-semibold text-neutral-900">
            Provider details
          </h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            {infoEntries.slice(0, 8).map(([key, value]) => (
              <div key={key}>
                <dt className="text-neutral-500">{prettifyKey(key)}</dt>
                <dd className="mt-0.5 break-words font-medium text-neutral-900">
                  {String(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/provider/meals/new"
          className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-600 px-5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          + Add a new meal
        </Link>
        <Link
          href="/provider/orders"
          className="inline-flex min-h-[44px] items-center rounded-lg border border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          Manage orders
        </Link>
      </div>
    </div>
  );
}
