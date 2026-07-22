"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { Button, Field, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/lib/toast-context";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const token = searchParams.get("token") ?? "";
  const linkInvalid = !token || searchParams.get("error") === "INVALID_TOKEN";

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const { error: apiError } = await authClient.resetPassword({
        newPassword: form.password,
        token,
      });
      if (apiError) {
        setError(apiError.message ?? "Could not reset your password.");
        return;
      }
      toast("Password updated! Please log in.", "success");
      router.push("/login");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (linkInvalid) {
    return (
      <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        This password reset link is invalid or has expired.{" "}
        <Link href="/forgot-password" className="font-medium underline">
          Request a new one
        </Link>
        .
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-8 space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
    >
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Field label="New password">
        <Input
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="At least 8 characters"
        />
      </Field>

      <Field label="Confirm new password">
        <Input
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
          placeholder="Repeat the new password"
        />
      </Field>

      <Button type="submit" loading={submitting} className="w-full">
        Reset password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="text-center">
        <p className="text-4xl" aria-hidden="true">
          {"\uD83D\uDD10"}
        </p>
        <h1 className="mt-3 text-2xl font-bold text-neutral-900">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Choose a new password for your account.
        </p>
      </div>

      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}