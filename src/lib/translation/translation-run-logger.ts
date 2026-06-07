import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";

export function appendTranslationRunLog(
  logFileName: string,
  event: string,
  detail?: Record<string, unknown>
): void {
  const root = getDeploymentRoot();
  const logPath = path.join(root, "logs", logFileName);
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    event,
    ...detail,
  });
  fs.appendFileSync(logPath, `${line}\n`, "utf8");
}
