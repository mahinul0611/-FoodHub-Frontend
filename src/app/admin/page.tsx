"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyState, ErrorState, Spinner } from "@/components/ui";
import { api, getErrorMessage, unwrap } from "@/lib/api";
import { formatPrice, prettifyKey } from "@/lib/utils";

function isMoneyKey(key: string): boolean {
  const lower = key.toLowerCase();
  return (
    lower.includes("revenue") ||
    lower.includes("price") ||
    lower.includes("amount") ||
    lower.includes("earning") ||
    lower.includes("sales")
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = unwrap<unknown>(await api.get("/admin/stats"));
      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        setStats(raw as Record<string, unknown>);
      } else {
        setStats(null);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  const entries = stats
    ? Object.entries(stats).filter(([, value]) => typeof value === "number")
    : [];

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={"\uD83D\uDCCA"}
        title="No stats available"
        description="Platform statistics will appear here once there is activity."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="rounded-xl border border-neutral-200 bg-white p-6"
        >
          <p className="text-sm text-neutral-500">{prettifyKey(key)}</p>
          <p className="mt-1 text-3xl font-bold text-neutral-900">
            {isMoneyKey(key) ? formatPrice(value as number) : String(value)}
          </p>
        </div>
      ))}
    </div>
  );
}
