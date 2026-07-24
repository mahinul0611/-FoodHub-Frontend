"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Button,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Spinner,
} from "@/components/ui";
import { api, asArray, getErrorMessage } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { Category } from "@/lib/types";
import { categorySchema, zodFieldErrors } from "@/lib/validators";

function CategoryRow({
  category,
  onRenamed,
  onDeleted,
}: {
  category: Category;
  onRenamed: (name: string) => void;
  onDeleted: (id: string) => void;
}) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    const parsed = categorySchema.safeParse({ name });
    if (!parsed.success) {
      setError(zodFieldErrors(parsed.error).name ?? "Invalid name.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await api.put(`/admin/category/${category.id}`, {
        name: parsed.data.name,
      });
      toast("Category renamed", "success");
      onRenamed(parsed.data.name);
      setEditing(false);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/admin/category/${category.id}`);
      toast(`Category "${category.name}" deleted successfully`, "success");
      onDeleted(category.id);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      {editing ? (
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="min-w-[200px] flex-1">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Category name"
              aria-invalid={Boolean(error)}
            />
            {error ? (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            ) : null}
          </div>
          <Button
            className="min-h-0 px-3 py-1.5 text-xs"
            loading={saving}
            onClick={handleSave}
          >
            Save
          </Button>
          <Button
            variant="ghost"
            className="min-h-0 px-3 py-1.5 text-xs"
            onClick={() => {
              setEditing(false);
              setName(category.name);
              setError(null);
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <>
          <span className="font-medium text-neutral-900">{category.name}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="min-h-0 px-3 py-1.5 text-xs"
              onClick={() => setEditing(true)}
            >
              Rename
            </Button>
            <Button
              type="button"
              loading={deleting}
              className="min-h-0 bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </>
      )}
    </li>
  );
}

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await api.get("/admin/category");
      setCategories(asArray<Category>(payload));
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
    const parsed = categorySchema.safeParse({ name: newName });
    if (!parsed.success) {
      setFormError(zodFieldErrors(parsed.error).name ?? "Invalid name.");
      return;
    }
    setFormError(null);
    setCreating(true);
    try {
      await api.post("/admin/category", { name: parsed.data.name });
      toast("Category created", "success");
      setNewName("");
      await load();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <form
        onSubmit={handleCreate}
        noValidate
        className="rounded-xl border border-neutral-200 bg-white p-6"
      >
        <h2 className="text-base font-semibold text-neutral-900">
          Add a category
        </h2>
        <div className="mt-3 flex flex-wrap items-start gap-3">
          <div className="min-w-[220px] flex-1">
            <Field label="Category name" error={formError ?? undefined}>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Biriyani"
                aria-invalid={Boolean(formError)}
              />
            </Field>
          </div>
          <Button type="submit" loading={creating} className="mt-7">
            Add category
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={"\uD83C\uDFF7\uFE0F"}
          title="No categories yet"
          description="Create your first category above."
        />
      ) : (
        <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onRenamed={(name) =>
                setCategories((current) =>
                  current.map((c) =>
                    c.id === category.id ? { ...c, name } : c,
                  ),
                )
              }
              onDeleted={(id) =>
                setCategories((current) => current.filter((c) => c.id !== id))
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}