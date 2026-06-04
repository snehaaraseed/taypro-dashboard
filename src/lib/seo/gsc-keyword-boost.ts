import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";

let cachedBoost: string[] | null = null;

export function invalidateGscBoostCache(): void {
  cachedBoost = null;
}

function resolveBoostPath(): string {
  const envPath = process.env.SEO_GSC_BOOST_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "seo-gsc-boost.json");
}

/** Keywords to prefer after the editorial queue (manual GSC exports). */
export function loadGscBoostKeywords(): string[] {
  if (cachedBoost) return cachedBoost;

  const filePath = resolveBoostPath();
  if (!fs.existsSync(filePath)) {
    cachedBoost = [];
    return cachedBoost;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
      keywords?: unknown;
    };
    const list = Array.isArray(raw.keywords) ? raw.keywords : [];
    cachedBoost = list
      .map((k) => (typeof k === "string" ? k.trim().toLowerCase() : ""))
      .filter(Boolean);
  } catch {
    cachedBoost = [];
  }

  return cachedBoost;
}
