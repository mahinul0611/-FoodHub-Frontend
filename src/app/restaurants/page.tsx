"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EmptyState, ErrorState, PageHeader, Spinner } from "@/components/ui";
import { api, asArray, getErrorMessage } from "@/lib/api";
import type { Meal } from "@/lib/types";

type Restaurant = {
  id: string;
  name: string;
  mealCount: number;
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const meals = asArray<Meal>(await api.get("/meals/?limit=1000"));
      const byId = new Map<string, Restaurant>();
      for (const meal of meals) {
        const id = meal.provider?.id;
        const name = meal.provider?.name;
        if (!id || !name) continue;
        const existing = byId.get(id);
        if (existing) {
          existing.mealCount += 1;
        } else {
          byId.set(id, { id, name, mealCount: 1 });
        }
      }
      setRestaurants(
        [...byId.values()].sort((a, b) => a.name.localeCompare(b.name)),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Restaurants"
        description="Browse meals by your favorite restaurants."
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : restaurants.length === 0 ? (
        <EmptyState
          icon={"\uD83C\uDFEA"}
          title="No restaurants yet"
          description="Restaurants will appear here once providers add meals."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/restaurants/${restaurant.id}`}
              className="group rounded-xl border border-neutral-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-2xl">
                {"\uD83C\uDFEA"}
              </span>
              <h2 className="mt-3 line-clamp-1 text-lg font-semibold text-neutral-900 group-hover:text-brand-700">
                {restaurant.name}
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                {restaurant.mealCount}{" "}
                {restaurant.mealCount === 1 ? "meal" : "meals"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}