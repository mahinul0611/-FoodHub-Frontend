// app/login-error/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function LoginErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    state_mismatch: "Login session expired or invalid. Please try again.",
    access_denied: "You denied access. Please try again if this was a mistake.",
    invalid_callback: "Something went wrong during login. Please try again.",
  };

  const message =
    (error && errorMessages[error]) ||
    "Something went wrong while signing you in. Please try again.";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold mb-2">Login failed</h1>
      <p className="text-gray-500 mb-6">{message}</p>
      <button
        onClick={() => router.push("/login")}
        className="rounded-md bg-orange-500 px-5 py-2 text-white font-medium hover:bg-orange-600"
      >
        Try again
      </button>
    </div>
  );
}