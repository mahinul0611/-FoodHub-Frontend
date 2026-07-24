"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ErrorState } from "@/components/ui";
// Tomar sothik path theke Pagination import
import { Pagination } from "@/components/pagination"; 
import { UAParser } from "ua-parser-js";

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

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const formatDevice = (uaString?: string) => {
    if (!uaString) return "Unknown Device";

    const parser = new UAParser(uaString);
    const result = parser.getResult();

    const osName = result.os.name || "Unknown OS";
    const browserName = result.browser.name || "";
    
    // Vendor ar Model (jemon: Samsung Galaxy S23 ba Xiaomi Poco X3)
    const vendor = result.device.vendor;
    const model = result.device.model;

    // Jodi Phone ba Tablet hoy
    if (vendor && model) {
      return `${vendor} ${model} (${browserName})`; // Output: Samsung SM-S918B (Chrome)
    }

    // Jodi Apple device (iPhone/iPad) kintu specific model pawa na jay
    if (result.device.type === 'mobile' || result.device.type === 'tablet') {
      return `${osName} Device ${browserName ? `(${browserName})` : ''}`;
    }

    // Jodi PC / Desktop / Laptop hoy
    if (osName.includes("Mac")) return `Mac OS ${browserName ? `(${browserName})` : ''}`;
    if (osName.includes("Windows")) return `Windows PC ${browserName ? `(${browserName})` : ''}`;
    
    return `${osName} ${browserName ? `(${browserName})` : ''}`;
  };

  const filteredSessions = sessions.filter((session) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      session.user?.email.toLowerCase().includes(searchLower) ||
      session.user?.name.toLowerCase().includes(searchLower) ||
      (session.ipAddress && session.ipAddress.includes(searchLower))
    );
  });

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
        
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by email, name or IP..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Search korle automatic page 1 e chole jabe
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
        <div className="space-y-6">
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
          </div>

          {/* Tomar banano Pagination Component */}
          {totalPages > 1 && (
            <Pagination
              page={currentPage} // ekhane 'currentPage' state theke 'page' prop e pass kora holo
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      )}
    </div>
  );
}