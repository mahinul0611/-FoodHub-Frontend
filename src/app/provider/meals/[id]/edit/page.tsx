"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MealForm, type MealFormValues } from "@/components/meal-form";
import { ErrorState, PageHeader, Spinner } from "@/components/ui";
import { api, getErrorMessage, unwrap } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { Meal } from "@/lib/types";

export default function EditMealPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";
  const router = useRouter();
  const { toast } = useToast();

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const payload = await api.get(`/meals/${id}`);
      const result = unwrap<Meal | null>(payload);
      if (!result || typeof result !== "object" || !result.id) {
        setError("This meal could not be found.");
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

  const handleSubmit = async (values: MealFormValues) => {
    setSubmitting(true);
    try {
      // Per the API documentation, meal updates accept name, price,
      // quantity, description, and status (category is set at creation).
      await api.put(`/meals/${id}`, {
        name: values.name,
        price: values.price,
        quantity: values.quantity,
        description: values.description,
        status: values.status,
      });
      toast("Meal updated!", "success");
      router.push("/provider/meals");
    } catch (err) {
      toast(getErrorMessage(err), "error");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (error || !meal) {
    return (
      <div>
        <ErrorState message={error ?? "Meal not found."} onRetry={load} />
        <p className="mt-4">
          <Link
            href="/provider/meals"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            {"\u2190"} Back to my meals
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <PageHeader
        title={`Edit: ${meal.name}`}
        description="Update the details of this meal."
      />
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <MealForm
          mode="edit"
          categories={[]}
          initial={meal}
          submitting={submitting}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
