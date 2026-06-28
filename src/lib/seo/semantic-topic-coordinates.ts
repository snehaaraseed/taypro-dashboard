import "server-only";

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import type { SearchIntentFamily } from "@/lib/seo/keyword-intent-taxonomy";
import type { StructuralArchetype } from "@/lib/seo/structural-archetypes";

export type TopicContextDimensions = {
  geo?: string;
  scale?: string;
  plantType?: string;
  season?: string;
  buyerRole?: string;
};

export type TopicCoordinate = {
  domainId: string;
  intentFamily: SearchIntentFamily;
  subAngleId: string;
  context: TopicContextDimensions;
};

export type SemanticSubAngle = {
  id: string;
  intentFamily: SearchIntentFamily;
  titleTemplate: string;
  angleId: string;
  archetype: StructuralArchetype;
};

export type SemanticDomain = {
  id: string;
  label: string;
  allowedIntents: SearchIntentFamily[];
  pillarPath?: string;
  moneyPageOwner?: string;
  subAngles: SemanticSubAngle[];
  contextDimensions?: Partial<Record<keyof TopicContextDimensions, string[]>>;
};

export type SemanticTopicCatalog = {
  version?: number;
  description?: string;
  domains: SemanticDomain[];
};

export function hashTopicContext(context: TopicContextDimensions): string {
  const sorted = Object.keys(context)
    .sort()
    .map((k) => `${k}=${context[k as keyof TopicContextDimensions] ?? ""}`)
    .join("|");
  return crypto.createHash("sha256").update(sorted).digest("hex").slice(0, 12);
}

export function buildCoordinateKey(coordinate: TopicCoordinate): string {
  const ctxHash = hashTopicContext(coordinate.context);
  return `${coordinate.domainId}::${coordinate.intentFamily}::${coordinate.subAngleId}::${ctxHash}`;
}

function resolveCatalogPath(): string {
  const env = process.env.SEMANTIC_TOPIC_CATALOG_PATH?.trim();
  if (env) return path.resolve(env);
  return path.join(getDeploymentRoot(), "data", "semantic-topic-catalog.json");
}

let cachedCatalog: SemanticTopicCatalog | null = null;

export function loadSemanticTopicCatalog(): SemanticTopicCatalog {
  if (cachedCatalog) return cachedCatalog;
  const filePath = resolveCatalogPath();
  if (!fs.existsSync(filePath)) {
    cachedCatalog = { domains: [] };
    return cachedCatalog;
  }
  cachedCatalog = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  ) as SemanticTopicCatalog;
  return cachedCatalog;
}

export function getSemanticDomain(domainId: string): SemanticDomain | null {
  return (
    loadSemanticTopicCatalog().domains.find((d) => d.id === domainId) ?? null
  );
}

export function listSemanticDomains(): SemanticDomain[] {
  return loadSemanticTopicCatalog().domains;
}

export function clearSemanticTopicCatalogCache(): void {
  cachedCatalog = null;
}
