"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MealCard } from "@/components/meal-card";
import { ErrorState, SkeletonCard } from "@/components/ui";
import { api, asArray, getErrorMessage } from "@/lib/api";
import { loadCategories } from "@/lib/categories";
import type { Category, Meal } from "@/lib/types";

// Default coordinates (Dhaka) if user blocks location
const DEFAULT_LAT = 23.8103;
const DEFAULT_LNG = 90.4125;

const HOW_IT_WORKS = [
  {
    icon: "\uD83D\uDD0D",
    title: "Browse meals",
    description:
      "Explore fresh, homemade meals from verified local providers near you.",
  },
  {
    icon: "\uD83D\uDED2",
    title: "Place your order",
    description:
      "Add your favorites to the cart and check out with your delivery address.",
  },
  {
    icon: "\uD83D\uDEF5",
    title: "Get it delivered",
    description:
      "Track your order status while the provider prepares and delivers it hot.",
  },
];

const VALUE_PROPS = [
  {
    icon: "\uD83E\uDD57",
    title: "Fresh & homemade",
    description: "Every meal is cooked to order by real home chefs.",
  },
  {
    icon: "\u2705",
    title: "Trusted providers",
    description: "Providers are verified and reviewed by the community.",
  },
  {
    icon: "\u26A1",
    title: "Fast checkout",
    description: "Order in seconds and pay on delivery, hassle free.",
  },
  {
    icon: "\u2B50",
    title: "Honest reviews",
    description: "Real ratings from real customers guide every choice.",
  },
];

