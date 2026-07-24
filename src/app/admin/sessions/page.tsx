"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ErrorState } from "@/components/ui";

interface SessionData {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
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

  // Search ar Pagination er jonno notun states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Ek page e 10 ta kore data dekhabe

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
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

  const formatDevice = (ua?: string) => {
    if (!ua) return "Unknown Device";
    if (ua.includes("Windows")) return "Windows PC";
    if (ua.includes("Mac OS")) return "Mac / iOS";
    if (ua.includes("Android")) return "Android Device";
    if (ua.includes("Linux")) return "Linux PC";
    return "Other Device";
  };

  // 1. Search Logic: Email, Name ba IP diye filter kora
  const filteredSessions = sessions.filter((session) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      session.user?.email.toLowerCase().includes(searchLower) ||
      session.user?.name.toLowerCase().includes(searchLower) ||
      (session.ipAddress && session.ipAddress.includes(searchLower))
    );
  });

  // 2. Pagination Logic: filtered list theke shudhu current page er data ber kora
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">User Login History</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Monitor active sessions, IP addresses, and login devices for security.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by email, name or IP..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Search korle page 1 theke shuru hobe
            }}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-neutral-200 rounded w-full"></div>
          <div className="h-10 bg-neutral-200 rounded w-full"></div>
          <div className="h-10 bg-neutral-200 rounded w-full"></div>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSessions} />
      ) : filteredSessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center text-neutral-500">
          No matching sessions found.
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
                {paginatedSessions.map((session) => (
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-6 py-3">
              <span className="text-sm text-neutral-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSessions.length)} of {filteredSessions.length} entries
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded border border-neutral-300 px-3 py-1 text-sm font-medium text-neutral-700 disabled:opacity-50 hover:bg-neutral-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded border border-neutral-300 px-3 py-1 text-sm font-medium text-neutral-700 disabled:opacity-50 hover:bg-neutral-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}