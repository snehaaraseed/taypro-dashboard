import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { readPublishedTopics } from "@/lib/cms/topicService";
import {
  parseSlotFromCategory,
  type EditorialContract,
} from "@/lib/seo/coverage-ledger";
import {
  inferIntentFamily,
  intentFamilyMeta,
  INTENT_FAMILY_ORDER,
  parseSearchIntentFamily,
  formatIntentSelectionGuideBlock,
  type SearchIntentFamily,
} from "@/lib/seo/keyword-intent-taxonomy";
import type { StructuralArchetype } from "@/lib/seo/structural-archetypes";

export type KeywordIntentRecord = {
  intentFamily: SearchIntentFamily;
  angleId?: string | null;
  archetype?: StructuralArchetype | null;
  title: string;
  slug: string;
  slotKey?: string | null;
  writtenAt: string;
  source: "automation" | "backfill" | "manual";
};

export type KeywordIntentRegistryFile = {
  description: string;
  updatedAt: string;
  byKeyword: Record<string, KeywordIntentRecord[]>;
};

function resolveRegistryPath(): string {
  const envPath = process.env.SEO_KEYWORD_INTENT_REGISTRY_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "seo-keyword-intent-registry.json");
}

function readRegistryFile(): KeywordIntentRegistryFile {
  const filePath = resolveRegistryPath();
  if (!fs.existsSync(filePath)) {
    return {
      description:
        "Per-keyword search intent coverage for blog clusters (prevents cannibalization).",
      updatedAt: new Date().toISOString(),
      byKeyword: {},
    };
  }
  try {
    const raw = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    ) as KeywordIntentRegistryFile;
    return {
      description: raw.description ?? "",
      updatedAt: raw.updatedAt ?? new Date().toISOString(),
      byKeyword: raw.byKeyword ?? {},
    };
  } catch {
    return {
      description: "",
      updatedAt: new Date().toISOString(),
      byKeyword: {},
    };
  }
}

function writeRegistryFile(data: KeywordIntentRegistryFile): void {
  const filePath = resolveRegistryPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    JSON.stringify(
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );
}

function keywordKey(keyword: string): string {
  return keyword.toLowerCase().trim();
}

function parseArchetypeFromCategory(category?: string): StructuralArchetype | null {
  const match = (category ?? "").match(/arch:([^|]+)/i);
  const raw = match?.[1]?.trim();
  return (raw as StructuralArchetype) ?? null;
}

function recordKey(row: KeywordIntentRecord): string {
  return `${row.intentFamily}::${row.slug}`;
}

export function getCoveredIntentsForKeyword(
  keyword: string,
  registry?: KeywordIntentRegistryFile
): KeywordIntentRecord[] {
  const file = registry ?? readRegistryFile();
  return file.byKeyword[keywordKey(keyword)] ?? [];
}

export function getCoveredIntentFamilySet(keyword: string): Set<SearchIntentFamily> {
  return new Set(
    getCoveredIntentsForKeyword(keyword).map((r) => r.intentFamily)
  );
}

/** Prefer intent families not yet covered for this keyword (cluster gap). */
export function recommendNextIntentFamily(
  keyword: string,
  registry?: KeywordIntentRegistryFile
): SearchIntentFamily {
  const covered = getCoveredIntentFamilySet(keyword);
  for (const family of INTENT_FAMILY_ORDER) {
    if (!covered.has(family)) return family;
  }
  // All five covered — rotate to least-recent family (allow deepening cluster)
  const rows = getCoveredIntentsForKeyword(keyword, registry);
  const counts = new Map<SearchIntentFamily, number>();
  for (const f of INTENT_FAMILY_ORDER) counts.set(f, 0);
  for (const r of rows) {
    counts.set(r.intentFamily, (counts.get(r.intentFamily) ?? 0) + 1);
  }
  return [...INTENT_FAMILY_ORDER].sort(
    (a, b) => (counts.get(a) ?? 0) - (counts.get(b) ?? 0)
  )[0];
}

