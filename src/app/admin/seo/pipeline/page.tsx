"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Snapshot = {
  generatedAt: string;
  briefQueue: {
    stats: { total: number; open: number; filled: number; rejected: number };
    open: {
      id: string;
      title: string;
      primaryKeyword: string;
      score: number;
      domainId: string;
    }[];
  };
  curatedTopics: {
    total: number;
    stats: Record<string, number>;
    pending: { id: string; title: string; category: string; primaryKeyword: string }[];
  };
  gsc: {
    configured: boolean;
    updatedAt: string | null;
    keywordCount: number;
    topOpportunities: {
      query: string;
      impressions: number;
      position: number;
      score: number;
      reason: string;
    }[];
  };
  seoBlogQueue: string[];
  keywordCampaigns: {
    updatedAt: string | null;
    eligible: number;
    cooldown: number;
    saturated: number;
    topEligible: { keyword: string; gscScore: number; status: string }[];
  };
  editorialCalendar: {
    generatedAt: string | null;
    daysScheduled: number;
    nextDays: {
      date: string;
      primaryBriefId: string | null;
      backupBriefId: string | null;
    }[];
  };
  publishedBlogCount: number;
  blogAutomation: {
    canGenerate: boolean;
    requiredGapDays: number;
    daysSinceLastRun: number | null;
    daysUntilEligible: number | null;
    nextEligibleAt: string | null;
    blackoutToday: boolean;
    blackoutReason: string | null;
    writerStartIst: string;
    narrativeFormatShare: number;
    translationStagger: { locale: string; dayOffset: number }[];
  };
  dataFiles: {
    name: string;
    exists: boolean;
    updatedAt: string | null;
    sizeKb: number;
  }[];
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-[#052638] mt-1">{value}</p>
      {hint ? <p className="text-xs text-gray-400 mt-1">{hint}</p> : null}
    </div>
  );
}

