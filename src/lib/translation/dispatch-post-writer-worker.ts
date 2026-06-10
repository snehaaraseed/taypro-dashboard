import "server-only";

import { spawn } from "child_process";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";

/** Spawn post-writer translation worker (full backlog until quota or midnight IST). */
export function dispatchPostWriterTranslationWorker(): void {
  const root = getDeploymentRoot();
  const script = path.join(root, "scripts/start-post-writer-translations.sh");
  const child = spawn("bash", [script], {
    cwd: root,
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}
