"use client";

import Link from "next/link";
import { Badge } from "@/components/ui";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import type { Meal } from "@/lib/types";
import { formatPrice, mealImage, statusBadgeClass } from "@/lib/utils";

const PLACEHOLDER_EMOJI = [
  "\uD83C\uDF5B",
  "\uD83C\uDF5C",
  "\uD83C\uDF55",
  "\uD83E\uDD57",
  "\uD83C\uDF71",
  "\uD83C\uDF54",
  "\uD83E\uDD58",
  "\uD83C\uDF70",
];

export function placeholderFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 997;
  }
  return PLACEHOLDER_EMOJI[hash % PLACEHOLDER_EMOJI.length];
}

export function isSoldOut(meal: Meal): boolean {
  return (
    (meal.status ?? "").toUpperCase() === "UNAVAILABLE" ||
    (typeof meal.quantity === "number" && meal.quantity <= 0)
  );
}

export function MealCard({ meal }: { meal: Meal }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const image = mealImage(meal);
  const soldOut = isSoldOut(meal);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:shadow-md">
      <Link href={`/meals/${meal.id}`} className="block">
        <div className="flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 to-amber-50">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={meal.name}
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          ) : (
            <span className="text-5xl" aria-hidden="true">
              {placeholderFor(meal.id)}
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/meals/${meal.id}`}
            className="line-clamp-1 font-semibold text-neutral-900 hover:text-brand-700"
          >
            {meal.name}
          </Link>
          {soldOut ? (
            <Badge className={statusBadgeClass("UNAVAILABLE")}>Sold out</Badge>
          ) : null}
        </div>
        {meal.category?.name ? (
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
            {meal.category.name}
          </p>
        ) : null}
        {meal.description ? (
          <p className="line-clamp-2 text-sm text-neutral-500">
            {meal.description}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-base font-bold text-neutral-900">
            {formatPrice(meal.price)}
          </span>
          <button
            onClick={() => {
              addItem(meal);
              toast(`${meal.name} added to cart`, "success");
            }}
            disabled={soldOut}
            className="min-h-[40px] rounded-lg bg-brand-600 px-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
