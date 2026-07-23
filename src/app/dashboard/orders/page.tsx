"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { OrderCard } from "@/components/order-card";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Field,
  Select,
  Spinner,
  Textarea,
} from "@/components/ui";
import { api, asArray, getErrorMessage } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_CATEGORY_LABELS,
  type Complaint,
  type Order,
} from "@/lib/types";
import { statusBadgeClass } from "@/lib/utils";
import { complaintSchema, zodFieldErrors } from "@/lib/validators";

function ComplaintSection({
  order,
  complaint,
  onCreated,
}: {
  order: Order;
  complaint: Complaint | null;
  onCreated: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (complaint) {
    return (
      <div className="rounded-lg bg-neutral-50 p-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-neutral-700">Reported issue:</span>
          <span className="text-neutral-600">
            {COMPLAINT_CATEGORY_LABELS[complaint.category ?? ""] ??
              complaint.category}
          </span>
          <Badge className={statusBadgeClass(complaint.status)}>
            {complaint.status ?? "OPEN"}
          </Badge>
        </div>
        {complaint.resolution ? (
          <p className="mt-2 text-neutral-600">
            <span className="font-medium text-neutral-700">Response:</span>{" "}
            {complaint.resolution}
          </p>
        ) : (
          <p className="mt-2 text-neutral-500">
            We have shared this with the restaurant and our team. Their
            response will appear here.
          </p>
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="ghost" onClick={() => setOpen(true)}>
        Report an issue
      </Button>
    );
  }

  const handleSubmit = async () => {
    const parsed = complaintSchema.safeParse({ category, description });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await api.post("/complaints", {
        orderId: order.id,
        category: parsed.data.category,
        description: parsed.data.description,
      });
      toast("Thanks! Your complaint has been submitted.", "success");
      setOpen(false);
      onCreated();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-neutral-800">Report an issue</p>
      <Field label="What went wrong?" error={errors.category}>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select a category</option>
          {COMPLAINT_CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {COMPLAINT_CATEGORY_LABELS[option]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Describe the issue" error={errors.description}>
        <Textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell us what happened with this order..."
        />
      </Field>
      <div className="flex items-center gap-2">
        <Button loading={saving} onClick={handleSubmit}>
          Submit complaint
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComplaints = useCallback(async () => {
    try {
      const payload = await api.get("/complaints/my");
      setComplaints(asArray<Complaint>(payload));
    } catch {
      // Complaints are best-effort; orders still render without them.
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await api.get("/orders");
      setOrders(asArray<Order>(payload));
      void loadComplaints();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [loadComplaints]);

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

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={"\uD83D\uDCE6"}
        title="No orders yet"
        description="When you place an order, it will show up here."
        action={
          <Link
            href="/meals"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-600 px-5 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Browse meals
          </Link>
        }
      />
    );
  }

  const complaintByOrder = new Map(
    complaints.map((complaint) => [complaint.orderId, complaint]),
  );

  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <OrderCard
          key={order.id ?? index}
          order={order}
          actions={
            <ComplaintSection
              order={order}
              complaint={complaintByOrder.get(order.id) ?? null}
              onCreated={loadComplaints}
            />
          }
        />
      ))}
    </div>
  );
}