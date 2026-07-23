"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from "@/components/ui";
import { api, asArray, getErrorMessage } from "@/lib/api";
import type { Meal } from "@/lib/types";

type Restaurant = {
  id: string;
  name: string;
  mealCount: number;
};

const PAGE_SIZE = 9; // Prottek page-e koyta restaurant dekhabe

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(restaurants.length / PAGE_SIZE));

  const paginatedRestaurants = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return restaurants.slice(start, start + PAGE_SIZE);
  }, [restaurants, page]);

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedRestaurants.map((restaurant) => (
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
        </>
      )}
    </div>
  );
}
