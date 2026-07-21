"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/components/ui";

export interface DashboardNavItem {
  href: string;
  label: string;
}

export function DashboardShell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: DashboardNavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:gap-8">
      <aside className="shrink-0 md:w-56">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {title}
        </p>
        <nav
          className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:pb-0"
          aria-label={title}
        >
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
