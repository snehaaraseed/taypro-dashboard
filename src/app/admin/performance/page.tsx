"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Opportunity = { id: string; title: string; savingsMs: number };

type PageRow = {
  url: string;
  pathname: string;
  template: string;
  mobileScore: number | null;
  previousMobileScore?: number;
  scoreDelta?: number;
  lcp: string;
  cls: string;
  tbt: string;
  gscImpressions: number;
  gscClicks: number;
  impactScore: number;
  topOpportunities: Opportunity[];
  error?: string;
};

type FixCluster = {
  auditId: string;
  title: string;
  pagesAffected: number;
  totalSavingsMs: number;
  sampleUrl: string;
};

type PagespeedAlert = {
  id: string;
  url: string;
  pathname: string;
  template: string;
  reason: string;
  severity: "critical" | "warning";
  mobileScore: number | null;
  previousMobileScore?: number;
  scoreDelta?: number;
  lcpMs: number | null;
  gscImpressions: number;
  gscClicks: number;
  impactScore: number;
  topOpportunity?: string;
  createdAt: string;
};

type AlertsSnapshot = {
  runId: string;
  updatedAt: string;
  alerts: PagespeedAlert[];
  newAlertCount: number;
  resolvedCount: number;
};

type TemplateGroup = {
  template: string;
  pageCount: number;
  medianScore: number;
  worstUrl: string;
  worstScore: number;
};

type Summary = {
  runId: string;
  updatedAt: string;
  scope: { strategy: string; auditScope: string; urlCount: number };
  previousRunId?: string;
  siteMedianScore: number;
  scoreDelta?: number;
  pagesBelow50: number;
  pagesBelow70: number;
  priorityQueue: PageRow[];
  fixClusters: FixCluster[];
  templateGroups: TemplateGroup[];
  allPages: PageRow[];
};

function scoreClass(score: number | null): string {
  if (score == null) return "text-gray-500";
  if (score < 50) return "text-red-700 font-semibold";
  if (score < 70) return "text-amber-700 font-medium";
  return "text-green-700";
}

