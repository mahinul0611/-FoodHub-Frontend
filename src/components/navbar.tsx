"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { roleOf } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/meals", label: "Meals" },
];

function dashboardHref(role: string): string {
  if (role === "ADMIN") return "/admin";
  if (role === "PROVIDER") return "/provider";
  return "/dashboard";
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { count } = useCart();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const role = roleOf(user);

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    toast("Signed out successfully", "success");
    router.push("/");
  };

  const linkClass = (href: string) =>
    cn(
      "rounded-lg px-3 py-2 text-sm font-medium transition",
      pathname === href
        ? "bg-brand-50 text-brand-700"
        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
    );

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-neutral-900"
          onClick={() => setOpen(false)}
        >
          <span aria-hidden="true">{"\uD83C\uDF5C"}</span>
          <span>
            Food<span className="text-brand-600">Hub</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/cart"
            className="relative rounded-lg p-2.5 text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-semibold text-white">
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </Link>

          {loading ? (
            <span className="hidden h-9 w-24 animate-pulse rounded-lg bg-neutral-100 md:block" />
          ) : user ? (
            <div className="hidden items-center gap-1.5 md:flex">
              <Link
                href={dashboardHref(role)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Dashboard
              </Link>
              <Link
                href="/me"
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Profile
              </Link>

              <button
                onClick={handleSignOut}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 md:flex">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            className="rounded-lg p-2.5 text-neutral-600 hover:bg-neutral-50 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-neutral-100 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.href)}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href={dashboardHref(role)}
                  className={linkClass(dashboardHref(role))}
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>

                <Link
                  href={dashboardHref(role)}
                  className={linkClass(dashboardHref(role))}
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={linkClass("/login")}
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className={linkClass("/register")}
                  onClick={() => setOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
