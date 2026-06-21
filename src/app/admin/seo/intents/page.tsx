"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type IntentRecord = {
  intentFamily: string;
  subAngle?: string | null;
  title: string;
  slug: string;
  writtenAt: string;
  source: string;
};

type KeywordCluster = {
  keyword: string;
  coveredFamilies: string[];
  uncoveredFamilies: string[];
  gapScore: number;
  postCount: number;
  records: IntentRecord[];
  gscGaps: { query: string; intentFamily: string; impressions: number; position: number }[];
};

type RegistryResponse = {
  updatedAt: string;
  keywordCount: number;
  keywords: KeywordCluster[];
};

const FAMILY_LABELS: Record<string, string> = {
  technical_howto: "Technical how-to",
  financial_roi: "Financial / ROI",
  risk_compliance: "Risk & compliance",
  comparison_alternative: "Comparison",
  troubleshooting_problem: "Troubleshooting",
};

export default function AdminIntentClustersPage() {
  const [data, setData] = useState<RegistryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const load = useCallback(async (sync = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/seo/intent-registry${sync ? "?sync=true" : ""}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to load intent registry");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSync = async () => {
    setSyncing(true);
    await load(true);
  };

  const filtered =
    data?.keywords.filter((k) =>
      filter.trim()
        ? k.keyword.includes(filter.trim().toLowerCase())
        : true
    ) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#052638]">
            Keyword intent clusters
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track which search intents are covered per keyword (prevents cannibalization).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
          >
            {syncing ? "Syncing…" : "Sync from published topics"}
          </button>
          <Link
            href="/admin/blogs"
            className="px-4 py-2 rounded-md border border-gray-300 text-sm"
          >
            Back to blogs
          </Link>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </p>
      )}

      {data && (
        <p className="text-xs text-gray-500 mb-4">
          Registry updated {new Date(data.updatedAt).toLocaleString()} ·{" "}
          {data.keywordCount} keywords tracked
        </p>
      )}

      <input
        type="search"
        placeholder="Filter keywords…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-6 w-full max-w-md border border-gray-300 rounded-md px-3 py-2 text-sm"
      />

      {loading && !data ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((cluster) => (
            <section
              key={cluster.keyword}
              className="border border-gray-200 rounded-lg bg-white overflow-hidden"
            >
              <header className="px-4 py-3 bg-gray-50 border-b flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-medium text-[#052638]">{cluster.keyword}</h2>
                <span className="text-xs text-gray-600">
                  {cluster.gapScore}/5 intents open · {cluster.postCount} post
                  {cluster.postCount === 1 ? "" : "s"}
                </span>
              </header>
              <div className="px-4 py-3 grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700 mb-1">Covered intents</p>
                  {cluster.coveredFamilies.length === 0 ? (
                    <p className="text-gray-500">None yet</p>
                  ) : (
                    <ul className="list-disc pl-5 space-y-0.5">
                      {cluster.coveredFamilies.map((f) => (
                        <li key={f}>
                          {FAMILY_LABELS[f] ?? f}{" "}
                          <span className="text-gray-400">({f})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-1">Open intents</p>
                  {cluster.uncoveredFamilies.length === 0 ? (
                    <p className="text-green-700">All 5 families covered</p>
                  ) : (
                    <ul className="list-disc pl-5 space-y-0.5 text-amber-800">
                      {cluster.uncoveredFamilies.map((f) => (
                        <li key={f}>{FAMILY_LABELS[f] ?? f}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {cluster.gscGaps.length > 0 && (
                <div className="px-4 pb-3 text-sm">
                  <p className="font-medium text-gray-700 mb-1">GSC gaps</p>
                  <ul className="text-gray-600 space-y-1">
                    {cluster.gscGaps.slice(0, 3).map((g) => (
                      <li key={g.query}>
                        &quot;{g.query}&quot; → {g.intentFamily} ({g.impressions}{" "}
                        imp, pos {g.position.toFixed(1)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {cluster.records.length > 0 && (
                <table className="w-full text-sm border-t">
                  <thead className="bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-4 py-2 font-medium">Post</th>
                      <th className="px-4 py-2 font-medium">Intent</th>
                      <th className="px-4 py-2 font-medium">Sub-angle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cluster.records.map((r) => (
                      <tr key={r.slug} className="border-t border-gray-100">
                        <td className="px-4 py-2">
                          <Link
                            href={`/blog/${r.slug}`}
                            className="text-blue-700 hover:underline"
                            target="_blank"
                          >
                            {r.title}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-gray-700">{r.intentFamily}</td>
                        <td className="px-4 py-2 text-gray-500">
                          {r.subAngle ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          ))}
          {filtered.length === 0 && (
            <p className="text-gray-500">No keywords match your filter.</p>
          )}
        </div>
      )}
    </div>
  );
}
