"use client";

import { cn } from "@/components/ui";

const STEPS = ["PLACED", "PREPARING", "READY", "DELIVERED"] as const;

const STEP_LABELS: Record<(typeof STEPS)[number], string> = {
  PLACED: "Placed",
  PREPARING: "Preparing",
  READY: "Ready",
  DELIVERED: "Delivered",
};

export function OrderTimeline({ status }: { status?: string }) {
  const normalized = (status ?? "").toUpperCase();

  if (normalized === "CANCELLED") {
    return (
      <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(normalized as (typeof STEPS)[number]);
  if (currentIndex === -1) return null;

  return (
    <ol className="mt-3 flex items-center" aria-label="Order progress">
      {STEPS.map((step, index) => {
        const reached = index <= currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li
            key={step}
            className={cn("flex items-center", index > 0 && "flex-1")}
          >
            {index > 0 ? (
              <span
                className={cn(
                  "mx-1 h-0.5 flex-1 rounded",
                  reached ? "bg-brand-600" : "bg-neutral-200",
                )}
              />
            ) : null}
            <span className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                  reached
                    ? "bg-brand-600 text-white"
                    : "bg-neutral-200 text-neutral-500",
                )}
              >
                {reached ? "\u2713" : index + 1}
              </span>
              <span
                className={cn(
                  "text-[10px]",
                  isCurrent
                    ? "font-semibold text-brand-700"
                    : reached
                      ? "text-neutral-700"
                      : "text-neutral-400",
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}