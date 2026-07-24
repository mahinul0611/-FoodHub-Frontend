"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Select,
  Spinner,
} from "@/components/ui";
import { api, asArray, getErrorMessage } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { Coupon } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";

const EMPTY_FORM = {
  code: "",
  discountType: "PERCENT",
  value: "",
  maxDiscount: "",
  minOrder: "",
  maxUses: "",
  expiresAt: "",
};

export default function AdminCouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
// ১. handleDelete ফাংশনটি কম্পোনেন্টের ভেতরে ডিক্লেয়ার করো
const [deletingId, setDeletingId] = useState<string | null>(null);




  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCoupons(asArray<Coupon>(await api.get("/coupons")));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const code = form.code.trim().toUpperCase();
    const value = Number(form.value);
    if (!code) {
      setFormError("Coupon code is required.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setFormError("Discount value must be a positive number.");
      return;
    }
    if (form.discountType === "PERCENT" && value > 100) {
      setFormError("Percent discount cannot exceed 100.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/coupons", {
        code,
        discountType: form.discountType,
        value,
        minOrder: form.minOrder ? Number(form.minOrder) : 0,
        ...(form.discountType === "PERCENT" && form.maxDiscount
          ? { maxDiscount: Number(form.maxDiscount) }
          : {}),
        ...(form.maxUses ? { maxUses: Number(form.maxUses) } : {}),
        ...(form.expiresAt ? { expiresAt: form.expiresAt } : {}),
      });
      toast(`Coupon ${code} created!`, "success");
      setForm({ ...EMPTY_FORM });
      await load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: Coupon) => {
    setTogglingId(item.id);
    try {
      await api.patch(`/coupons/${item.id}`, { active: !item.active });
      await load();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setTogglingId(null);
    }
  };


  

const handleDeleteCoupon = async (item:Coupon, code: string) => {
  if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) {
    return;
  }

  setDeletingId(item.id);
  try {
    // ব্যাকএন্ডের রাউটের সাথে মিলিয়ে এন্ডপয়েন্ট সেট করবে (যেমন: /admin/coupons/${id} অথবা /coupons/${id})
    await api.delete(`/coupons/${item.id}`);
    toast(`Coupon "${code}" deleted successfully`, "success");
    
    // স্টেট থেকে কুপন ফিল্টার করে সরিয়ে দেওয়া
    setCoupons((prev) => prev.filter((coupon) => coupon.id !== item.id));
  } catch (err) {
    toast(getErrorMessage(err), "error");
  } finally {
    setDeletingId(null);
  }
};


  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        noValidate
        className="rounded-xl border border-neutral-200 bg-white p-6"
      >
        <h2 className="text-base font-semibold text-neutral-900">
          Create a coupon
        </h2>
        {formError ? (
          <div
            role="alert"
            className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {formError}
          </div>
        ) : null}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Code">
            <Input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="e.g. WELCOME10"
            />
          </Field>
          <Field label="Discount type">
            <Select
              value={form.discountType}
              onChange={(e) =>
                setForm((f) => ({ ...f, discountType: e.target.value }))
              }
            >
              <option value="PERCENT">Percent (%)</option>
              <option value="FLAT">Flat amount</option>
            </Select>
          </Field>
          <Field
            label={
              form.discountType === "PERCENT" ? "Percent off" : "Amount off"
            }
          >
            <Input
              type="number"
              min={1}
              value={form.value}
              onChange={(e) =>
                setForm((f) => ({ ...f, value: e.target.value }))
              }
              placeholder={
                form.discountType === "PERCENT" ? "e.g. 10" : "e.g. 50"
              }
            />
          </Field>
          {form.discountType === "PERCENT" ? (
            <Field label="Max discount amount (optional)">
              <Input
                type="number"
                min={1}
                value={form.maxDiscount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxDiscount: e.target.value }))
                }
                placeholder="e.g. 100"
              />
            </Field>
          ) : null}
          <Field label="Minimum order (optional)">
            <Input
              type="number"
              min={0}
              value={form.minOrder}
              onChange={(e) =>
                setForm((f) => ({ ...f, minOrder: e.target.value }))
              }
              placeholder="e.g. 300"
            />
          </Field>
          <Field label="Max uses (optional)">
            <Input
              type="number"
              min={1}
              value={form.maxUses}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxUses: e.target.value }))
              }
              placeholder="e.g. 100"
            />
          </Field>
          <Field label="Expires on (optional)">
            <Input
              type="date"
              value={form.expiresAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, expiresAt: e.target.value }))
              }
            />
          </Field>
        </div>
        <Button type="submit" loading={saving} className="mt-4">
          Create coupon
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : coupons.length === 0 ? (
        <EmptyState
          icon={"\uD83C\uDFF7\uFE0F"}
          title="No coupons yet"
          description="Create your first promo code above."
        />
      ) : (
        <ul className="space-y-3">
          {coupons.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-base font-bold text-neutral-900">
                    {item.code}
                  </span>
                  <Badge
                    className={
                      item.active
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-neutral-200 bg-neutral-100 text-neutral-500"
                    }
                  >
                    {item.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  {item.discountType === "PERCENT"
                    ? `${item.value}% off${
                        item.maxDiscount
                          ? ` (max ${formatPrice(Number(item.maxDiscount))})`
                          : ""
                      }`
                    : `${formatPrice(item.value)} off`}
                  {Number(item.minOrder ?? 0) > 0
                    ? ` \u00B7 min order ${formatPrice(Number(item.minOrder))}`
                    : ""}
                  {item.maxUses
                    ? ` \u00B7 ${item.usedCount ?? 0}/${item.maxUses} used`
                    : ` \u00B7 ${item.usedCount ?? 0} used`}
                  {item.expiresAt
                    ? ` \u00B7 expires ${formatDate(item.expiresAt)}`
                    : ""}
                </p>
              </div>
              <Button
                variant="secondary"
                loading={togglingId === item.id}
                onClick={() => toggleActive(item)}
              >
                {item.active ? "Deactivate" : "Activate"}
              </Button>
<Button
  type="button"
  loading={deletingId === item.id}
  className="bg-red-600 text-white hover:bg-red-700 text-xs px-3 py-1.5 ml-2"
  onClick={() => handleDeleteCoupon(item, item.code)}>
  Delete
</Button>
              
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