export function isIntentAcceptableForKeyword(
  keyword: string,
  intent: SearchIntentFamily
): boolean {
  const covered = getCoveredIntentFamilySet(keyword);
  if (!covered.has(intent)) return true;
  return covered.size >= INTENT_FAMILY_ORDER.length;
}

/**
 * Validate AI-declared intent; returns null when invalid or would cannibalize an uncovered gap.
 */
export function validateAiIntentFamily(
  keyword: string,
  aiIntent: unknown
): SearchIntentFamily | null {
  const parsed = parseSearchIntentFamily(aiIntent);
  if (!parsed) return null;
  if (!isIntentAcceptableForKeyword(keyword, parsed)) return null;
  return parsed;
}

export type ResolvedIntentFamily = {
  intentFamily: SearchIntentFamily;
  source: "ai" | "code";
};

/** AI proposes; code validates and falls back to angle/title inference. */
export function resolveStoredIntentFamily(input: {
  keyword: string;
  aiIntent?: unknown;
  angleId?: string | null;
  archetype?: StructuralArchetype | null;
  title?: string | null;
}): ResolvedIntentFamily {
  const codeIntent = inferIntentFamily({
    angleId: input.angleId,
    archetype: input.archetype,
    title: input.title,
  });
  const validated = validateAiIntentFamily(input.keyword, input.aiIntent);
  if (validated) {
    return { intentFamily: validated, source: "ai" };
  }
  const kw = keywordKey(input.keyword);
  const covered = getCoveredIntentFamilySet(kw);
  if (!covered.has(codeIntent)) {
    return { intentFamily: codeIntent, source: "code" };
  }
  const gap = recommendNextIntentFamily(kw);
  if (!covered.has(gap)) {
    return { intentFamily: gap, source: "code" };
  }
  return { intentFamily: codeIntent, source: "code" };
}

export function recommendIntentForContract(
  contract: Pick<EditorialContract, "keyword" | "angleId" | "archetype" | "seedTitle">
): SearchIntentFamily {
  const recommended = recommendNextIntentFamily(contract.keyword);
  const fromAngle = inferIntentFamily({
    angleId: contract.angleId,
    archetype: contract.archetype,
    title: contract.seedTitle,
  });
  const covered = getCoveredIntentFamilySet(contract.keyword);
  if (!covered.has(fromAngle)) return fromAngle;
  if (!covered.has(recommended)) return recommended;
  return fromAngle;
}

export function recordKeywordIntentWritten(input: {
  keyword: string;
  title: string;
  slug: string;
  angleId?: string | null;
  archetype?: StructuralArchetype | null;
  slotKey?: string | null;
  intentFamily?: SearchIntentFamily;
  source?: KeywordIntentRecord["source"];
}): void {
  const kw = keywordKey(input.keyword);
  if (!kw) return;

  const intentFamily =
    input.intentFamily ??
    resolveStoredIntentFamily({
      keyword: kw,
      angleId: input.angleId,
      archetype: input.archetype,
      title: input.title,
    }).intentFamily;

  const file = readRegistryFile();
  const list = file.byKeyword[kw] ?? [];
  const row: KeywordIntentRecord = {
    intentFamily,
    angleId: input.angleId ?? null,
    archetype: input.archetype ?? null,
    title: input.title.trim(),
    slug: input.slug.trim(),
    slotKey: input.slotKey ?? null,
    writtenAt: new Date().toISOString(),
    source: input.source ?? "automation",
  };

  const dedupeKey = recordKey(row);
  const filtered = list.filter((r) => recordKey(r) !== dedupeKey);
  filtered.push(row);
  filtered.sort(
    (a, b) => new Date(b.writtenAt).getTime() - new Date(a.writtenAt).getTime()
  );

  file.byKeyword[kw] = filtered;
  writeRegistryFile(file);
}

