"use client";

import { useEffect, useState, type FormEvent } from "react";
import { RequireAuth } from "@/components/require-auth";
import { Badge, Button, Field, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { formatDate, roleOf, statusBadgeClass } from "@/lib/utils";

function ProfileDetailsForm() {
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ name: user?.name ?? "", phone: user?.phone ?? "" });
  }, [user?.name, user?.phone]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (form.phone.trim().length < 6) {
      setError("Enter a valid phone number.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const { error: apiError } = await authClient.updateUser({
        name: form.name.trim(),
        phone: form.phone.trim(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      if (apiError) {
        setError(apiError.message ?? "Could not update your profile.");
        return;
      }
      await refresh();
      toast("Profile updated", "success");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-neutral-200 bg-white p-6"
    >
      <h2 className="text-base font-semibold text-neutral-900">
        Profile details
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Update your name and phone number.
      </p>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-4 space-y-4">
        <Field label="Name">
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Your name"
            autoComplete="name"
          />
        </Field>

        <Field label="Phone">
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+8801XXXXXXXXX"
            autoComplete="tel"
          />
        </Field>

        <Button type="submit" loading={saving}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

function ChangePasswordForm() {
  const { toast } = useToast();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.current) {
      setError("Enter your current password.");
      return;
    }
    if (form.next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (form.next === form.current) {
      setError("New password must be different from the current one.");
      return;
    }
    if (form.next !== form.confirm) {
      setError("New passwords do not match.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const { error: apiError } = await authClient.changePassword({
        currentPassword: form.current,
        newPassword: form.next,
        revokeOtherSessions: true,
      });
      if (apiError) {
        setError(apiError.message ?? "Could not change your password.");
        return;
      }
      setForm({ current: "", next: "", confirm: "" });
      toast("Password changed successfully", "success");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-neutral-200 bg-white p-6"
    >
      <h2 className="text-base font-semibold text-neutral-900">
        Change password
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        You must enter your current password to set a new one. Signed up with
        Google or Facebook? Use “Forgot password” on the login page to set a
        password first.
      </p>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-4 space-y-4">
        <Field label="Current password">
          <Input
            type="password"
            autoComplete="current-password"
            value={form.current}
            onChange={(e) =>
              setForm((f) => ({ ...f, current: e.target.value }))
            }
            placeholder="Your current password"
          />
        </Field>

        <Field label="New password">
          <Input
            type="password"
            autoComplete="new-password"
            value={form.next}
            onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))}
            placeholder="At least 8 characters"
          />
        </Field>

        <Field label="Confirm new password">
          <Input
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) =>
              setForm((f) => ({ ...f, confirm: e.target.value }))
            }
            placeholder="Repeat the new password"
          />
        </Field>

        <Button type="submit" loading={saving}>
          Change password
        </Button>
      </div>
    </form>
  );
}

function ProfileSummary() {
  const { user } = useAuth();
  const role = roleOf(user);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-bold text-white">
          {(user?.name ?? user?.email ?? "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-neutral-900">
            {user?.name ?? "—"}
          </p>
          <p className="truncate text-sm text-neutral-500">{user?.email}</p>
        </div>
        <Badge className={statusBadgeClass(role)}>{role}</Badge>
      </div>
      <dl className="mt-4 grid gap-3 border-t border-neutral-100 pt-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-neutral-400">Phone</dt>
          <dd className="mt-0.5 font-medium text-neutral-900">
            {user?.phone ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-400">Member since</dt>
          <dd className="mt-0.5 font-medium text-neutral-900">
            {user?.createdAt ? formatDate(user.createdAt) : "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold text-neutral-900">My profile</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your account details and password.
        </p>

        <div className="mt-6 space-y-6">
          <ProfileSummary />
          <ProfileDetailsForm />
          <ChangePasswordForm />
        </div>
      </div>
    </RequireAuth>
  );
}