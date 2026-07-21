"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MealCard } from "@/components/meal-card";
import {
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Select,
  SkeletonCard,
} from "@/components/ui";
import { api, asArray, getErrorMessage } from "@/lib/api";
import { loadCategories } from "@/lib/categories";
import type { Category, Meal } from "@/lib/types";
import { toNumber } from "@/lib/utils";

type SortOption = "default" | "price-asc" | "price-desc" | "name";

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sort, setSort] = useState<SortOption>("default");

  // Read the optional ?category= filter from the URL on first load.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("category");
    if (fromUrl) setCategoryId(fromUrl);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mealsPayload, categoriesResult] = await Promise.all([
        api.get("/meals/"),
        loadCategories(),
      ]);
      setMeals(asArray<Meal>(mealsPayload));
      setCategories(categoriesResult);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = meals.filter((meal) => {
      const matchesSearch =
        !term ||
        meal.name.toLowerCase().includes(term) ||
        (meal.description ?? "").toLowerCase().includes(term);
      const mealCategory = meal.categoryId ?? meal.category?.id ?? "";
      const matchesCategory = !categoryId || mealCategory === categoryId;
      return matchesSearch && matchesCategory;
    });

    if (sort === "price-asc") {
      result = [...result].sort(
        (a, b) => toNumber(a.price) - toNumber(b.price),
      );
    } else if (sort === "price-desc") {
      result = [...result].sort(
        (a, b) => toNumber(b.price) - toNumber(a.price),
      );
    } else if (sort === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [meals, search, categoryId, sort]);

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
          onChange={(e) => setCategoryId(e.target.value)}
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
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No meals found"
          description={
            meals.length === 0
              ? "No meals are available right now. Please check back soon."
              : "Try a different search term or category filter."
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}
    </div>
  );
}
