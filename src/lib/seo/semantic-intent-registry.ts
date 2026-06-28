import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import {
  buildCoordinateKey,
  type TopicCoordinate,
} from "@/lib/seo/semantic-topic-coordinates";

export type SemanticIntentRecord = {
  domainId: string;
  intentFamily: string;
  subAngleId: string;
  contextHash: string;
  coordinateKey: string;
  keyword: string;
  title: string;
  slug: string;
  writtenAt: string;
  refreshDue?: string | null;
  source: "automation" | "backfill" | "manual";
};

export type SemanticIntentRegistryFile = {
  description?: string;
  updatedAt?: string;
  byCoordinateKey: Record<string, SemanticIntentRecord>;
};

function resolveRegistryPath(): string {
  const env = process.env.SEMANTIC_INTENT_REGISTRY_PATH?.trim();
  if (env) return path.resolve(env);
  return path.join(getDeploymentRoot(), "data", "semantic-intent-registry.json");
}

export function loadSemanticIntentRegistry(): SemanticIntentRegistryFile {
  const filePath = resolveRegistryPath();
  if (!fs.existsSync(filePath)) {
    return { byCoordinateKey: {} };
  }
  try {
    const raw = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    ) as SemanticIntentRegistryFile;
    return {
      description: raw.description,
      updatedAt: raw.updatedAt,
      byCoordinateKey: raw.byCoordinateKey ?? {},
    };
  } catch {
    return { byCoordinateKey: {} };
  }
}

export function saveSemanticIntentRegistry(
  registry: SemanticIntentRegistryFile
): void {
  const filePath = resolveRegistryPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  registry.updatedAt = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(registry, null, 2));
}

export function isCoordinateFilled(coordinate: TopicCoordinate): boolean {
  const key = buildCoordinateKey(coordinate);
  return Boolean(loadSemanticIntentRegistry().byCoordinateKey[key]);
}

export function recordSemanticIntentWritten(input: {
  coordinate: TopicCoordinate;
  keyword: string;
  title: string;
  slug: string;
  source?: SemanticIntentRecord["source"];
}): void {
  const registry = loadSemanticIntentRegistry();
  const coordinateKey = buildCoordinateKey(input.coordinate);
  const contextHash = coordinateKey.split("::").pop() ?? "";
  registry.byCoordinateKey[coordinateKey] = {
    domainId: input.coordinate.domainId,
    intentFamily: input.coordinate.intentFamily,
    subAngleId: input.coordinate.subAngleId,
    contextHash,
    coordinateKey,
    keyword: input.keyword,
    title: input.title,
    slug: input.slug,
    writtenAt: new Date().toISOString(),
    source: input.source ?? "automation",
  };
  saveSemanticIntentRegistry(registry);
}

export function listFilledCoordinateKeys(): Set<string> {
  return new Set(Object.keys(loadSemanticIntentRegistry().byCoordinateKey));
}

export function getSemanticRegistryAdminSummary(): {
  totalFilled: number;
  domainCounts: Record<string, number>;
} {
  const registry = loadSemanticIntentRegistry();
  const domainCounts: Record<string, number> = {};
  for (const rec of Object.values(registry.byCoordinateKey)) {
    domainCounts[rec.domainId] = (domainCounts[rec.domainId] ?? 0) + 1;
  }
  return {
    totalFilled: Object.keys(registry.byCoordinateKey).length,
    domainCounts,
  };
}
