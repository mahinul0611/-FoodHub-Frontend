"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MealForm, type MealFormValues } from "@/components/meal-form";
import { PageHeader } from "@/components/ui";
import { api, getErrorMessage } from "@/lib/api";
import { loadCategories } from "@/lib/categories";
import { useToast } from "@/lib/toast-context";
import type { Category } from "@/lib/types";

export default function NewMealPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await loadCategories();
        if (!cancelled) setCategories(result);
      } catch {
        // Category list is best-effort; the form still renders.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (values: MealFormValues) => {
    setSubmitting(true);
    try {
      await api.post("/meals", {
        name: values.name,
        categoryId: values.categoryId,
        price: values.price,
        quantity: values.quantity,
        
        description: values.description,
      });
      toast("Meal created!", "success");
      router.push("/provider/meals");
    } catch (err) {
      toast(getErrorMessage(err), "error");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <PageHeader
        title="Add a new meal"
        description="Fill in the details below to publish a new meal."
      />
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <MealForm
          mode="create"
          categories={categories}
          submitting={submitting}
          submitLabel="Create meal"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
