#!/usr/bin/env node
/**
 * Exit 10 when catchup translation worker should be (re)started:
 * worker not running and blogs/projects still need translation.
 * Prints one JSON line to stdout. No server-only / tsx imports.
 */
import Database from "better-sqlite3";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.TAYPRO_APP_ROOT ?? path.resolve(__dirname, "..");
const dbPath = path.join(root, "data", "cms.sqlite");
const lockPath = path.join(root, ".runtime", "translation-cron", "catchup.lock");
const translationLogPath = path.join(
  root,
  "logs",
  "blog-translation-post-writer.log"
);
const TARGET_LOCALES = ["hi", "ar", "ja", "bn"];
const MAX_OPEN_RUN_MS = 4 * 60 * 60 * 1000;

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function isCatchupTranslationWorkerRunning() {
  if (existsSync(lockPath)) {
    const pid = Number.parseInt(readFileSync(lockPath, "utf8").trim(), 10);
    if (Number.isFinite(pid) && pid > 0 && isProcessRunning(pid)) {
      return true;
    }
  }
  return isTranslationRunOpenInLog();
}

function isTranslationRunOpenInLog() {
  if (!existsSync(translationLogPath)) return false;
  const lines = readFileSync(translationLogPath, "utf8").trim().split("\n").slice(-300);
  let openStartTs = null;
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (entry.event === "worker_start") openStartTs = entry.ts ?? null;
      if (entry.event === "worker_done" || entry.event === "worker_error") {
        openStartTs = null;
      }
    } catch {
      // ignore shell log lines from start-post-writer-translations.sh
    }
  }
  if (!openStartTs) return false;
  const startedAt = new Date(openStartTs).getTime();
  if (!Number.isFinite(startedAt)) return false;
  return Date.now() - startedAt < MAX_OPEN_RUN_MS;
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

  const workerRunning = isCatchupTranslationWorkerRunning();
  const db = new Database(dbPath, { readonly: true });

  let blogBacklog = 0;
  let projectBacklog = 0;
  try {
    blogBacklog = countSlugsNeedingTranslation(db, "blogs");
    projectBacklog = countSlugsNeedingTranslation(db, "projects");
  } finally {
    db.close();
  }

  const pendingTotal = blogBacklog + projectBacklog;
  const shouldRestart = !workerRunning && pendingTotal > 0;

  console.log(
    JSON.stringify({
      workerRunning,
      blogBacklog,
      projectBacklog,
      pendingTotal,
      shouldRestart,
    })
  );

  process.exit(shouldRestart ? 10 : 0);
}

main();
