"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { FullPageLoader } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { roleOf } from "@/lib/utils";

/**
 * Client-side route guard. Redirects unauthenticated visitors to the login
 * page, and shows an access-denied message when the signed-in user's role is
 * not in the allowed `roles` list.
 */
export function RequireAuth({
  roles,
  children,
}: {
  roles?: string[];
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return <FullPageLoader label="Checking your session…" />;
  }

  if (!user) {
    return <FullPageLoader label="Redirecting to login…" />;
  }

  if (roles && roles.length > 0 && !roles.includes(roleOf(user))) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-5xl" aria-hidden="true">
          {"\uD83D\uDD12"}
        </p>
        <h2 className="mt-4 text-xl font-semibold text-neutral-900">
          Access denied
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Your account does not have permission to view this page.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline"
        >
          {"\u2190"} Back to home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
