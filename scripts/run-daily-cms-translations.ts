/**
 * Standalone CMS translation worker (blogs + projects).
 * Runs outside PM2/HTTP so long Gemini runs are not cut off by curl timeouts.
 *
 * Daily cron: scripts/cron-translate-blogs-daily.sh (max 10/day)
 * Catch-up:    scripts/run-cms-translation-catchup.sh (full backlog until quota or midnight)
 */
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import { getDeploymentRoot } from "../src/app/utils/deploymentRoot";
import { processDailyTranslations } from "../src/lib/translation/translation-queue";

const root = getDeploymentRoot();
const lockDir = path.join(root, ".runtime/translation-cron");

function loadEnvFile(name: string): void {
  const filePath = path.join(root, name);
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function resolveLockPath(): string {
  const catchup =
    process.env.CMS_TRANSLATION_CATCHUP === "1" ||
    process.argv.includes("--catchup");
  return path.join(lockDir, catchup ? "catchup.lock" : "daily.lock");
}

function acquireLock(lockPath: string): boolean {
  mkdirSync(lockDir, { recursive: true });
  if (existsSync(lockPath)) {
    const raw = readFileSync(lockPath, "utf8").trim();
    const pid = Number.parseInt(raw, 10);
    if (Number.isFinite(pid) && pid > 0 && isProcessRunning(pid)) {
      log("skip", { reason: "already_running", pid, lock: lockPath });
      return false;
    }
  }
  writeFileSync(lockPath, String(process.pid), "utf8");
  return true;
}

function releaseLock(lockPath: string): void {
  try {
    if (!existsSync(lockPath)) return;
    const raw = readFileSync(lockPath, "utf8").trim();
    if (raw === String(process.pid)) unlinkSync(lockPath);
  } catch {
    // ignore
  }
}

function log(event: string, detail?: Record<string, unknown>): void {
  const line = {
    ts: new Date().toISOString(),
    event,
    pid: process.pid,
    ...detail,
  };
  console.log(JSON.stringify(line));
}

function resolveShouldStop(): (() => boolean) | undefined {
  const raw = process.env.CMS_TRANSLATION_STOP_AT_EPOCH?.trim();
  if (!raw) return undefined;
  const stopAtEpoch = Number.parseInt(raw, 10);
  if (!Number.isFinite(stopAtEpoch) || stopAtEpoch <= 0) return undefined;
  return () => Math.floor(Date.now() / 1000) >= stopAtEpoch;
}

async function main(): Promise<void> {
  loadEnvFile(".env.production");
  loadEnvFile(".env.local");

  const catchup =
    process.env.CMS_TRANSLATION_CATCHUP === "1" ||
    process.argv.includes("--catchup");
  const lockPath = resolveLockPath();

  if (!acquireLock(lockPath)) {
    process.exit(0);
  }

  const cleanup = () => releaseLock(lockPath);
  process.on("exit", cleanup);
  process.on("SIGINT", () => {
    log("signal", { signal: "SIGINT" });
    cleanup();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    log("signal", { signal: "SIGTERM" });
    cleanup();
    process.exit(143);
  });

  const shouldStop = resolveShouldStop();
  log("worker_start", {
    root,
    catchup,
    stopAtEpoch: process.env.CMS_TRANSLATION_STOP_AT_EPOCH ?? null,
  });

  try {
    const result = await processDailyTranslations({
      catchup,
      shouldStop,
      log: (event, detail) => log(event, detail),
    });

    log("worker_done", {
      success: true,
      catchup,
      quotaSkippedForDay: result.quotaSkippedForDay,
      deadlineStopped: result.deadlineStopped ?? false,
      processed: result.processed,
      completed: result.completed,
      partial: result.partial,
      skippedQuota: result.skippedQuota,
      clearedQueueRows: result.clearedQueueRows,
      summary: result.items.map((item) => ({
        type: item.contentType,
        slug: item.slug,
        status: item.status,
      })),
    });

    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("worker_error", { error: message });
    process.exit(1);
  }
}

void main();
