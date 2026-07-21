"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button, ErrorState, Field, Input, Spinner } from "@/components/ui";
import { api, getErrorMessage, unwrap } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { prettifyKey } from "@/lib/utils";
import { providerProfileSchema, zodFieldErrors } from "@/lib/validators";

export default function ProviderProfilePage() {
  const { user, refresh } = useAuth();
  const { toast } = useToast();

  const [provider, setProvider] = useState<Record<string, unknown> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = unwrap<unknown>(await api.get("/provider"));
      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        const record = raw as Record<string, unknown>;
        setProvider(record);
        const currentName =
          typeof record.name === "string" ? record.name : (user?.name ?? "");
        setName(currentName);
      } else {
        setProvider(null);
        setName(user?.name ?? "");
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const parsed = providerProfileSchema.safeParse({ name });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSaving(true);

    try {
      await api.patch(`/provider/profile/${user.id}`, {
        name: parsed.data.name,
      });
      toast("Profile updated", "success");
      await Promise.all([load(), refresh()]);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  const infoEntries = provider
    ? Object.entries(provider).filter(
        ([, value]) => typeof value === "string" || typeof value === "number",
      )
    : [];

  return (
    <div className="max-w-xl space-y-6">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
      >
        <h2 className="text-base font-semibold text-neutral-900">
          Edit profile
        </h2>
        <Field label="Business / kitchen name" error={errors.name}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sultan's Dine"
            aria-invalid={Boolean(errors.name)}
          />
        </Field>
        <Button type="submit" loading={saving}>
          Save changes
        </Button>
      </form>

      {infoEntries.length > 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-base font-semibold text-neutral-900">
            Profile details
          </h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            {infoEntries.slice(0, 10).map(([key, value]) => (
              <div key={key}>
                <dt className="text-neutral-500">{prettifyKey(key)}</dt>
                <dd className="mt-0.5 break-words font-medium text-neutral-900">
                  {String(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}
