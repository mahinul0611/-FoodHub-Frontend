"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { RequireAuth } from "@/components/require-auth";
import {
  Button,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Textarea,
} from "@/components/ui";
import { api, getErrorMessage } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { formatPrice, toNumber } from "@/lib/utils";
import { checkoutSchema, zodFieldErrors } from "@/lib/validators";

function CheckoutContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { items, total, clear } = useCart();
  const { toast } = useToast();

  const [form, setForm] = useState({ address: "", contactNumber: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

const phoneUnverified = user?.phoneVerified === false

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <EmptyState
          icon={"\uD83D\uDED2"}
          title="Nothing to check out"
          description="Your cart is empty. Add some meals first."
          action={
            <Link
              href="/meals"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-600 px-5 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Browse meals
            </Link>
          }
        />
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      await api.post("/orders", {
        address: parsed.data.address,
        contactNumber: parsed.data.contactNumber,
        items: items.map((item) => ({
          mealsId: item.meal.id,
          quantity: item.quantity,
        })),
      });
      clear();
      toast("Order placed successfully!", "success");
      router.push("/dashboard/orders");
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader
        title="Checkout"
        description="Confirm your delivery details to place the order."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
        >
          {phoneUnverified ? (
  <div
    role="alert"
    className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
  >
    Your phone number is not verified yet. Please{" "}
    <Link href="/me" className="font-semibold underline">
      verify your phone number
    </Link>{" "}
    before placing an order.
  </div>
) : null}

          {formError ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {formError}
            </div>
          ) : null}

          <Field label="Delivery address" error={errors.address}>
            <Textarea
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              placeholder="e.g. House 12, Road 5, Dhanmondi, Dhaka"
              aria-invalid={Boolean(errors.address)}
            />
          </Field>

          <Field label="Contact number" error={errors.contactNumber}>
            <Input
              type="tel"
              autoComplete="tel"
              value={form.contactNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, contactNumber: e.target.value }))
              }
              placeholder="e.g. 01712345678"
              aria-invalid={Boolean(errors.contactNumber)}
            />
          </Field>

          <Button 
          type="submit" 
          loading={submitting}
          disabled={phoneUnverified}
           className="w-full">
            Place order {"\u00B7"} {formatPrice(total)}
          </Button>
        </form>

        <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-base font-semibold text-neutral-900">
            Your items
          </h2>
          <ul className="mt-3 divide-y divide-neutral-100">
            {items.map((item) => (
              <li
                key={item.meal.id}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <span className="text-neutral-700">
                  {item.meal.name}{" "}
                  <span className="text-neutral-400">
                    {"\u00D7"} {item.quantity}
                  </span>
                </span>
                <span className="font-medium text-neutral-900">
                  {formatPrice(toNumber(item.meal.price) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-neutral-100 pt-3">
            <span className="text-sm font-semibold text-neutral-900">
              Total
            </span>
            <span className="text-lg font-bold text-neutral-900">
              {formatPrice(total)}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}


export default function CheckoutPage() {
  return (
    <RequireAuth roles={["USER"]}>
      <CheckoutContent />
    </RequireAuth>
  );
}
