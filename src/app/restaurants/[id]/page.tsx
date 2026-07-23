"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MealCard } from "@/components/meal-card";
import { EmptyState, ErrorState, Spinner } from "@/components/ui";
import { api, asArray, getErrorMessage } from "@/lib/api";
import type { Meal } from "@/lib/types";
import { Pagination } from "@/components/pagination"; 

const PAGE_SIZE = 9; // Prottek page-e koyta meal dekhabe

export default function RestaurantDetailPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = typeof params?.id === "string" ? params.id : "";

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const allMeals = asArray<Meal>(await api.get("/meals/?limit=1000"));
      setMeals(allMeals.filter((meal) => meal.provider?.id === restaurantId));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(meals.length / PAGE_SIZE));

  const paginatedMeals = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return meals.slice(start, start + PAGE_SIZE);
  }, [meals, page]);

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restaurantName = meals[0]?.provider?.name ?? "Restaurant";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/restaurants"
        className="text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        {"\u2190"} All restaurants
      </Link>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : meals.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={"\uD83C\uDFEA"}
            title="No meals found"
            description="This restaurant has no meals available right now."
          />
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-3xl">
              {"\uD83C\uDFEA"}
            </span>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {restaurantName}
              </h1>
              <p className="text-sm text-neutral-500">
                {meals.length} {meals.length === 1 ? "meal" : "meals"} on the
                menu
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>

          {totalPages > 1 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}