import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";

export type DiscoveryRunState = {
  lastRunAt: string | null;
  /** Rotates which semantic domain is mined first on each run. */
  domainRotationOffset: number;
  /** Rotates search-focus angle in the discovery prompt. */
  searchFocusIndex: number;
  /** Recent grounded queries — fed back as "already mined" to force new angles. */
  recentQueries: string[];
};

const MAX_RECENT_QUERIES = 120;

function resolveStatePath(): string {
  const env = process.env.DISCOVERY_RUN_STATE_PATH?.trim();
  if (env) return path.resolve(env);
  return path.join(getDeploymentRoot(), "data", "discovery-run-state.json");
}

export function loadDiscoveryRunState(): DiscoveryRunState {
  const filePath = resolveStatePath();
  if (!fs.existsSync(filePath)) {
    return {
      lastRunAt: null,
      domainRotationOffset: 0,
      searchFocusIndex: 0,
      recentQueries: [],
    };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as DiscoveryRunState;
    return {
      lastRunAt: raw.lastRunAt ?? null,
      domainRotationOffset: raw.domainRotationOffset ?? 0,
      searchFocusIndex: raw.searchFocusIndex ?? 0,
      recentQueries: Array.isArray(raw.recentQueries) ? raw.recentQueries : [],
    };
  } catch {
    return {
      lastRunAt: null,
      domainRotationOffset: 0,
      searchFocusIndex: 0,
      recentQueries: [],
    };
  }
}

export function saveDiscoveryRunState(state: DiscoveryRunState): void {
  const filePath = resolveStatePath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
}

export function advanceDiscoveryRunState(input: {
  domainsProcessed: number;
  newQueries: string[];
}): DiscoveryRunState {
  const prev = loadDiscoveryRunState();
  const mergedQueries = [
    ...input.newQueries.map((q) => q.toLowerCase().trim()).filter(Boolean),
    ...prev.recentQueries,
  ];
  const recentQueries = [...new Set(mergedQueries)].slice(0, MAX_RECENT_QUERIES);
  const next: DiscoveryRunState = {
    lastRunAt: new Date().toISOString(),
    domainRotationOffset: prev.domainRotationOffset + input.domainsProcessed,
    searchFocusIndex: prev.searchFocusIndex + 1,
    recentQueries,
  };
  saveDiscoveryRunState(next);
  return next;
}

/** Rotating search angles so each discovery run mines different SERP demand. */
export const DISCOVERY_SEARCH_FOCUSES = [
  "2026 regulatory, compliance, and insurance questions for utility solar O&M in India",
  "People Also Ask and forum threads about robotic vs manual cleaning on MW plants",
  "state-specific seasonal O&M (monsoon prep, dust storms, coastal salt, harvest dust)",
  "inverter, transformer, SCADA, and BOS issues tied to soiling or cleaning access",
  "EPC handover, warranty, AMC scope, and vendor selection for plant operators",
  "financial ROI, PPA yield loss, and budget justification for cleaning programs",
  "tracker geometry, row access, agrivoltaics, and site constraints for automation",
  "C&I and distributed portfolio O&M models emerging in India",
  "water scarcity, environmental permits, and waterless cleaning adoption",
  "new module tech (bifacial, TOPCon) and how O&M programs must adapt",
  "workforce safety, training, and audit standards on large solar sites",
  "emerging IPP and asset-manager questions not covered by generic solar blogs",
] as const;

export function pickDiscoverySearchFocus(index: number): string {
  const list = DISCOVERY_SEARCH_FOCUSES;
  return list[((index % list.length) + list.length) % list.length];
}
