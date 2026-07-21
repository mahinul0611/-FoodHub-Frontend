"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { isSoldOut, placeholderFor } from "@/components/meal-card";
import {
  Badge,
  Button,
  ErrorState,
  Field,
  FullPageLoader,
  StarRating,
  Textarea,
} from "@/components/ui";
import { api, getErrorMessage, unwrap } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import type { Meal, Review } from "@/lib/types";
import {
  formatDate,
  formatPrice,
  mealImage,
  roleOf,
  statusBadgeClass,
} from "@/lib/utils";
import { reviewSchema, zodFieldErrors } from "@/lib/validators";

function reviewRating(review: Review): number {
  const value = review.ratings ?? review.rating;
  return typeof value === "number" ? value : 0;
}

function ReviewForm({
  mealId,
  onSubmitted,
}: {
  mealId: string;
  onSubmitted: () => void;
}) {
  const { toast } = useToast();
  const [ratings, setRatings] = useState(0);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = reviewSchema.safeParse({ ratings, comment });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await api.post("/reviews", {
        ratings: parsed.data.ratings,
        mealsId: mealId,
        comment: parsed.data.comment,
      });
      toast("Thanks for your review!", "success");
      setRatings(0);
      setComment("");
      onSubmitted();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-neutral-200 bg-white p-5"
    >
      <h3 className="text-base font-semibold text-neutral-900">
        Write a review
      </h3>
      <div className="mt-3">
        <span className="mb-1.5 block text-sm font-medium text-neutral-700">
          Your rating
        </span>
        <StarRating value={ratings} onChange={setRatings} size="text-2xl" />
        {errors.ratings ? (
          <p className="mt-1 text-sm text-red-600">{errors.ratings}</p>
        ) : null}
      </div>
      <div className="mt-4">
        <Field label="Your comment" error={errors.comment}>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was the food?"
            aria-invalid={Boolean(errors.comment)}
          />
        </Field>
      </div>
      <Button type="submit" loading={submitting} className="mt-4">
        Submit review
      </Button>
    </form>
  );
}

export default function MealDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";

  const { user } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const payload = await api.get(`/meals/${id}`);
      const result = unwrap<Meal | null>(payload);
      if (!result || typeof result !== "object" || !result.id) {
        setError("This meal could not be found.");
        setMeal(null);
      } else {
        setMeal(result);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <FullPageLoader label="Loading meal…" />;
  }

  if (error || !meal) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <ErrorState message={error ?? "Meal not found."} onRetry={load} />
        <p className="mt-6 text-center">
          <Link
            href="/meals"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            {"\u2190"} Back to all meals
          </Link>
        </p>
      </div>
    );
  }

  const image = mealImage(meal);
  const soldOut = isSoldOut(meal);
  const reviews: Review[] = Array.isArray(meal.reviews) ? meal.reviews : [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + reviewRating(review), 0) /
        reviews.length
      : 0;
  const role = roleOf(user);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/meals"
        className="text-sm font-medium text-brand-600 hover:underline"
      >
        {"\u2190"} Back to all meals
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div className="flex h-72 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-gradient-to-br from-brand-50 to-amber-50 lg:h-96">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={meal.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-8xl" aria-hidden="true">
              {placeholderFor(meal.id)}
            </span>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {meal.category?.name ? (
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                {meal.category.name}
              </span>
            ) : null}
            {meal.status ? (
              <Badge className={statusBadgeClass(meal.status)}>
                {meal.status}
              </Badge>
            ) : null}
            {meal.isOnDiet ? (
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                Diet friendly
              </Badge>
            ) : null}
          </div>

          <h1 className="mt-2 text-3xl font-bold text-neutral-900">
            {meal.name}
          </h1>

          {reviews.length > 0 ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
              <StarRating value={Math.round(averageRating)} />
              <span>
                {averageRating.toFixed(1)} ({reviews.length} review
                {reviews.length === 1 ? "" : "s"})
              </span>
            </div>
          ) : null}

          <p className="mt-4 text-2xl font-bold text-neutral-900">
            {formatPrice(meal.price)}
          </p>

          {meal.description ? (
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              {meal.description}
            </p>
          ) : null}

          {typeof meal.quantity === "number" ? (
            <p className="mt-3 text-sm text-neutral-500">
              {meal.quantity > 0
                ? `${meal.quantity} portion${meal.quantity === 1 ? "" : "s"} available`
                : "Currently out of stock"}
            </p>
          ) : null}

          {meal.provider?.name ? (
            <p className="mt-1 text-sm text-neutral-500">
              Provided by{" "}
              <span className="font-medium text-neutral-700">
                {meal.provider.name}
              </span>
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-lg border border-neutral-300">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="min-h-[44px] min-w-[44px] text-lg text-neutral-600 transition hover:bg-neutral-50"
                aria-label="Decrease quantity"
              >
                {"\u2212"}
              </button>
              <span
                className="min-w-[44px] text-center text-sm font-semibold"
                aria-live="polite"
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                className="min-h-[44px] min-w-[44px] text-lg text-neutral-600 transition hover:bg-neutral-50"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <Button
              disabled={soldOut}
              onClick={() => {
                addItem(meal, quantity);
                toast(`${meal.name} added to cart`, "success");
              }}
            >
              {soldOut ? "Sold out" : "Add to cart"}
            </Button>
          </div>
        </div>
      </div>

      <section className="mt-14">
        <h2 className="text-xl font-bold text-neutral-900">Reviews</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center text-sm text-neutral-500">
                No reviews yet. Be the first to share your experience!
              </p>
            ) : (
              reviews.map((review, index) => (
                <div
                  key={review.id ?? index}
                  className="rounded-xl border border-neutral-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StarRating value={reviewRating(review)} size="text-sm" />
                      <span className="text-sm font-medium text-neutral-700">
                        {review.user?.name ?? "Customer"}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-400">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {review.comment ? (
                    <p className="mt-2 text-sm text-neutral-600">
                      {review.comment}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <div>
            {!user ? (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center">
                <p className="text-sm text-neutral-600">
                  Want to share your experience?
                </p>
                <Link
                  href="/login"
                  className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
                >
                  Log in to write a review
                </Link>
              </div>
            ) : role === "USER" ? (
              <ReviewForm mealId={meal.id} onSubmitted={load} />
            ) : (
              <p className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
                Reviews can be written from a customer account.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
