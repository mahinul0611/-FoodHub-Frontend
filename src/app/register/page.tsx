"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Field, Input, cn } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { roleOf } from "@/lib/utils";
import { registerSchema, zodFieldErrors } from "@/lib/validators";

const ROLE_OPTIONS = [
  {
    value: "USER",
    icon: "\uD83C\uDF7D\uFE0F",
    title: "Customer",
    description: "Order meals from local providers",
  },
  {
    value: "PROVIDER",
    icon: "\uD83D\uDC69\u200D\uD83C\uDF73",
    title: "Provider",
    description: "Sell your homemade meals",
  },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "USER",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);

    const [facebookLoading, setFacebookLoading] = useState(false)
  

const handleGoogleLogin = async () => {
  setGoogleLoading(true);
  setFormError(null);
  try {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: window.location.origin,
    });
    if (error) {
      setFormError(error.message ?? "Google login failed. Please try again.");
      setGoogleLoading(false);
    }
    // On success the browser is redirected to Google, so keep loading.
  } catch (err) {
    setFormError(getErrorMessage(err));
    setGoogleLoading(false);
  }
};

const handleFacebookLogin = async () => {
  setFacebookLoading(true);
  setFormError(null);
  try {
    const { error } = await authClient.signIn.social({
      provider: "facebook",
      callbackURL: window.location.origin,
    });
    if (error) {
      setFormError(
        error.message ?? "Facebook login failed. Please try again.",
      );
      setFacebookLoading(false);
    }
    // On success the browser is redirected to Facebook, so keep loading.
  } catch (err) {
    setFormError(getErrorMessage(err));
    setFacebookLoading(false);
  }
};

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      // Better Auth sign-up; `role` and `phone` are custom fields defined by
      // the backend's Better Auth configuration.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await authClient.signUp.email({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        role: parsed.data.role,
        phone: parsed.data.phone,
      } as any);
      if (error) {
        setFormError(error.message ?? "Could not create your account.");
        return;
      }

      const me = await refresh();
      if (!me) {
        toast("Account created! Please log in.", "success");
        router.push("/login");
        return;
      }

      toast("Account created \u2014 welcome to FoodHub!", "success");
      router.push(roleOf(me) === "PROVIDER" ? "/provider" : "/");
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="text-center">
        <p className="text-4xl" aria-hidden="true">
          {"\uD83C\uDF5C"}
        </p>
        <h1 className="mt-3 text-2xl font-bold text-neutral-900">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Join FoodHub as a customer or a meal provider.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
      >
        {formError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {formError}
          </div>
        ) : null}

        <div>
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">
            I want to join as
          </span>
          <div className="grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => set("role", option.value)}
                aria-pressed={form.role === option.value}
                className={cn(
                  "rounded-lg border p-3 text-left transition",
                  form.role === option.value
                    ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100"
                    : "border-neutral-200 bg-white hover:border-neutral-300",
                )}
              >
                <span className="text-xl" aria-hidden="true">
                  {option.icon}
                </span>
                <p className="mt-1 text-sm font-semibold text-neutral-900">
                  {option.title}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
          {errors.role ? (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          ) : null}
        </div>

        <Field
          label={
            form.role === "PROVIDER" ? "Business / kitchen name" : "Full name"
          }
          error={errors.name}
        >
          <Input
            autoComplete="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={
              form.role === "PROVIDER"
                ? "e.g. Sultan's Dine"
                : "e.g. Alex Hales"
            }
            aria-invalid={Boolean(errors.name)}
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
          />
        </Field>

        <Field label="Phone" error={errors.phone}>
          <Input
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="e.g. 01712345678"
            aria-invalid={Boolean(errors.phone)}
          />
        </Field>

        <Field
          label="Password"
          error={errors.password}
          hint="At least 8 characters"
        >
          <Input
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Create a password"
            aria-invalid={Boolean(errors.password)}
          />
        </Field>

        <Button type="submit" loading={submitting} className="w-full">
          Create account
        </Button>
        <div className="flex items-center gap-3" aria-hidden="true">
  <span className="h-px flex-1 bg-neutral-200" />
  <span className="text-xs uppercase tracking-wide text-neutral-400">or</span>
  <span className="h-px flex-1 bg-neutral-200" />
</div>

<Button
  type="button"
  variant="secondary"
  loading={googleLoading}
  className="w-full"
  onClick={handleGoogleLogin}
>
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29A7.19 7.19 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
    />
  </svg>
  Continue with Google
</Button>

<Button
  type="button"
  variant="secondary"
  loading={facebookLoading}
  className="w-full"
  onClick={handleFacebookLogin}
>
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#1877F2"
      d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12z"
    />
  </svg>
  Continue with Facebook
</Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-600 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
