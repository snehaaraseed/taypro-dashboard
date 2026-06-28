"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface InsightRow {
  title: string;
  description: string;
  slug: string;
  reportType: string;
  period: string | null;
  publishDate: string;
  published?: boolean;
}

export default function AdminInsightsPage() {
  const router = useRouter();
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    void fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch("/api/admin/insight/list");
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights);
      } else if (response.status === 401) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Delete insight "${title}"? This cannot be undone.`)) return;
    setDeleteLoading(slug);
    try {
      const response = await fetch(`/api/admin/insight/${slug}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setInsights((prev) => prev.filter((i) => i.slug !== slug));
      } else {
        const data = await response.json();
        alert(data.error ?? "Delete failed");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#052638]">Insights</h1>
          <p className="mt-1 text-sm text-gray-600">
            Category Pulse reports are generated monthly by automation. Edit or
            unpublish here if needed.
          </p>
        </div>
        <Link
          href="/insights"
          target="_blank"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View public hub
        </Link>
      </div>

      {insights.length === 0 ? (
        <p className="text-gray-600">No insights yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {insights.map((insight) => (
                <tr key={insight.slug}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {insight.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {insight.reportType}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {insight.period ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        insight.published !== false
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {insight.published !== false ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/admin/insights/${insight.slug}/edit`)
                      }
                      className="mr-3 text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void handleDelete(insight.slug, insight.title)
                      }
                      disabled={deleteLoading === insight.slug}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deleteLoading === insight.slug ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
