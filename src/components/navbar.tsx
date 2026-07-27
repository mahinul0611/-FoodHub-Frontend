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
  { href: "/restaurants", label: "Restaurants" },
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
  
  // 🔴 clear ফাংশনটি এখান থেকে রিমুভ করা হয়েছে
  const { count } = useCart(); 
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const role = roleOf(user);

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    
    // 🔴 কার্ট ক্লিয়ার বা localStorage রিমুভ করার কোডটি বাদ দেওয়া হয়েছে
    toast("Signed out successfully", "success");
    router.push("/login");
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
        
        {/* ✨ আপডেটেড লোগো সেকশন */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-neutral-900"
          onClick={() => setOpen(false)}
        >
          <svg 
            viewBox="0 0 64 64" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-8 h-8 text-brand-600" 
          >
            <defs>
              <mask id="ear-bite-mask">
                <rect width="64" height="64" fill="white" />
                <circle cx="54" cy="12" r="5" fill="black" />
                <circle cx="47" cy="9" r="4.5" fill="black" />
              </mask>
            </defs>
            <circle cx="18" cy="20" r="10" fill="currentColor" />
            <circle cx="46" cy="20" r="10" fill="currentColor" mask="url(#ear-bite-mask)" />
            <rect x="10" y="18" width="44" height="38" rx="19" fill="currentColor" />
            <ellipse cx="32" cy="42" rx="14" ry="10" fill="#FFFBEB" />
            <circle cx="32" cy="38" r="3.5" fill="#431407" />
            <path d="M27 43 Q 32 47 37 43" stroke="#431407" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="22" cy="31" r="3.5" fill="#431407" />
            <circle cx="42" cy="31" r="3.5" fill="#431407" />
            <ellipse cx="16" cy="39" rx="3.5" ry="2" fill="#FCA5A5" opacity="0.8" />
            <ellipse cx="48" cy="39" rx="3.5" ry="2" fill="#FCA5A5" opacity="0.8" />
          </svg>
          <span>
            Bite<span className="text-brand-600">Bear</span>
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
                  href="/me"
                  className={linkClass("/me")}
                  onClick={() => setOpen(false)}
                >
                  Profile
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