export default function AdminSeoPipelinePage() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/seo/pipeline", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load pipeline data");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (
    action: string,
    extra?: Record<string, unknown>
  ) => {
    setActing(action);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/seo/pipeline", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Action failed");
      if (json.snapshot) setData(json.snapshot);
      if (json.result?.added != null) {
        setMessage(`Added ${json.result.added} brief(s) to the writer queue.`);
      } else if (json.result?.openBriefs != null) {
        setMessage(
          `Discovery complete: ${json.result.added} briefs added (${json.result.openBriefs} open).`
        );
      } else {
        setMessage("Action completed.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#052638]">
            SEO & Blog Pipeline
          </h1>
          <p className="text-gray-600 mt-2 max-w-3xl">
            View GSC data, brief queue, curated topics, keyword campaigns, and
            on-disk automation stores. Enqueue curated topics into the daily blog
            writer without waiting for grounded discovery.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh
          </button>
          <Link
            href="/admin/gsc"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            GSC settings
          </Link>
          <Link
            href="/admin/seo/intents"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            Intent clusters
          </Link>
        </div>
      </div>

      {message ? (
        <div className="p-4 rounded-md bg-green-50 text-green-800 text-sm">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="p-4 rounded-md bg-red-50 text-red-800 text-sm">
          {error}
        </div>
      ) : null}

      {loading && !data ? (
        <p className="text-gray-500">Loading pipeline data…</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard label="Open briefs" value={data.briefQueue.stats.open} />
            <StatCard
              label="Curated pending"
              value={data.curatedTopics.stats.pending ?? 0}
              hint={`of ${data.curatedTopics.total}`}
            />
            <StatCard
              label="Published blogs"
              value={data.publishedBlogCount}
            />
            <StatCard
              label="GSC keywords"
              value={data.gsc.keywordCount}
              hint={data.gsc.configured ? "connected" : "not configured"}
            />
            <StatCard
              label="Campaign eligible"
              value={data.keywordCampaigns.eligible}
            />
            <StatCard
              label="Calendar days"
              value={data.editorialCalendar.daysScheduled}
            />
          </div>

          <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
            <h2 className="text-xl font-semibold text-[#052638]">
              Blog automation cadence
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Can write today</p>
                <p className="font-medium text-[#052638]">
                  {data.blogAutomation.canGenerate ? "Yes" : "No"}
                  {data.blogAutomation.blackoutToday
                    ? ` (${data.blogAutomation.blackoutReason})`
                    : ""}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Required gap</p>
                <p className="font-medium text-[#052638]">
                  {data.blogAutomation.requiredGapDays} day(s)
                </p>
              </div>
              <div>
                <p className="text-gray-500">Days since last write</p>
                <p className="font-medium text-[#052638]">
                  {data.blogAutomation.daysSinceLastRun ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Writer start (IST)</p>
                <p className="font-medium text-[#052638]">
                  {data.blogAutomation.writerStartIst}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Next eligible</p>
                <p className="font-medium text-[#052638]">
                  {data.blogAutomation.nextEligibleAt
                    ? new Date(data.blogAutomation.nextEligibleAt).toLocaleString(
                        "en-IN",
                        { timeZone: "Asia/Kolkata" }
                      )
                    : "Now (if not blackout)"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Narrative format share</p>
                <p className="font-medium text-[#052638]">
                  {Math.round(data.blogAutomation.narrativeFormatShare * 100)}%
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-500">Translation stagger</p>
                <p className="font-medium text-[#052638]">
                  {data.blogAutomation.translationStagger.length > 0
                    ? data.blogAutomation.translationStagger
                        .map((s) => `${s.locale}+${s.dayOffset}d`)
                        .join(", ")
                    : "disabled"}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-[#052638]">
                Curated topic backlog
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!!acting}
                  onClick={() => runAction("enqueue-curated", { limit: 25 })}
                  className="px-4 py-2 bg-[#A8C117] hover:bg-lime-500 text-[#052638] rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {acting === "enqueue-curated"
                    ? "Enqueueing…"
                    : "Enqueue next 25"}
                </button>
                <button
                  type="button"
                  disabled={!!acting}
                  onClick={() => runAction("enqueue-all-pending")}
                  className="px-4 py-2 bg-[#052638] hover:bg-slate-800 text-white rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {acting === "enqueue-all-pending"
                    ? "Enqueueing…"
                    : "Enqueue all pending"}
                </button>
                <button
                  type="button"
                  disabled={!!acting}
                  onClick={() =>
                    runAction("run-discovery", { discoveryTarget: 12 })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  {acting === "run-discovery"
                    ? "Running…"
                    : "Run grounded discovery"}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              {Object.entries(data.curatedTopics.stats).map(([k, v]) => (
                <span
                  key={k}
                  className="px-2 py-1 rounded bg-gray-100 text-gray-700"
                >
                  {k}: {v}
                </span>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2">Keyword</th>
                  </tr>
                </thead>
                <tbody>
                  {data.curatedTopics.pending.slice(0, 15).map((row) => (
                    <tr key={row.id} className="border-b border-gray-100">
                      <td className="py-2 pr-4 text-gray-900">{row.title}</td>
                      <td className="py-2 pr-4 text-gray-600">{row.category}</td>
                      <td className="py-2 text-gray-600">{row.primaryKeyword}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(data.curatedTopics.stats.pending ?? 0) > 15 ? (
                <p className="text-xs text-gray-400 mt-2">
                  Showing 15 of {data.curatedTopics.stats.pending} pending
                  topics.
                </p>
              ) : null}
            </div>
          </section>

          <div className="grid lg:grid-cols-2 gap-6">
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-[#052638] mb-4">
                Open brief queue
              </h2>
              <ul className="space-y-3 text-sm max-h-96 overflow-y-auto">
                {data.briefQueue.open.length === 0 ? (
                  <li className="text-gray-500">No open briefs — enqueue curated topics or run discovery.</li>
                ) : (
                  data.briefQueue.open.map((b) => (
                    <li key={b.id} className="border-b border-gray-100 pb-2">
                      <p className="font-medium text-gray-900">{b.title}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {b.primaryKeyword} · score {b.score} · {b.domainId}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </section>

            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-[#052638] mb-4">
                GSC opportunities
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                Last sync:{" "}
                {data.gsc.updatedAt
                  ? new Date(data.gsc.updatedAt).toLocaleString()
                  : "never"}
              </p>
              <ul className="space-y-2 text-sm max-h-96 overflow-y-auto">
                {data.gsc.topOpportunities.length === 0 ? (
                  <li className="text-gray-500">
                    No GSC data — connect and sync from{" "}
                    <Link href="/admin/gsc" className="text-blue-600 underline">
                      Search Console
                    </Link>
                    .
                  </li>
                ) : (
                  data.gsc.topOpportunities.map((o) => (
                    <li
                      key={o.query}
                      className="flex justify-between gap-2 border-b border-gray-100 pb-2"
                    >
                      <span className="text-gray-900">{o.query}</span>
                      <span className="text-gray-500 text-xs shrink-0">
                        pos {o.position.toFixed(1)} · {o.impressions} imp
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-[#052638] mb-4">
                SEO blog queue (Tier B)
              </h2>
              <ul className="text-sm text-gray-700 space-y-1 max-h-64 overflow-y-auto font-mono">
                {data.seoBlogQueue.map((kw) => (
                  <li key={kw}>{kw}</li>
                ))}
              </ul>
            </section>

            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-[#052638] mb-4">
                Keyword campaigns (eligible)
              </h2>
              <ul className="text-sm space-y-2 max-h-64 overflow-y-auto">
                {data.keywordCampaigns.topEligible.map((e) => (
                  <li
                    key={e.keyword}
                    className="flex justify-between border-b border-gray-100 pb-1"
                  >
                    <span>{e.keyword}</span>
                    <span className="text-gray-500">score {e.gscScore.toFixed(0)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-[#052638] mb-4">
              Data files on disk
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-4">File</th>
                    <th className="py-2 pr-4">Exists</th>
                    <th className="py-2 pr-4">Updated</th>
                    <th className="py-2">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dataFiles.map((f) => (
                    <tr key={f.name} className="border-b border-gray-100">
                      <td className="py-2 pr-4 font-mono text-xs">{f.name}</td>
                      <td className="py-2 pr-4">{f.exists ? "yes" : "no"}</td>
                      <td className="py-2 pr-4 text-gray-600">
                        {f.updatedAt
                          ? new Date(f.updatedAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="py-2 text-gray-600">
                        {f.exists ? `${f.sizeKb} KB` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Snapshot generated {new Date(data.generatedAt).toLocaleString()}
            </p>
          </section>
        </>
      ) : null}
    </div>
  );
}
