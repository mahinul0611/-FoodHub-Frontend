"use client";

import { useEffect, useState, useCallback } from "react";
import { api, unwrap, getErrorMessage } from "@/lib/api";
import {
  Button,
  ErrorState,
  PageHeader,
  Spinner,
  Badge,
} from "@/components/ui";
import { useToast } from "@/lib/toast-context";

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isDeleted?: boolean;
}

export default function AdminProvidersPage() {
  const { toast } = useToast();
  const [providers, setProviders] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Postman collection er /admin/users theke shob user ene role "PROVIDER" filter korchi
      const data = unwrap<UserItem[]>(await api.get("/admin/users"));
      const providerList = data.filter(
        (user) => user.role === "PROVIDER" && !user.isDeleted,
      );
      setProviders(providerList);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProviders();
  }, [loadProviders]);

  const handleRemoveProvider = async (userId: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to remove "${name}" and all their associated meals?`,
      )
    ) {
      return;
    }

    setDeletingId(userId);
    try {
      // Ager banano Soft Delete API endpoint
      await api.delete(`/admin/providers/${userId}`);
      toast(`Provider "${name}" removed successfully`, "success");
      setProviders((prev) => prev.filter((p) => p.id !== userId));
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadProviders} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Providers"
        description="View all registered food providers and remove them if necessary."
      />

      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        {providers.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No active providers found.
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between p-4 sm:p-6"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-neutral-900">
                      {provider.name}
                    </h3>
                    <Badge className="border-brand-200 bg-brand-50 text-brand-700">
                      PROVIDER
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-500">Provider Email : {provider.email}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Phone: {provider.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <Button
                    type="button"
                    loading={deletingId === provider.id}
                    className="bg-red-600 text-white hover:bg-red-700 text-xs px-3 py-1.5"
                    onClick={() =>
                      handleRemoveProvider(provider.id, provider.name)
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
