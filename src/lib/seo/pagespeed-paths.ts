import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";

export function resolvePagespeedSummaryPath(): string {
  const envPath = process.env.PAGESPEED_SUMMARY_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "pagespeed-latest-report.json");
}

export function resolvePagespeedRunsDir(): string {
  const envPath = process.env.PAGESPEED_RUNS_DIR?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "pagespeed", "runs");
}

export function resolvePagespeedRunDir(runId: string): string {
  return path.join(resolvePagespeedRunsDir(), runId);
}

export function resolvePagespeedPagesDir(runId: string): string {
  return path.join(resolvePagespeedRunDir(runId), "pages");
}

export function resolvePagespeedLockPath(): string {
  return path.join(getDeploymentRoot(), ".runtime", "pagespeed-audit", "run.lock");
}

export function resolvePagespeedStatusPath(): string {
  return path.join(getDeploymentRoot(), ".runtime", "pagespeed-audit", "status.json");
}

export function urlToReportFilename(url: string): string {
  const hash = Buffer.from(url).toString("base64url").slice(0, 48);
  return `${hash}.json`;
}

export function readPagespeedSummary(): import("./pagespeed-types").PagespeedAuditSummary | null {
  const summaryPath = resolvePagespeedSummaryPath();
  if (!fs.existsSync(summaryPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(summaryPath, "utf8")) as import("./pagespeed-types").PagespeedAuditSummary;
  } catch {
    return null;
  }
}

export function pruneOldRuns(keep = 3): void {
  const runsDir = resolvePagespeedRunsDir();
  if (!fs.existsSync(runsDir)) return;

  const dirs = fs
    .readdirSync(runsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .reverse();

  for (const dir of dirs.slice(keep)) {
    fs.rmSync(path.join(runsDir, dir), { recursive: true, force: true });
  }
}
