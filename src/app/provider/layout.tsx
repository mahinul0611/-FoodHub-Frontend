"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { RequireAuth } from "@/components/require-auth";

const NAV = [
  { href: "/provider", label: "Overview" },
  { href: "/provider/meals", label: "My meals" },
  { href: "/provider/orders", label: "Orders" },
  { href: "/provider/profile", label: "Profile" },
];

export default function ProviderLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth roles={["PROVIDER"]}>
      <DashboardShell title="Provider" nav={NAV}>
        {children}
      </DashboardShell>
    </RequireAuth>
  );
}
