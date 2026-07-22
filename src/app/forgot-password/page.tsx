"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button, Field, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const { error: apiError } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (apiError) {
        setError(apiError.message ?? "Could not send the reset email.");
        return;
      }
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="text-center">
        <p className="text-4xl" aria-hidden="true">
          {"\uD83D\uDD11"}
        </p>
        <h1 className="mt-3 text-2xl font-bold text-neutral-900">
          Forgot your password?
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {sent ? (
        <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center text-sm text-emerald-800">
          If an account exists for <span className="font-medium">{email}</span>,
          a password reset link has been sent. Check your inbox (and spam
          folder).
        </div>
      ) : (
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

          <Field label="Email">
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field>

          <Button type="submit" loading={submitting} className="w-full">
            Send reset link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-neutral-600">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-600 hover:underline"
        >
          Back to log in
        </Link>
      </p>
    </div>
  );
}