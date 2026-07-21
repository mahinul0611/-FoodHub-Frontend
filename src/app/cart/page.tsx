"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { placeholderFor } from "@/components/meal-card";
import { Button, EmptyState, PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { formatPrice, mealImage, toNumber } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { items, total, setQuantity, removeItem } = useCart();

  const handleCheckout = () => {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    router.push("/checkout");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader
        title="Your cart"
        description="Review your items before checking out."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={"\uD83D\uDED2"}
          title="Your cart is empty"
          description="Browse our meals and add something delicious."
          action={
            <Link
              href="/meals"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-600 px-5 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Browse meals
            </Link>
          }
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <ul className="space-y-4">
            {items.map((item) => {
              const image = mealImage(item.meal);
              return (
                <li
                  key={item.meal.id}
                  className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4"
                >
                  <Link
                    href={`/meals/${item.meal.id}`}
                    className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-brand-50 to-amber-50"
                  >
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt={item.meal.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl" aria-hidden="true">
                        {placeholderFor(item.meal.id)}
                      </span>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/meals/${item.meal.id}`}
                        className="line-clamp-1 font-semibold text-neutral-900 hover:text-brand-700"
                      >
                        {item.meal.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.meal.id)}
                        className="rounded p-1 text-sm text-neutral-400 transition hover:text-red-600"
                        aria-label={`Remove ${item.meal.name} from cart`}
                      >
                        {"\u2715"}
                      </button>
                    </div>
                    <p className="text-sm text-neutral-500">
                      {formatPrice(item.meal.price)} each
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                      <div className="inline-flex items-center rounded-lg border border-neutral-300">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.meal.id, item.quantity - 1)
                          }
                          className="min-h-[40px] min-w-[40px] text-neutral-600 transition hover:bg-neutral-50"
                          aria-label={`Decrease quantity of ${item.meal.name}`}
                        >
                          {"\u2212"}
                        </button>
                        <span className="min-w-[36px] text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.meal.id, item.quantity + 1)
                          }
                          className="min-h-[40px] min-w-[40px] text-neutral-600 transition hover:bg-neutral-50"
                          aria-label={`Increase quantity of ${item.meal.name}`}
                        >
                          +
                        </button>
                      </div>
                      <span className="font-semibold text-neutral-900">
                        {formatPrice(toNumber(item.meal.price) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="text-base font-semibold text-neutral-900">
              Order summary
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Subtotal</dt>
                <dd className="font-medium text-neutral-900">
                  {formatPrice(total)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Delivery</dt>
                <dd className="text-neutral-500">Calculated at delivery</dd>
              </div>
            </dl>
            <div className="mt-4 flex justify-between border-t border-neutral-100 pt-4">
              <span className="text-sm font-semibold text-neutral-900">
                Total
              </span>
              <span className="text-lg font-bold text-neutral-900">
                {formatPrice(total)}
              </span>
            </div>
            <Button
              className="mt-5 w-full"
              onClick={handleCheckout}
              disabled={loading}
            >
              {user ? "Proceed to checkout" : "Log in to checkout"}
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
