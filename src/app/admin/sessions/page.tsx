"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api"; // Tomar api helper
import { ErrorState } from "@/components/ui"; // Jodi na thake tahole simple error text dibe

interface SessionData {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string; // BetterAuth e mostly createdAt ba expiresAt thake
  user: {
    name: string;
    email: string;
    role?: string;
  };
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend er /admin/sessions endpoint e call
      const response = await api.get("/admin/sessions");
      const data = (response as any)?.data ?? response;
      setSessions(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // User-Agent string ke ektu clean kore dekhanor jonno (optional helper)
  const formatDevice = (ua?: string) => {
    if (!ua) return "Unknown Device";
    if (ua.includes("Windows")) return "Windows PC";
    if (ua.includes("Mac OS")) return "Mac / iOS";
    if (ua.includes("Android")) return "Android Device";
    if (ua.includes("Linux")) return "Linux PC";
    return "Other Device";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">User Login History</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Monitor active sessions, IP addresses, and login devices for security.
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-neutral-200 rounded w-full"></div>
          <div className="h-10 bg-neutral-200 rounded w-full"></div>
          <div className="h-10 bg-neutral-200 rounded w-full"></div>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSessions} />
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center text-neutral-500">
          No login sessions found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-900 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">IP Address</th>
                  <th className="px-6 py-4 font-semibold">Device / Browser</th>
                  <th className="px-6 py-4 font-semibold">Login Time</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-900">{session.user?.name || "Unknown"}</div>
                      <div className="text-xs text-neutral-500">{session.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {session.ipAddress || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-800">{formatDevice(session.userAgent)}</div>
                      <div className="text-xs text-neutral-500 truncate max-w-[200px]" title={session.userAgent}>
                        {session.userAgent || "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(session.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}