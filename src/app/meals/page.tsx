"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MealCard } from "@/components/meal-card";
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Select,
  SkeletonCard,
} from "@/components/ui";
import { Pagination } from "@/components/pagination"; 
import { api, asArray, getErrorMessage } from "@/lib/api";
import { loadCategories } from "@/lib/categories";
import type { Category, Meal } from "@/lib/types";
import { toNumber } from "@/lib/utils";

type SortOption = "default" | "price-asc" | "price-desc" | "name";

const PAGE_SIZE = 9;

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sort, setSort] = useState<SortOption>("default");
  const [page, setPage] = useState(1);

  // Read the optional ?category= filter from the URL on first load.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get(
      "category",
    );
    if (fromUrl) setCategoryId(fromUrl);
  }, []);

  // Debounce the search input so we don't hit the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
      if (debouncedSearch) params.set("searchTerm", debouncedSearch);
      if (categoryId) params.set("categoryId", categoryId);

      const [mealsPayload, categoriesResult] = await Promise.all([
        api.get(`/meals/?${params.toString()}`),
        loadCategories(),
      ]);

      const list = asArray<Meal>(mealsPayload);
      const raw = mealsPayload as {
        meta?: { total?: number };
        data?: { meta?: { total?: number } };
      };
      const meta = raw?.data?.meta ?? raw?.meta;
      setMeals(list);
      setTotal(Number(meta?.total ?? list.length));
      setCategories(categoriesResult);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, categoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(() => {
    if (sort === "price-asc") {
      return [...meals].sort((a, b) => toNumber(a.price) - toNumber(b.price));
    }
    if (sort === "price-desc") {
      return [...meals].sort((a, b) => toNumber(b.price) - toNumber(a.price));
    }
    if (sort === "name") {
      return [...meals].sort((a, b) => a.name.localeCompare(b.name));
    }
    return meals;
  }, [meals, sort]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Browse meals"
        description="Fresh, homemade meals from local providers."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search meals…"
          aria-label="Search meals"
        />
        <Select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          aria-label="Sort meals"
        >
          <option value="default">Sort: Featured</option>
          <option value="price-asc">Price: Low to high</option>
          <option value="price-desc">Price: High to low</option>
          <option value="name">Name: A to Z</option>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No meals found"
          description={
            debouncedSearch || categoryId
              ? "Try a different search term or category filter."
              : "No meals are available right now. Please check back soon."
          }
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sorted.map((meal) => (
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