export default function HomePage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Nearby restaurants states
  const [nearbyRestaurants, setNearbyRestaurants] = useState<any[]>([]);
  const [locationLoading, setLocationLoading] = useState(true);
  const [isDefaultLocation, setIsDefaultLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

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

  const loadNearby = useCallback(async (lat: number, lng: number) => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      const payload = await api.get(
        `/provider/nearby?lat=${lat}&lng=${lng}&radius=15`,
      );
      const data = (payload as any)?.data ?? payload;
      setNearbyRestaurants(asArray<any>(data));
    } catch (err) {
      setLocationError(getErrorMessage(err));
    } finally {
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Auto-detect user geolocation, fallback to Dhaka if blocked/unsupported
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsDefaultLocation(false);
          void loadNearby(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          // Fallback to default location (Dhaka) if permission denied
          setIsDefaultLocation(true);
          void loadNearby(DEFAULT_LAT, DEFAULT_LNG);
        },
      );
    } else {
      // Fallback if not supported
      setIsDefaultLocation(true);
      void loadNearby(DEFAULT_LAT, DEFAULT_LNG);
    }
  }, [loadNearby]);

  const featured = meals.slice(0, 8);

  return (
    <div>
      {/* Section 1: Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-700">
              {"\uD83C\uDF5C"} Homemade food marketplace
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-neutral-900 md:text-5xl">
              Fresh, homemade meals{" "}
              <span className="text-brand-600">delivered to you</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-neutral-600">
              FoodHub connects you with trusted local meal providers. Browse the
              menu, order in seconds, and enjoy food made with care.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/meals"
                className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Browse meals
              </Link>
              <Link
                href="/register"
                className="inline-flex min-h-[44px] items-center rounded-lg border border-neutral-300 bg-white px-6 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                Become a provider
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4" aria-hidden="true">
            {[
              { emoji: "\uD83C\uDF5B", label: "Biriyani & rice" },
              { emoji: "\uD83E\uDD58", label: "Curries" },
              { emoji: "\uD83E\uDD57", label: "Healthy bowls" },
              { emoji: "\uD83C\uDF70", label: "Desserts" },
            ].map((tile) => (
              <div
                key={tile.label}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-brand-100 bg-white p-8 text-center shadow-sm"
              >
                <span className="text-4xl">{tile.emoji}</span>
                <span className="text-sm font-medium text-neutral-600">
                  {tile.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Categories */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              Browse by category
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Find exactly what you are craving.
            </p>
          </div>
          <Link
            href="/meals"
            className="whitespace-nowrap text-sm font-medium text-brand-600 hover:underline"
          >
            View all {"\u2192"}
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="h-10 w-28 animate-pulse rounded-full bg-neutral-100"
              />
            ))
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category.id}
                href={`/meals?category=${encodeURIComponent(category.id)}`}
                className="inline-flex min-h-[44px] items-center rounded-full border border-neutral-200 bg-white px-5 text-sm font-medium text-neutral-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {category.name}
              </Link>
            ))
          ) : (
            <p className="text-sm text-neutral-500">
              Categories will appear here soon. Meanwhile,{" "}
              <Link href="/meals" className="text-brand-600 hover:underline">
                browse all meals
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      {/* Section 2.5: Restaurants Near You (Aesthetic Foodpanda Style) */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              Restaurants near you 📍
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {isDefaultLocation 
                ? "Showing popular kitchens in Dhaka (Enable location for exact tracking)" 
                : "Homemade kitchens near your current location."}
            </p>
          </div>
        </div>
        <div className="mt-6">
          {locationLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-neutral-100 border border-neutral-200" />
              ))}
            </div>
          ) : locationError ? (
            <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-8 text-center text-sm text-neutral-500">
              {locationError}
            </p>
          ) : nearbyRestaurants.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-8 text-center text-sm text-neutral-500">
              No restaurants found nearby right now.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {nearbyRestaurants.map((restaurant, index) => {
                const gradients = [
                  "from-orange-500 to-amber-500",
                  "from-rose-500 to-pink-500",
                  "from-emerald-500 to-teal-500",
                  "from-violet-500 to-purple-500",
                  "from-blue-500 to-cyan-500",
                ];
                const gradient = gradients[index % gradients.length];

                return (
                  <Link
                    key={restaurant.id}
                    href={`/meals?providerId=${restaurant.id}`}
                    className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-300"
                  >
                    <div className={`relative h-36 w-full bg-gradient-to-r ${gradient} p-4 flex flex-col justify-between`}>
                      <div className="flex justify-between items-center">
                        <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-neutral-800 shadow-sm">
                          📍 {Number(restaurant.distance).toFixed(1)} km away
                        </span>
                        <span className="rounded-full bg-black/30 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-white">
                          ⭐ 4.8 (Verified)
                        </span>
                      </div>
                      <div className="text-white">
                        <span className="text-xs uppercase tracking-wider font-bold opacity-90">Homemade Kitchen</span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-lg text-neutral-900 group-hover:text-brand-600 transition-colors">
                        {restaurant.name}
                      </h3>
                      <p className="text-sm text-neutral-500 mt-1 truncate">
                        Delicious Food!
                      </p>

                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                          Open & Delivering
                        </span>
                        <span className="text-sm font-semibold text-brand-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          View menu {"\u2192"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Featured meals */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Featured meals
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Popular picks from our providers.
              </p>
            </div>
            <Link
              href="/meals"
              className="whitespace-nowrap text-sm font-medium text-brand-600 hover:underline"
            >
              View all {"\u2192"}
            </Link>
          </div>
          <div className="mt-6">
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <ErrorState message={error} onRetry={load} />
            ) : featured.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center text-sm text-neutral-500">
                No meals available right now. Please check back soon!
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((meal) => (
                  <MealCard key={meal.id} meal={meal} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 4: How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold text-neutral-900">
          How FoodHub works
        </h2>
        <p className="mt-1 text-center text-sm text-neutral-500">
          From craving to doorstep in three simple steps.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS.map((step, index) => (
            <div
              key={step.title}
              className="rounded-xl border border-neutral-200 bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-xl">
                  {step.icon}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Step {index + 1}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-neutral-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: Why FoodHub */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-center text-2xl font-bold text-neutral-900">
            Why people love FoodHub
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map((prop) => (
              <div
                key={prop.title}
                className="rounded-xl border border-neutral-200 bg-white p-6 text-center"
              >
                <span className="text-3xl" aria-hidden="true">
                  {prop.icon}
                </span>
                <h3 className="mt-3 text-base font-semibold text-neutral-900">
                  {prop.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-500">
                  {prop.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: CTA */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-12 text-center md:px-12">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Cook great food? Join FoodHub as a provider.
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-brand-50">
            Reach hungry customers in your area, manage your menu, and grow your
            kitchen business {"\u2014"} all from one dashboard.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-white px-6 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Start selling today
          </Link>
        </div>
      </section>
    </div>
  );
}