/** Merge published_topics + registry (registry wins on slug conflict). */
export async function syncKeywordIntentRegistryFromPublishedTopics(): Promise<{
  added: number;
  totalKeywords: number;
}> {
  const file = readRegistryFile();
  const existingSlugs = new Set<string>();
  for (const rows of Object.values(file.byKeyword)) {
    for (const r of rows) existingSlugs.add(r.slug);
  }

  let added = 0;
  const topics = await readPublishedTopics();
  for (const topic of topics) {
    if (existingSlugs.has(topic.slug)) continue;
    const parsed = parseSlotFromCategory(topic.category);
    const seoMatch = (topic.category ?? "").match(/seo:([^|]+)/i);
    const keyword = seoMatch?.[1]?.trim() || parsed.keyword;
    if (!keyword) continue;

    const kw = keywordKey(keyword);
    const intentFamily = inferIntentFamily({
      angleId: parsed.angleId,
      archetype: parseArchetypeFromCategory(topic.category),
      title: topic.title,
    });

    const row: KeywordIntentRecord = {
      intentFamily,
      angleId: parsed.angleId,
      archetype: parseArchetypeFromCategory(topic.category),
      title: topic.title,
      slug: topic.slug,
      slotKey:
        parsed.keyword && parsed.angleId
          ? `${parsed.keyword}::${parsed.angleId}`
          : null,
      writtenAt: topic.createdAt ?? topic.publishDate,
      source: "backfill",
    };

    file.byKeyword[kw] = file.byKeyword[kw] ?? [];
    file.byKeyword[kw].push(row);
    existingSlugs.add(topic.slug);
    added++;
  }

  if (added > 0) writeRegistryFile(file);
  return { added, totalKeywords: Object.keys(file.byKeyword).length };
}

export function formatKeywordIntentClusterPrompt(input: {
  keyword: string;
  recommendedIntent?: SearchIntentFamily;
  title?: string;
  angleId?: string | null;
}): string {
  const kw = keywordKey(input.keyword);
  const covered = getCoveredIntentsForKeyword(kw);
  const recommended =
    input.recommendedIntent ?? recommendNextIntentFamily(kw);
  const meta = intentFamilyMeta(recommended);

  const coveredBlock =
    covered.length === 0
      ? "COVERED INTENTS FOR THIS KEYWORD: (none yet — you are seeding the cluster)"
      : `COVERED INTENTS FOR THIS KEYWORD (do NOT cannibalize — write a different intent):
${covered
  .map(
    (r) =>
      `- ${r.intentFamily}: "${r.title}" (/blog/${r.slug})${r.angleId ? ` [angle: ${r.angleId}]` : ""}`
  )
  .join("\n")}`;

  const recommendBlock = meta
    ? `RECOMMENDED INTENT FOR THIS POST: ${recommended} (${meta.label})
Reader question: ${meta.readerQuestion}
Must deliver: ${meta.mustDeliver.map((m) => `- ${m}`).join("\n")}
${meta.avoidCannibalizing}`
    : `RECOMMENDED INTENT: ${recommended}`;

  const titleLine = input.title
    ? `Working title: "${input.title}" — must match the recommended intent.`
    : "";

  return `${formatIntentSelectionGuideBlock()}

PRIMARY KEYWORD CLUSTER: "${kw}"
${coveredBlock}

${recommendBlock}
${titleLine}`;
}

export function sortAngleIdsByIntentGap(
  keyword: string,
  angleIds: string[]
): string[] {
  const covered = getCoveredIntentFamilySet(keyword);
  return [...angleIds].sort((a, b) => {
    const intentA = inferIntentFamily({ angleId: a });
    const intentB = inferIntentFamily({ angleId: b });
    const gapA = covered.has(intentA) ? 1 : 0;
    const gapB = covered.has(intentB) ? 1 : 0;
    return gapA - gapB;
  });
}

export function loadKeywordIntentRegistryPreview(): KeywordIntentRegistryFile {
  return readRegistryFile();
}
