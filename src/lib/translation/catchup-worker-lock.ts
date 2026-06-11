import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";

function lockDir(): string {
  return path.join(getDeploymentRoot(), ".runtime", "translation-cron");
}

function lockPath(): string {
  return path.join(lockDir(), "catchup.lock");
}

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function isCatchupTranslationWorkerRunning(): boolean {
  const file = lockPath();
  if (!existsSync(file)) return false;
  const pid = Number.parseInt(readFileSync(file, "utf8").trim(), 10);
  if (!Number.isFinite(pid) || pid <= 0) return false;
  return isProcessRunning(pid);
}

/** Returns false when another catchup worker PID is still alive. */
export function acquireCatchupWorkerLock(): boolean {
  const file = lockPath();
  mkdirSync(lockDir(), { recursive: true });
  if (existsSync(file)) {
    const pid = Number.parseInt(readFileSync(file, "utf8").trim(), 10);
    if (Number.isFinite(pid) && pid > 0 && isProcessRunning(pid)) {
      return false;
    }
  }
  writeFileSync(file, String(process.pid), "utf8");
  return true;
}

export function releaseCatchupWorkerLock(): void {
  const file = lockPath();
  try {
    if (!existsSync(file)) return;
    const raw = readFileSync(file, "utf8").trim();
    if (raw === String(process.pid)) unlinkSync(file);
  } catch {
    // ignore
  }
}
