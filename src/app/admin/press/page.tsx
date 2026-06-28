"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PressReleaseRow {
  title: string;
  subhead: string;
  slug: string;
  status: string;
  publishDate: string;
  published?: boolean;
  queueKey: string | null;
}

interface SubmissionRow {
  id: number;
  releaseSlug: string;
  targetId: string;
  status: string;
  externalUrl: string | null;
  backlinkType: string;
  notes: string;
}

interface Stats {
  liveBacklinks: number;
  pendingQueue: number;
  totalReleases: number;
  publishedReleases: number;
}

interface QueueItem {
  id: string;
  angle: string;
  titleHint: string;
  summary: string;
  facts: string[];
  quoteAttribution: string;
  status: string;
}

const QUEUE_ANGLES = [
  "product_launch",
  "milestone",
  "award",
  "partnership",
  "deployment",
] as const;

const EMPTY_QUEUE_FORM: {
  angle: (typeof QUEUE_ANGLES)[number];
  titleHint: string;
  summary: string;
  facts: string;
  quoteAttribution: string;
} = {
  angle: "product_launch",
  titleHint: "",
  summary: "",
  facts: "",
  quoteAttribution: "Yogesh Kudale, Co-Founder & CEO, Taypro",
};

const TARGET_NAMES: Record<string, string> = {
  prlog: "PRLog",
  openpr: "OpenPR",
  "1888pressrelease": "1888PressRelease",
  "energetica-india": "Energetica India",
  "saur-energy": "Saur Energy",
  "renewable-watch": "Renewable Watch",
  "ipf-online": "IPF Online",
  "times-tech": "TimesTech",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-800",
  live: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdminPressPage() {
  const router = useRouter();
  const [releases, setReleases] = useState<PressReleaseRow[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQueueForm, setShowQueueForm] = useState(false);
  const [queueForm, setQueueForm] = useState(EMPTY_QUEUE_FORM);
  const [queueSaving, setQueueSaving] = useState(false);
  const [queueActionLoading, setQueueActionLoading] = useState<string | null>(null);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [publishLoading, setPublishLoading] = useState<string | null>(null);
  const [generateLoading, setGenerateLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/press/list");
      if (response.ok) {
        const data = await response.json();
        setReleases(data.releases);
        setQueue(data.queue ?? []);
        setSubmissions(data.submissions);
        setStats(data.stats);
      } else if (response.status === 401) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Error fetching press data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Delete press release "${title}"? This cannot be undone.`)) return;
    setDeleteLoading(slug);
    try {
      const response = await fetch(`/api/admin/press/${slug}`, { method: "DELETE" });
      if (response.ok) {
        setReleases((prev) => prev.filter((r) => r.slug !== slug));
        setSubmissions((prev) => prev.filter((s) => s.releaseSlug !== slug));
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

  const handlePublish = async (slug: string, publish: boolean) => {
    setPublishLoading(slug);
    try {
      const response = await fetch(`/api/admin/press/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: publish, status: publish ? "published" : "ready" }),
      });
      if (response.ok) {
        setReleases((prev) =>
          prev.map((r) =>
            r.slug === slug ? { ...r, published: publish, status: publish ? "published" : "ready" } : r
          )
        );
      } else {
        const data = await response.json();
        alert(data.error ?? "Update failed");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Update failed");
    } finally {
      setPublishLoading(null);
    }
  };

  const handleCopyForTarget = async (slug: string, targetId: string) => {
    try {
      const response = await fetch(
        `/api/admin/press/${slug}/export?targetId=${encodeURIComponent(targetId)}`
      );
      if (!response.ok) {
        alert("Export failed");
        return;
      }
      const data = await response.json();
      await navigator.clipboard.writeText(data.export.plainText);
      setCopyMessage(`Copied for ${data.export.targetName}`);
      setTimeout(() => setCopyMessage(""), 2500);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Copy failed");
    }
  };

  const handleExportAll = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/press/${slug}/export`);
      if (!response.ok) {
        alert("Export failed");
        return;
      }
      const data = await response.json();
      await navigator.clipboard.writeText(data.bundleText);
      setCopyMessage("Copied full export bundle");
      setTimeout(() => setCopyMessage(""), 2500);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Export failed");
    }
  };

  const handleUpdateSubmission = async (
    slug: string,
    targetId: string,
    updates: Partial<SubmissionRow>
  ) => {
    try {
      const response = await fetch(`/api/admin/press/${slug}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, ...updates }),
      });
      if (response.ok) {
        setSubmissions((prev) => {
          const existing = prev.find(
            (s) => s.releaseSlug === slug && s.targetId === targetId
          );
          if (existing) {
            return prev.map((s) =>
              s.releaseSlug === slug && s.targetId === targetId
                ? { ...s, ...updates }
                : s
            );
          }
          return [
            ...prev,
            {
              id: Date.now(),
              releaseSlug: slug,
              targetId,
              status: updates.status ?? "pending",
              externalUrl: updates.externalUrl ?? null,
              backlinkType: updates.backlinkType ?? "unknown",
              notes: updates.notes ?? "",
            },
          ];
        });
        void fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerate = async (queueId?: string) => {
    const label = queueId ? `Generate press release for "${queueId}"?` : "Generate next press release from queue?";
    if (!confirm(label)) return;
    setGenerateLoading(true);
    setQueueActionLoading(queueId ?? "next");
    try {
      const response = await fetch("/api/admin/press/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queueId ? { queueId } : {}),
      });
      const data = await response.json();
      if (data.success) {
        alert(`Draft created: ${data.slug}`);
        void fetchData();
      } else {
        alert(data.message ?? "Generation failed");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setGenerateLoading(false);
      setQueueActionLoading(null);
    }
  };

  const handleAddQueueItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setQueueSaving(true);
    try {
      const response = await fetch("/api/admin/press/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          angle: queueForm.angle,
          titleHint: queueForm.titleHint,
          summary: queueForm.summary,
          facts: queueForm.facts,
          quoteAttribution: queueForm.quoteAttribution,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setQueueForm(EMPTY_QUEUE_FORM);
        setShowQueueForm(false);
        void fetchData();
      } else {
        alert(data.error ?? "Failed to add topic");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to add topic");
    } finally {
      setQueueSaving(false);
    }
  };

  const handleDeleteQueueItem = async (id: string, title: string) => {
    if (!confirm(`Remove queue topic "${title}"?`)) return;
    setQueueActionLoading(`delete-${id}`);
    try {
      const response = await fetch(`/api/admin/press/queue/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setQueue((prev) => prev.filter((q) => q.id !== id));
        void fetchData();
      } else {
        const data = await response.json();
        alert(data.error ?? "Delete failed");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setQueueActionLoading(null);
    }
  };

  const handleRequeueItem = async (id: string) => {
    setQueueActionLoading(`requeue-${id}`);
    try {
      const response = await fetch(`/api/admin/press/queue/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requeue: true }),
      });
      if (response.ok) {
        void fetchData();
      } else {
        const data = await response.json();
        alert(data.error ?? "Requeue failed");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Requeue failed");
    } finally {
      setQueueActionLoading(null);
    }
  };

  const subsForRelease = (slug: string) =>
    submissions.filter((s) => s.releaseSlug === slug);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#052638]">Press Releases</h1>
          <p className="mt-1 text-sm text-gray-600">
            AI drafts from queue → review → publish → copy per-site content → log backlinks.
          </p>
          {stats ? (
            <p className="mt-2 text-sm text-gray-500">
              {stats.publishedReleases} published · {stats.liveBacklinks} live backlinks ·{" "}
              {stats.pendingQueue} queue items pending
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={generateLoading}
            className="rounded-md bg-[#052638] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a3a4a] disabled:opacity-50"
          >
            {generateLoading && queueActionLoading === "next" ? "Generating…" : "Generate next"}
          </button>
          <button
            type="button"
            onClick={() => setShowQueueForm((v) => !v)}
            className="rounded-md border border-[#052638] px-4 py-2 text-sm font-medium text-[#052638] hover:bg-[#052638]/5"
          >
            {showQueueForm ? "Cancel" : "Add topic"}
          </button>
          <Link
            href="/press"
            target="_blank"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View public hub
          </Link>
          <a
            href="/feed/press.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            RSS feed
          </a>
        </div>
      </div>

      {copyMessage ? (
        <p className="mb-4 rounded-md bg-green-50 px-4 py-2 text-sm text-green-800">
          {copyMessage}
        </p>
      ) : null}

      {showQueueForm ? (
        <form
          onSubmit={(e) => void handleAddQueueItem(e)}
          className="mb-8 rounded-lg border border-gray-200 bg-white p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-[#052638]">Add press topic</h2>
          <p className="text-sm text-gray-600">
            Add verified facts only — the AI drafts the release from this brief.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Angle</label>
              <select
                value={queueForm.angle}
                onChange={(e) =>
                  setQueueForm({
                    ...queueForm,
                    angle: e.target.value as (typeof QUEUE_ANGLES)[number],
                  })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {QUEUE_ANGLES.map((a) => (
                  <option key={a} value={a}>
                    {a.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quote attribution</label>
              <input
                type="text"
                value={queueForm.quoteAttribution}
                onChange={(e) =>
                  setQueueForm({ ...queueForm, quoteAttribution: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Headline hint</label>
            <input
              type="text"
              value={queueForm.titleHint}
              onChange={(e) => setQueueForm({ ...queueForm, titleHint: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Taypro Launches..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Summary</label>
            <textarea
              value={queueForm.summary}
              onChange={(e) => setQueueForm({ ...queueForm, summary: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Verified facts (one per line)
            </label>
            <textarea
              value={queueForm.facts}
              onChange={(e) => setQueueForm({ ...queueForm, facts: e.target.value })}
              rows={5}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono"
              placeholder={"Mercom ranked Taypro #1 in 2024.\n5 GW+ deployed across India."}
              required
            />
          </div>
          <button
            type="submit"
            disabled={queueSaving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {queueSaving ? "Saving…" : "Add to queue"}
          </button>
        </form>
      ) : null}

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[#052638] mb-3">Topic queue</h2>
        {queue.length === 0 ? (
          <p className="text-sm text-gray-600">
            No topics queued. Click <strong>Add topic</strong> to schedule a press release.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Topic</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Angle</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {queue.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{item.titleHint}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.id}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.angle.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          item.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : item.status === "done"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      {item.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => void handleGenerate(item.id)}
                          disabled={queueActionLoading === item.id}
                          className="text-blue-600 hover:underline disabled:opacity-50"
                        >
                          {queueActionLoading === item.id ? "Generating…" : "Generate"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleRequeueItem(item.id)}
                          disabled={queueActionLoading === `requeue-${item.id}`}
                          className="text-blue-600 hover:underline disabled:opacity-50"
                        >
                          Requeue
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDeleteQueueItem(item.id, item.titleHint)}
                        disabled={queueActionLoading === `delete-${item.id}`}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <h2 className="text-lg font-semibold text-[#052638] mb-4">Press releases</h2>

      {releases.length === 0 ? (
        <p className="text-gray-600">
          No press releases yet. Add a topic above, then click Generate.
        </p>
      ) : (
        <div className="space-y-6">
          {releases.map((release) => {
            const subs = subsForRelease(release.slug);
            const isExpanded = expandedSlug === release.slug;
            return (
              <div
                key={release.slug}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-4 py-4">
                  <div>
                    <h2 className="font-semibold text-gray-900">{release.title}</h2>
                    <p className="text-sm text-gray-500">
                      {release.slug} · {release.status}
                      {release.queueKey ? ` · queue: ${release.queueKey}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        release.published !== false
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {release.published !== false ? "Published" : "Draft"}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        void handlePublish(release.slug, release.published === false)
                      }
                      disabled={publishLoading === release.slug}
                      className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                    >
                      {publishLoading === release.slug
                        ? "…"
                        : release.published !== false
                          ? "Unpublish"
                          : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/press/${release.slug}/edit`)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleExportAll(release.slug)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Export all
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSlug(isExpanded ? null : release.slug)
                      }
                      className="text-sm text-gray-600 hover:underline"
                    >
                      {isExpanded ? "Hide submissions" : "Submissions"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(release.slug, release.title)}
                      disabled={deleteLoading === release.slug}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deleteLoading === release.slug ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>

                {isExpanded ? (
                  <div className="overflow-x-auto px-4 py-4">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Site</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Status</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">External URL</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Backlink</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {Object.entries(TARGET_NAMES).map(([targetId, name]) => {
                          const sub = subs.find((s) => s.targetId === targetId);
                          return (
                            <tr key={targetId}>
                              <td className="px-3 py-2 font-medium">{name}</td>
                              <td className="px-3 py-2">
                                <select
                                  value={sub?.status ?? "pending"}
                                  onChange={(e) =>
                                    void handleUpdateSubmission(release.slug, targetId, {
                                      status: e.target.value,
                                    })
                                  }
                                  className={`rounded px-2 py-1 text-xs ${STATUS_COLORS[sub?.status ?? "pending"]}`}
                                >
                                  <option value="pending">pending</option>
                                  <option value="submitted">submitted</option>
                                  <option value="live">live</option>
                                  <option value="rejected">rejected</option>
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="url"
                                  defaultValue={sub?.externalUrl ?? ""}
                                  placeholder="https://..."
                                  className="w-full min-w-[200px] rounded border border-gray-200 px-2 py-1 text-xs"
                                  onBlur={(e) => {
                                    if (e.target.value !== (sub?.externalUrl ?? "")) {
                                      void handleUpdateSubmission(release.slug, targetId, {
                                        externalUrl: e.target.value || null,
                                      });
                                    }
                                  }}
                                />
                              </td>
                              <td className="px-3 py-2">
                                <select
                                  value={sub?.backlinkType ?? "unknown"}
                                  onChange={(e) =>
                                    void handleUpdateSubmission(release.slug, targetId, {
                                      backlinkType: e.target.value,
                                    })
                                  }
                                  className="rounded border border-gray-200 px-2 py-1 text-xs"
                                >
                                  <option value="unknown">unknown</option>
                                  <option value="dofollow">dofollow</option>
                                  <option value="nofollow">nofollow</option>
                                  <option value="none">none</option>
                                </select>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => void handleCopyForTarget(release.slug, targetId)}
                                  className="text-blue-600 hover:underline"
                                >
                                  Copy
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
