"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import type { Category, Meal } from "@/lib/types";
import { MEAL_STATUSES } from "@/lib/types";
import {
  mealCreateSchema,
  mealUpdateSchema,
  zodFieldErrors,
} from "@/lib/validators";

export interface MealFormValues {
  name: string;
  categoryId?: string;
  price: number;
  quantity: number;
  description: string;
  status?: string;
}

export function MealForm({
  mode,
  categories,
  initial,
  submitting,
  submitLabel,
  onSubmit,
}: {
  mode: "create" | "edit";
  categories: Category[];
  initial?: Partial<Meal>;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: MealFormValues) => void | Promise<void>;
}) {
  const [form, setForm] = useState({
    name: String(initial?.name ?? ""),
    categoryId: String(initial?.categoryId ?? initial?.category?.id ?? ""),
    price: initial?.price !== undefined ? String(initial.price) : "",
    quantity: initial?.quantity !== undefined ? String(initial.quantity) : "",
    description: String(initial?.description ?? ""),
    status: String(initial?.status ?? "AVAILABLE").toUpperCase(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const schema = mode === "create" ? mealCreateSchema : mealUpdateSchema;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    void onSubmit(parsed.data as MealFormValues);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field label="Meal name" error={errors.name}>
        <Input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Mutton Kacchi Biriyani"
          aria-invalid={Boolean(errors.name)}
        />
      </Field>

      {mode === "create" ? (
        <Field
          label="Category"
          error={errors.categoryId}
          hint={
            categories.length === 0
              ? "No categories available yet. Ask an admin to add one."
              : undefined
          }
        >
          <Select
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            aria-invalid={Boolean(errors.categoryId)}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Price (BDT)" error={errors.price}>
          <Input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="e.g. 300"
            aria-invalid={Boolean(errors.price)}
          />
        </Field>
        <Field label="Quantity in stock" error={errors.quantity}>
          <Input
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={form.quantity}
            onChange={(e) => set("quantity", e.target.value)}
            placeholder="e.g. 15"
            aria-invalid={Boolean(errors.quantity)}
          />
        </Field>
      </div>

      <Field label="Description" error={errors.description}>
        <Textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe the meal, ingredients, and portion size…"
          aria-invalid={Boolean(errors.description)}
        />
      </Field>

      {mode === "edit" ? (
        <Field label="Status" error={errors.status}>
          <Select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            aria-invalid={Boolean(errors.status)}
          >
            {MEAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      <div className="pt-2">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
