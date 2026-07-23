"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api, unwrap, getErrorMessage } from "@/lib/api";
import { ErrorState, PageHeader, Spinner } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  revenueData: { date: string; revenue: number }[];
  topMealsData: { name: string; count: number }[];
}

export default function ProviderAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await api.get("/provider/analytics");
      setData(unwrap<AnalyticsData>(payload));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorState message={error || "Could not load data"} onRetry={loadData} />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        description="Monitor your restaurant's performance and sales."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h3 className="text-sm font-medium text-neutral-500">
            Total Revenue
          </h3>
          <p className="mt-2 text-3xl font-bold text-brand-600">
            {formatPrice(data.totalRevenue)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h3 className="text-sm font-medium text-neutral-500">
            Total Orders (Completed)
          </h3>
          <p className="mt-2 text-3xl font-bold text-neutral-900">
            {data.totalOrders}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h3 className="mb-6 text-base font-semibold text-neutral-900">
            Daily Revenue
          </h3>
          <div className="h-72 w-full">
            {data.revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val) => `৳${val}`}
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      formatPrice(Number(value) || 0),
                      "Revenue",
                    ]}
                    labelStyle={{ color: "black", fontWeight: "bold" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ea580c"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                No revenue data available yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h3 className="mb-6 text-base font-semibold text-neutral-900">
            Top Selling Meals
          </h3>
          <div className="h-72 w-full">
            {data.topMealsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.topMealsData}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value: any) => [value, "Items Sold"]} />
                  <Bar
                    dataKey="count"
                    fill="#f97316"
                    radius={[0, 4, 4, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                No sales data available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