function formatDelta(delta?: number): string {
  if (delta == null) return "—";
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

export default function AdminPerformancePage() {
  const [data, setData] = useState<Summary | null>(null);
  const [alerts, setAlerts] = useState<AlertsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [view, setView] = useState<"priority" | "all" | "clusters" | "templates">(
    "priority"
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, alertsRes] = await Promise.all([
        fetch("/api/admin/pagespeed/summary", { credentials: "include" }),
        fetch("/api/admin/pagespeed/alerts", { credentials: "include" }),
      ]);
      if (summaryRes.status === 404) {
        setData(null);
      } else if (!summaryRes.ok) {
        throw new Error("Failed to load PageSpeed report");
      } else {
        setData(await summaryRes.json());
      }

      if (alertsRes.ok) {
        setAlerts(await alertsRes.json());
      } else {
        setAlerts(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRun = async () => {
    if (
      !confirm(
        "Run a full PageSpeed audit now? This may take ~10 minutes for ~288 URLs."
      )
    ) {
      return;
    }
    setRunning(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/pagespeed/run", {
        method: "POST",
        credentials: "include",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Audit failed");
      setMessage(body.message || "Audit complete");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Audit failed");
    } finally {
      setRunning(false);
    }
  };

  const filteredPages =
    (view === "priority" ? data?.priorityQueue : data?.allPages)?.filter((p) =>
      filter.trim()
        ? p.url.toLowerCase().includes(filter.trim().toLowerCase()) ||
          p.pathname.toLowerCase().includes(filter.trim().toLowerCase()) ||
          p.template.includes(filter.trim().toLowerCase())
        : true
    ) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#052638]">
            PageSpeed performance
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Monthly mobile audits ranked by traffic impact. Fix top clusters first
            — one template fix often improves hundreds of pages.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
          >
            {running ? "Running audit…" : "Run audit now"}
          </button>
          <Link
            href="/admin/gsc"
            className="px-4 py-2 rounded-md border border-gray-300 text-sm"
          >
            Search Console
          </Link>
        </div>
      </div>

      {message && (
        <p className="mb-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded p-3">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </p>
      )}

      {loading && !data ? (
        <p className="text-gray-500">Loading…</p>
      ) : !data ? (
        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-600">
          <p className="mb-4">No PageSpeed report yet.</p>
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
          >
            {running ? "Running…" : "Run first audit"}
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-4">
            Run {data.runId} · updated{" "}
            {new Date(data.updatedAt).toLocaleString()} · {data.scope.urlCount}{" "}
            URLs ({data.scope.auditScope}, {data.scope.strategy})
            {data.previousRunId ? ` · prev ${data.previousRunId}` : ""}
          </p>

          {alerts && alerts.alerts.length > 0 ? (
            <div className="mb-6 border border-amber-200 bg-amber-50 rounded-lg p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h2 className="text-sm font-semibold text-amber-900">
                  Performance alerts ({alerts.alerts.length})
                </h2>
                <p className="text-xs text-amber-800">
                  {alerts.newAlertCount} new · {alerts.resolvedCount} resolved
                  since last run
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-amber-900/80">
                    <tr>
                      <th className="px-2 py-1 font-medium">Page</th>
                      <th className="px-2 py-1 font-medium">Severity</th>
                      <th className="px-2 py-1 font-medium">Reason</th>
                      <th className="px-2 py-1 font-medium">Score</th>
                      <th className="px-2 py-1 font-medium">LCP</th>
                      <th className="px-2 py-1 font-medium">GSC imp</th>
                      <th className="px-2 py-1 font-medium">Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.alerts.slice(0, 12).map((alert) => (
                      <tr key={alert.id} className="border-t border-amber-100">
                        <td className="px-2 py-2 max-w-xs truncate">
                          <a
                            href={alert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-900 hover:underline"
                            title={alert.url}
                          >
                            {alert.pathname}
                          </a>
                        </td>
                        <td className="px-2 py-2">
                          <span
                            className={
                              alert.severity === "critical"
                                ? "text-red-700 font-medium"
                                : "text-amber-800"
                            }
                          >
                            {alert.severity}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-amber-900">
                          {alert.reason.replace(/_/g, " ")}
                        </td>
                        <td className="px-2 py-2">
                          {alert.mobileScore ?? "—"}
                          {alert.scoreDelta != null ? (
                            <span className="text-xs text-amber-800 ml-1">
                              ({formatDelta(alert.scoreDelta)})
                            </span>
                          ) : null}
                        </td>
                        <td className="px-2 py-2">
                          {alert.lcpMs != null
                            ? `${(alert.lcpMs / 1000).toFixed(1)}s`
                            : "—"}
                        </td>
                        <td className="px-2 py-2">
                          {alert.gscImpressions.toLocaleString()}
                        </td>
                        <td className="px-2 py-2 font-medium">
                          {alert.impactScore.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="border rounded-lg p-4 bg-white">
              <p className="text-xs text-gray-500">Median score</p>
              <p className={`text-2xl font-semibold ${scoreClass(data.siteMedianScore)}`}>
                {data.siteMedianScore}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Δ {formatDelta(data.scoreDelta)}
              </p>
            </div>
            <div className="border rounded-lg p-4 bg-white">
              <p className="text-xs text-gray-500">Below 50</p>
              <p className="text-2xl font-semibold text-red-700">
                {data.pagesBelow50}
              </p>
            </div>
            <div className="border rounded-lg p-4 bg-white">
              <p className="text-xs text-gray-500">Below 70</p>
              <p className="text-2xl font-semibold text-amber-700">
                {data.pagesBelow70}
              </p>
            </div>
            <div className="border rounded-lg p-4 bg-white">
              <p className="text-xs text-gray-500">Fix clusters</p>
              <p className="text-2xl font-semibold text-[#052638]">
                {data.fixClusters.length}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {(
              [
                ["priority", "Priority queue"],
                ["all", "All pages"],
                ["clusters", "Fix clusters"],
                ["templates", "Templates"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className={`px-3 py-1.5 rounded-md text-sm border ${
                  view === id
                    ? "bg-blue-100 border-blue-300 text-blue-800"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {(view === "priority" || view === "all") && (
            <>
              <input
                type="search"
                placeholder="Filter by URL, path, or template…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="mb-4 w-full max-w-md border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-3 py-2 font-medium">Page</th>
                      <th className="px-3 py-2 font-medium">Template</th>
                      <th className="px-3 py-2 font-medium">Score</th>
                      <th className="px-3 py-2 font-medium">Δ</th>
                      <th className="px-3 py-2 font-medium">LCP</th>
                      <th className="px-3 py-2 font-medium">GSC imp</th>
                      <th className="px-3 py-2 font-medium">Impact</th>
                      <th className="px-3 py-2 font-medium">Top fix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPages.map((p) => (
                      <tr key={p.url} className="border-t border-gray-100">
                        <td className="px-3 py-2 max-w-xs truncate">
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:underline"
                            title={p.url}
                          >
                            {p.pathname}
                          </a>
                          {p.error && (
                            <span className="block text-xs text-red-600">
                              {p.error}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-600">{p.template}</td>
                        <td className={`px-3 py-2 ${scoreClass(p.mobileScore)}`}>
                          {p.mobileScore ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {formatDelta(p.scoreDelta)}
                        </td>
                        <td className="px-3 py-2 text-gray-600">{p.lcp}</td>
                        <td className="px-3 py-2 text-gray-600">
                          {p.gscImpressions.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 font-medium">
                          {p.impactScore.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-gray-600 max-w-xs truncate">
                          {p.topOpportunities[0]?.title ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredPages.length === 0 && (
                  <p className="p-4 text-gray-500">No pages match your filter.</p>
                )}
              </div>
            </>
          )}

          {view === "clusters" && (
            <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-3 py-2 font-medium">Issue</th>
                    <th className="px-3 py-2 font-medium">Pages</th>
                    <th className="px-3 py-2 font-medium">Total savings</th>
                    <th className="px-3 py-2 font-medium">Sample</th>
                  </tr>
                </thead>
                <tbody>
                  {data.fixClusters.map((c) => (
                    <tr key={c.auditId} className="border-t border-gray-100">
                      <td className="px-3 py-2">{c.title}</td>
                      <td className="px-3 py-2">{c.pagesAffected}</td>
                      <td className="px-3 py-2">~{c.totalSavingsMs.toLocaleString()} ms</td>
                      <td className="px-3 py-2 max-w-xs truncate">
                        <a
                          href={c.sampleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:underline"
                        >
                          {c.sampleUrl.replace(/^https?:\/\/[^/]+/, "")}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === "templates" && (
            <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-3 py-2 font-medium">Template</th>
                    <th className="px-3 py-2 font-medium">Pages</th>
                    <th className="px-3 py-2 font-medium">Median score</th>
                    <th className="px-3 py-2 font-medium">Worst page</th>
                    <th className="px-3 py-2 font-medium">Worst score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.templateGroups.map((t) => (
                    <tr key={t.template} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-medium">{t.template}</td>
                      <td className="px-3 py-2">{t.pageCount}</td>
                      <td className={`px-3 py-2 ${scoreClass(t.medianScore)}`}>
                        {t.medianScore}
                      </td>
                      <td className="px-3 py-2 max-w-xs truncate">
                        <a
                          href={t.worstUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:underline"
                        >
                          {t.worstUrl.replace(/^https?:\/\/[^/]+/, "")}
                        </a>
                      </td>
                      <td className={`px-3 py-2 ${scoreClass(t.worstScore)}`}>
                        {t.worstScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
