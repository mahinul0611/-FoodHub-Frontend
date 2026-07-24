"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { api, unwrap, getErrorMessage } from "@/lib/api";
import {
  Button,
  ErrorState,
  PageHeader,
  Spinner,
  Badge,
} from "@/components/ui";
import { useToast } from "@/lib/toast-context";
import { Pagination } from "@/components/pagination";

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isDeleted?: boolean;
}

const PAGE_SIZE = 10;

export default function AdminProvidersPage() {
  const { toast } = useToast();
  const [providers, setProviders] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const loadProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
      await api.delete(`/admin/providers/${userId}`);
      toast(`Provider "${name}" removed successfully`, "success");
      
      const updated = providers.filter((p) => p.id !== userId);
      setProviders(updated);

      const newTotalPages = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
      if (page > newTotalPages) {
        setPage(newTotalPages);
      }
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(providers.length / PAGE_SIZE));

  const paginatedProviders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return providers.slice(start, start + PAGE_SIZE);
  }, [providers, page]);

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            {paginatedProviders.map((provider) => (
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

      {totalPages > 1 ? (
        <div className="pt-2">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>
      ) : null}
    </div>
  );
}