"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { RequireAuth } from "@/components/require-auth";
import {
  Button,
  cn,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Textarea,
} from "@/components/ui";
import { api, getErrorMessage, unwrap } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import {
  DELIVERY_CHARGE,
  PAYMENT_METHODS,
  PHONE_VERIFICATION_ENABLED,
} from "@/lib/types";
import { formatPrice, toNumber } from "@/lib/utils";
import { checkoutSchema, zodFieldErrors } from "@/lib/validators";

type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const METHOD_LABELS: Record<PaymentMethod, { title: string; hint: string }> = {
  COD: { title: "Cash on delivery", hint: "Pay when your food arrives" },
  SSLCOMMERZ: { title: "SSLCommerz", hint: "Cards, bKash & more (BDT)" },
  STRIPE: { title: "Stripe", hint: "International cards" },
};

function CheckoutContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const { toast } = useToast();

  const phoneUnverified =
    PHONE_VERIFICATION_ENABLED && user?.phoneVerified === false;

  const [form, setForm] = useState({ address: "", contactNumber: "" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = total;
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const grandTotal = Math.max(0, subtotal + DELIVERY_CHARGE - discount);

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

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponError(null);
    setApplyingCoupon(true);
    try {
      const payload = await api.post("/coupons/validate", {
        code,
        subtotal,
      });
      const result = unwrap<{ code?: string; discount?: number }>(payload);
      if (!result?.code || typeof result.discount !== "number") {
        throw new Error("Invalid coupon code.");
      }
      setCoupon({ code: result.code, discount: result.discount });
      toast(`Coupon ${result.code} applied!`, "success");
    } catch (err) {
      setCoupon(null);
      setCouponError(getErrorMessage(err));
    } finally {
      setApplyingCoupon(false);
    }
  };

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
      const payload = await api.post("/orders", {
        address: parsed.data.address,
        contactNumber: parsed.data.contactNumber,
        items: items.map((item) => ({
          mealsId: item.meal.id,
          quantity: item.quantity,
        })),
        ...(coupon ? { couponCode: coupon.code } : {}),
      });

      if (paymentMethod !== "COD") {
        const order = unwrap<{ id?: string }>(payload);
        const orderId = order?.id;
        if (!orderId) {
          throw new Error(
            "Your order was placed, but the payment could not start. Check My orders.",
          );
        }
        const initPayload = await api.post("/payments/init", {
          orderId,
          method: paymentMethod,
        });
        const init = unwrap<{ paymentUrl?: string }>(initPayload);
        if (!init?.paymentUrl) {
          throw new Error(
            "Your order was placed, but the payment could not start. Check My orders.",
          );
        }
        clear();
        window.location.href = init.paymentUrl;
        return;
      }

      clear();
      toast("Order placed successfully!", "success");
      router.push("/dashboard/orders");
    } catch (err) {
      setFormError(getErrorMessage(err));
      setSubmitting(false);
      return;
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

          <Field label="Payment method">
            <div className="grid gap-2 sm:grid-cols-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition",
                    paymentMethod === method
                      ? "border-brand-600 bg-brand-50"
                      : "border-neutral-200 bg-white hover:border-neutral-300",
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="accent-brand-600"
                  />
                  <span>
                    <span className="block font-medium text-neutral-900">
                      {METHOD_LABELS[method].title}
                    </span>
                    <span className="block text-xs text-neutral-500">
                      {METHOD_LABELS[method].hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Promo code" error={couponError ?? undefined}>
            {coupon ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm">
                <span className="font-medium text-green-800">
                  {coupon.code} applied {"\u2014"} you save{" "}
                  {formatPrice(discount)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCoupon(null);
                    setCouponInput("");
                  }}
                  className="font-medium text-green-700 underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="e.g. WELCOME10"
                  className="uppercase"
                />
                <Button
                  type="button"
                  variant="secondary"
                  loading={applyingCoupon}
                  onClick={applyCoupon}
                >
                  Apply
                </Button>
              </div>
            )}
          </Field>

          <Button
            type="submit"
            loading={submitting}
            disabled={phoneUnverified}
            className="w-full"
          >
            {paymentMethod !== "COD" ? "Pay now" : "Place order"} {"\u00B7"}{" "}
            {formatPrice(grandTotal)}
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
          <dl className="mt-3 space-y-1.5 border-t border-neutral-100 pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Subtotal</dt>
              <dd className="font-medium text-neutral-900">
                {formatPrice(subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Delivery charge</dt>
              <dd className="font-medium text-neutral-900">
                {formatPrice(DELIVERY_CHARGE)}
              </dd>
            </div>
            {coupon ? (
              <div className="flex justify-between text-green-700">
                <dt>Discount ({coupon.code})</dt>
                <dd className="font-medium">-{formatPrice(discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-neutral-100 pt-2">
              <dt className="text-sm font-semibold text-neutral-900">Total</dt>
              <dd className="text-lg font-bold text-neutral-900">
                {formatPrice(grandTotal)}
              </dd>
            </div>
          </dl>
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