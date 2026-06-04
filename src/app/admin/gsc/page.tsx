"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type GscStatus = {
  configured: boolean;
  authMethod: string;
  oauthClientConfigured: boolean;
  oauthConnected: boolean;
  connectedEmail: string | null;
  connectedAt: string | null;
  siteUrl: string;
  redirectUri: string | null;
  lastSyncAt: string | null;
  hasEditorialHint: boolean;
};

function AdminGscContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<GscStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const flash = searchParams.get("connected")
    ? "Google Search Console connected successfully."
    : searchParams.get("error")
      ? decodeURIComponent(searchParams.get("error")!)
      : null;

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gsc/status", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load status");
      setStatus(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (flash) {
      if (searchParams.get("connected")) setMessage(flash);
      else setError(flash);
    }
  }, [flash, searchParams]);

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/gsc/sync", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      setMessage(
        `Synced ${data.keywords?.length ?? 0} keywords (${data.authMethod}).`
      );
      await loadStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Google Search Console OAuth?")) return;
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/gsc/disconnect", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Disconnect failed");
      setMessage("Disconnected.");
      await loadStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Disconnect failed");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/blogs"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to Blogs
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">
          Google Search Console
        </h1>
        <p className="text-gray-600 mt-1">
          Connect your Google account (OAuth) to sync query data into blog
          automation. No service-account invite needed.
        </p>
      </div>

      {message ? (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : status ? (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Property</dt>
              <dd className="font-mono text-gray-900">{status.siteUrl}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Auth</dt>
              <dd className="font-medium text-gray-900">
                {status.oauthConnected
                  ? `OAuth${status.connectedEmail ? ` (${status.connectedEmail})` : ""}`
                  : status.authMethod === "service_account"
                    ? "Service account (fallback)"
                    : "Not connected"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">OAuth client in env</dt>
              <dd className="text-gray-900">
                {status.oauthClientConfigured ? "Yes" : "Missing — see docs"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Last sync</dt>
              <dd className="text-gray-900">
                {status.lastSyncAt
                  ? new Date(status.lastSyncAt).toLocaleString()
                  : "Never"}
              </dd>
            </div>
          </dl>

          {status.redirectUri ? (
            <p className="text-xs text-gray-500 break-all">
              Redirect URI (must match Google Cloud): {status.redirectUri}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {status.oauthClientConfigured && !status.oauthConnected ? (
              <a
                href="/api/admin/gsc/oauth/start"
                className="inline-flex items-center px-4 py-2 bg-[#4285F4] hover:bg-blue-600 text-white rounded-md font-medium"
              >
                Connect with Google
              </a>
            ) : null}
            {status.configured ? (
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="px-4 py-2 bg-[#A8C117] hover:bg-lime-500 text-[#052638] rounded-md font-medium disabled:opacity-50"
              >
                {syncing ? "Syncing…" : "Sync now"}
              </button>
            ) : null}
            {status.oauthConnected ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
              >
                Disconnect
              </button>
            ) : null}
          </div>

          <div className="text-sm text-gray-600 border-t pt-4">
            <p className="font-medium text-gray-800 mb-1">What sync does</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Updates{" "}
                <code className="text-xs">data/seo-gsc-boost.json</code>
              </li>
              <li>Feeds blog keyword picker and editorial prompts</li>
              <li>
                Weekly cron uses{" "}
                <code className="text-xs">/api/automation/sync-gsc</code>
              </li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminGscPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">Loading…</p>}>
      <AdminGscContent />
    </Suspense>
  );
}
