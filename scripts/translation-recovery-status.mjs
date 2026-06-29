#!/usr/bin/env node
/**
 * Exit 10 when catchup worker should be (re)started:
 * worker not running, today's English blog is done, and translation or rewrite backlog remains.
 * Prints one JSON line to stdout. No server-only / tsx imports.
 */
import Database from "better-sqlite3";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.TAYPRO_APP_ROOT ?? path.resolve(__dirname, "..");
const dbPath = path.join(root, "data", "cms.sqlite");
const runtimeDir = path.join(root, ".runtime", "blog-cron");

function blogDoneTodayIst() {
  const ymd = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const compact = ymd.replace(/-/g, "");
  return existsSync(path.join(runtimeDir, `done-${compact}`));
}

const lockPath = path.join(root, ".runtime", "translation-cron", "catchup.lock");
const translationLogPath = path.join(
  root,
  "logs",
  "blog-translation-post-writer.log"
);
const TARGET_LOCALES = ["hi", "ar", "ja", "bn"];
/** No JSON log lines for this long → treat worker as dead (e.g. PM2 restart). */
const STALE_ACTIVITY_MS = 15 * 60 * 1000;
/** Hard cap for an open worker_start without worker_done. */
const MAX_OPEN_RUN_MS = 4 * 60 * 60 * 1000;

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function parseTranslationLogState() {
  if (!existsSync(translationLogPath)) {
    return { workerRunning: false, reason: "no_log" };
  }

  const lines = readFileSync(translationLogPath, "utf8")
    .trim()
    .split("\n")
    .slice(-500);
  let openStartTs = null;
  let lastActivityTs = null;

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (!entry.event) continue;
      if (entry.ts) lastActivityTs = entry.ts;
      if (entry.event === "worker_start") openStartTs = entry.ts ?? openStartTs;
      if (entry.event === "worker_done" || entry.event === "worker_error") {
        openStartTs = null;
      }
    } catch {
      // ignore shell log lines from start-post-writer-translations.sh
    }
  }

  if (!openStartTs) {
    return {
      workerRunning: false,
      reason: "no_open_run",
      lastActivityTs,
    };
  }

  const startedAt = new Date(openStartTs).getTime();
  const lastAt = new Date(lastActivityTs ?? openStartTs).getTime();
  const now = Date.now();

  if (!Number.isFinite(startedAt) || !Number.isFinite(lastAt)) {
    return { workerRunning: false, reason: "invalid_timestamps", openStartTs };
  }
  if (now - startedAt > MAX_OPEN_RUN_MS) {
    return {
      workerRunning: false,
      reason: "max_run_exceeded",
      openStartTs,
      lastActivityTs,
    };
  }
  if (now - lastAt > STALE_ACTIVITY_MS) {
    return {
      workerRunning: false,
      reason: "stale_activity",
      openStartTs,
      lastActivityTs,
      staleMinutes: Math.round((now - lastAt) / 60000),
    };
  }

  return {
    workerRunning: true,
    reason: "active",
    openStartTs,
    lastActivityTs,
  };
}

function isCatchupTranslationWorkerRunning() {
  if (existsSync(lockPath)) {
    const pid = Number.parseInt(readFileSync(lockPath, "utf8").trim(), 10);
    if (Number.isFinite(pid) && pid > 0) {
      if (isProcessRunning(pid)) {
        return { workerRunning: true, reason: "lock_pid", lockPid: pid };
      }
      // PM2 deploy/crash killed the worker without worker_done — do not trust log "active".
      return {
        workerRunning: false,
        reason: "dead_lock_pid",
        lockPid: pid,
        lastActivityTs: parseTranslationLogState().lastActivityTs ?? null,
      };
    }
  }
  return parseTranslationLogState();
}

function countSlugsNeedingTranslation(db, table) {
  const localeUnions = TARGET_LOCALES.map((l) => `SELECT '${l}' AS loc`).join(
    " UNION ALL "
  );
  const englishFilter =
    table === "blogs"
      ? `(e.published = 1 OR (e.published = 0 AND e.scheduled_publish_at IS NOT NULL AND e.scheduled_publish_at > datetime('now')))`
      : `e.published = 1`;

  const row = db
    .prepare(
      `
    SELECT COUNT(*) AS n
    FROM ${table} e
    WHERE e.locale = 'en'
      AND ${englishFilter}
      AND EXISTS (
        SELECT 1
        FROM (${localeUnions}) l
        LEFT JOIN ${table} t ON t.slug = e.slug AND t.locale = l.loc
        WHERE t.slug IS NULL OR t.updated_at < e.updated_at
      )
  `
    )
    .get();

  return Number(row?.n ?? 0);
}

function countLegacyProjectsNeedingRewrite(db) {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS n FROM projects WHERE locale = 'en' AND editorial_status = 'legacy'`
    )
    .get();
  return Number(row?.n ?? 0);
}

function main() {
  if (!existsSync(dbPath)) {
    console.log(
      JSON.stringify({
        workerRunning: false,
        blogBacklog: 0,
        projectBacklog: 0,
        pendingTotal: 0,
        shouldRestart: false,
        error: "missing_database",
      })
    );
    process.exit(0);
  }

  const runState = isCatchupTranslationWorkerRunning();
  const workerRunning = runState.workerRunning === true;
  const db = new Database(dbPath, { readonly: true });

  let blogBacklog = 0;
  let projectBacklog = 0;
  let rewriteBacklog = 0;
  try {
    blogBacklog = countSlugsNeedingTranslation(db, "blogs");
    projectBacklog = countSlugsNeedingTranslation(db, "projects");
    rewriteBacklog = countLegacyProjectsNeedingRewrite(db);
  } finally {
    db.close();
  }

  const translationBacklog = blogBacklog + projectBacklog;
  const pendingTotal = translationBacklog + rewriteBacklog;
  const blogDoneToday = blogDoneTodayIst();
  const shouldRestart =
    blogDoneToday &&
    !workerRunning &&
    (translationBacklog > 0 || rewriteBacklog > 0);

  console.log(
    JSON.stringify({
      workerRunning,
      workerReason: runState.reason ?? null,
      staleMinutes: runState.staleMinutes ?? null,
      lastActivityTs: runState.lastActivityTs ?? null,
      blogDoneToday,
      blogBacklog,
      projectBacklog,
      rewriteBacklog,
      translationBacklog,
      pendingTotal,
      shouldRestart,
    })
  );

  process.exit(shouldRestart ? 10 : 0);
}

main();
