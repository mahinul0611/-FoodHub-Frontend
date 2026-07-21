"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Select,
  Spinner,
} from "@/components/ui";
import { api, asArray, getErrorMessage } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { USER_STATUSES, type AppUser } from "@/lib/types";
import { formatDate, roleOf, statusBadgeClass } from "@/lib/utils";

function UserStatusControl({
  user,
  onUpdated,
}: {
  user: AppUser;
  onUpdated: (status: string) => void;
}) {
  const { toast } = useToast();
  const currentStatus =
    typeof user.status === "string" ? user.status : USER_STATUSES[0];
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const options = Array.from(
    new Set([...USER_STATUSES, currentStatus].filter(Boolean)),
  ) as string[];

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/users/${user.id}`, { status });
      toast("User status updated", "success");
      onUpdated(status);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        aria-label={`Status for ${user.name ?? user.email}`}
        className="min-w-[130px]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      <Button
        variant="secondary"
        className="min-h-0 px-3 py-1.5 text-xs"
        loading={saving}
        disabled={status === currentStatus}
        onClick={handleSave}
      >
        Save
      </Button>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await api.get("/admin/users");
      setUsers(asArray<AppUser>(payload));
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

  if (users.length === 0) {
    return (
      <EmptyState
        icon={"\uD83D\uDC65"}
        title="No users found"
        description="Registered users will appear here."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-400">
          <tr>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Phone</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {users.map((user) => {
            const role = roleOf(user);
            return (
              <tr key={user.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900">
                    {user.name ?? "\u2014"}
                  </p>
                  <p className="text-xs text-neutral-400">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge className={statusBadgeClass(role)}>{role}</Badge>
                </td>
                <td className="px-4 py-3">{user.phone ?? "\u2014"}</td>
                <td className="px-4 py-3">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">
                  {role === "ADMIN" ? (
                    <span className="text-xs text-neutral-400">
                      Admin account
                    </span>
                  ) : (
                    <UserStatusControl
                      user={user}
                      onUpdated={(status) =>
                        setUsers((current) =>
                          current.map((u) =>
                            u.id === user.id ? { ...u, status } : u,
                          ),
                        )
                      }
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
