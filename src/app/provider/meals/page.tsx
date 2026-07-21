"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Spinner,
} from "@/components/ui";
import { api, asArray, getErrorMessage, unwrap } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import type { Meal } from "@/lib/types";
import { formatPrice, statusBadgeClass } from "@/lib/utils";

export default function ProviderMealsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Meal | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const ids = new Set<string>([user.id]);
      let embedded: Meal[] | null = null;
      try {
        const raw = unwrap<unknown>(await api.get("/provider"));
        if (raw && typeof raw === "object" && !Array.isArray(raw)) {
          const record = raw as Record<string, unknown>;
          for (const key of ["id", "userId", "providerId"]) {
            const value = record[key];
            if (typeof value === "string") ids.add(value);
          }
          if (Array.isArray(record.meals)) {
            embedded = record.meals as Meal[];
          }
        }
      } catch {
        // Fall back to filtering the public meals list.
      }

      if (embedded) {
        setMeals(embedded);
      } else {
        const all = asArray<Meal>(await api.get("/meals/"));
        setMeals(
          all.filter((meal) =>
            [meal.providerId, meal.provider?.id, meal.provider?.userId].some(
              (value) => typeof value === "string" && ids.has(value),
            ),
          ),
        );
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.delete(`/meals/${deleting.id}`);
      setMeals((current) => current.filter((m) => m.id !== deleting.id));
      toast(`${deleting.name} deleted`, "success");
      setDeleting(null);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">
          Manage the meals you offer on FoodHub.
        </p>
        <Link
          href="/provider/meals/new"
          className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-600 px-5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          + Add meal
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : meals.length === 0 ? (
        <EmptyState
          icon={"\uD83C\uDF72"}
          title="No meals yet"
          description="Add your first meal so customers can start ordering."
          action={
            <Link
              href="/provider/meals/new"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-600 px-5 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Add your first meal
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Meal</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {meals.map((meal) => (
                <tr key={meal.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/meals/${meal.id}`}
                      className="font-medium text-neutral-900 hover:text-brand-700"
                    >
                      {meal.name}
                    </Link>
                    {meal.category?.name ? (
                      <p className="text-xs text-neutral-400">
                        {meal.category.name}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{formatPrice(meal.price)}</td>
                  <td className="px-4 py-3">
                    {typeof meal.quantity === "number"
                      ? meal.quantity
                      : "\u2014"}
                  </td>
                  <td className="px-4 py-3">
                    {meal.status ? (
                      <Badge className={statusBadgeClass(meal.status)}>
                        {meal.status}
                      </Badge>
                    ) : (
                      "\u2014"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <Link
                        href={`/provider/meals/${meal.id}/edit`}
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                      >
                        Edit
                      </Link>
                      <Button
                        variant="danger"
                        className="min-h-0 px-3 py-1.5 text-xs"
                        onClick={() => setDeleting(meal)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this meal?"
        description={
          deleting
            ? `"${deleting.name}" will be permanently removed from your menu.`
            : ""
        }
        confirmLabel="Delete meal"
        loading={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
