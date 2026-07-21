"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { RequireAuth } from "@/components/require-auth";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/orders", label: "My orders" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth roles={["USER"]}>
      <DashboardShell title="My account" nav={NAV}>
        {children}
      </DashboardShell>
    </RequireAuth>
  );
}
