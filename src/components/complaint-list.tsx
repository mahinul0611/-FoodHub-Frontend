"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Select,
  Spinner,
  Textarea,
} from "@/components/ui";
import { api, asArray, getErrorMessage } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import {
  COMPLAINT_CATEGORY_LABELS,
  COMPLAINT_STATUSES,
  type Complaint,
} from "@/lib/types";
import { formatDate, statusBadgeClass } from "@/lib/utils";

function ComplaintManager({
  complaint,
  onUpdated,
}: {
  complaint: Complaint;
  onUpdated: () => void;
}) {
  const { toast } = useToast();
  const [status, setStatus] = useState(complaint.status ?? "OPEN");
  const [resolution, setResolution] = useState(complaint.resolution ?? "");
  const [saving, setSaving] = useState(false);

  const options = Array.from(
    new Set([...COMPLAINT_STATUSES, complaint.status].filter(Boolean)),
  ) as string[];

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.patch(`/complaints/${complaint.id}`, {
        status,
        resolution: resolution.trim() || undefined,
      });
      toast("Complaint updated", "success");
      onUpdated();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        rows={2}
        value={resolution}
        onChange={(e) => setResolution(e.target.value)}
        placeholder="Write a response for the customer..."
        aria-label="Resolution message"
      />
      <div className="flex items-center gap-2">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Complaint status"
          className="min-w-[140px]"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Button variant="secondary" loading={saving} onClick={handleUpdate}>
          Update
        </Button>
      </div>
    </div>
  );
}

export function ComplaintList({
  endpoint,
  showProvider = false,
}: {
  endpoint: string;
  showProvider?: boolean;
}) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await api.get(endpoint);
      setComplaints(asArray<Complaint>(payload));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

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

  if (complaints.length === 0) {
    return (
      <EmptyState
        icon={"\uD83D\uDCED"}
        title="No complaints"
        description="Reported order issues will show up here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <div
          key={complaint.id}
          className="rounded-xl border border-neutral-200 bg-white p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                Order #{String(complaint.orderId ?? "").slice(0, 8)}{" "}
                {"\u00B7"}{" "}
                {COMPLAINT_CATEGORY_LABELS[complaint.category ?? ""] ??
                  complaint.category}
              </p>
              <p className="text-xs text-neutral-500">
                {formatDate(complaint.createdAt)}
              </p>
            </div>
            <Badge className={statusBadgeClass(complaint.status)}>
              {complaint.status ?? "OPEN"}
            </Badge>
          </div>

          <p className="mt-3 text-sm text-neutral-700">
            {complaint.description}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            <span className="font-medium text-neutral-600">Customer:</span>{" "}
            {complaint.user?.name ?? complaint.user?.email ?? "Unknown"}
            {showProvider ? (
              <>
                {" \u00B7 "}
                <span className="font-medium text-neutral-600">
                  Restaurant:
                </span>{" "}
                {complaint.provider?.name ??
                  complaint.provider?.email ??
                  "Unknown"}
              </>
            ) : null}
          </p>

          <div className="mt-4 border-t border-neutral-100 pt-4">
            <ComplaintManager complaint={complaint} onUpdated={load} />
          </div>
        </div>
      ))}
    </div>
  );
}