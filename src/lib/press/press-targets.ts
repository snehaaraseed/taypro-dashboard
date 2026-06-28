import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";

export type PressTargetField =
  | "title"
  | "summary"
  | "body"
  | "contactName"
  | "contactEmail"
  | "imageUrl";

export type PressTarget = {
  id: string;
  name: string;
  submitUrl: string;
  method: "form" | "email";
  emailTo?: string;
  fields: PressTargetField[];
  dofollow: boolean;
  notes?: string;
};

let cachedTargets: PressTarget[] | null = null;

function resolveTargetsPath(): string {
  const envPath = process.env.PRESS_TARGETS_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "press-targets.json");
}

export function loadPressTargets(): PressTarget[] {
  if (cachedTargets) return cachedTargets;

  const filePath = resolveTargetsPath();
  if (!fs.existsSync(filePath)) {
    cachedTargets = [];
    return cachedTargets;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
      targets?: unknown;
    };
    const list = Array.isArray(raw.targets) ? raw.targets : [];
    cachedTargets = list.filter(
      (t): t is PressTarget =>
        typeof t === "object" &&
        t !== null &&
        typeof (t as PressTarget).id === "string" &&
        typeof (t as PressTarget).name === "string"
    );
  } catch {
    cachedTargets = [];
  }

  return cachedTargets;
}

export function getPressTargetById(id: string): PressTarget | null {
  return loadPressTargets().find((t) => t.id === id) ?? null;
}

export function clearPressTargetsCache(): void {
  cachedTargets = null;
}
