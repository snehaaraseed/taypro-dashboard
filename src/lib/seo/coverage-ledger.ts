import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { createSlug } from "@/app/utils/blogFileUtils";
import type { BlogSimilarityCorpusRow } from "@/lib/cms/blogService";
import { readPublishedTopics } from "@/lib/cms/topicService";
import {
  isTooGenericTitle,
} from "@/lib/seo/content-quality";
import { findKeywordCorpusConflict, findTitleConflict } from "@/lib/seo/blog-plan-gates";
import { anglesForKeyword } from "@/lib/seo/blog-topic-angles";
import { inferIntentFamily } from "@/lib/seo/keyword-intent-taxonomy";
import {
  formatIntentCategorySuffix,
  getCoveredIntentFamilySet,
  resolveStoredIntentCluster,
  sortAngleIdsByIntentGap,
} from "@/lib/seo/keyword-intent-registry";
import type { SearchIntentFamily } from "@/lib/seo/keyword-intent-taxonomy";
import { isCompetitorPrimaryKeyword } from "@/lib/seo/competitor-keyword-guard";
import { titlesTooSimilar } from "@/lib/seo/blog-similarity";
import type { SerpResearchBrief } from "@/lib/gemini/grounded-serp-research";
import { loadGscBoostKeywords } from "@/lib/seo/gsc-keyword-boost";
import {
  buildSeoKeywordBrief,
  formatTopicCategory,
  loadSeoKeywordRows,
  type SeoKeywordBrief,
} from "@/lib/seo/keyword-stats";
import { loadSeoBlogQueueKeywords } from "@/lib/seo/seo-blog-queue";
import {
  buildSyntheticMetaDescription,
  getAngleContractMeta,
  titleMatchesForbiddenArchetype,
  type AngleContractMeta,
} from "@/lib/seo/blog-angle-contracts";
import type { StructuralArchetype } from "@/lib/seo/corpus-index";
import {
  corpusEntriesInKeywordCluster,
  exhaustedArchetypesForKeywordCluster,
  loadCorpusIndex,
} from "@/lib/seo/corpus-index";
import {
  EditorialPreflightError,
  preFlightUniquenessProbe,
} from "@/lib/seo/blog-preflight-gates";
import type { BlogUniquenessContext } from "@/lib/seo/blog-plan-gates";
import { pickTopicTitleHybrid } from "@/lib/seo/blog-automation-hybrid";
import type { BlogAuthor } from "@/app/data/blogAuthors";
import type { TopicCategory } from "@/lib/topicCategories";

export type EditorialContract = CoverageSlot &
  AngleContractMeta & {
    syntheticMetaDescription: string;
    forbiddenArchetypes: StructuralArchetype[];
    forbiddenH2Themes: string[];
  };

export type CoverageSlot = {
  slotKey: string;
  keyword: string;
  angleId: string;
  angleLabel: string;
  seedTitle: string;
  audience: string;
  plantContext: string;
  seoBrief: SeoKeywordBrief;
};

export type CoverageLedgerFile = {
  filled: { slotKey: string; slug: string; filledAt: string }[];
  failed: { slotKey: string; reason: string; failedAt: string }[];
};

const DEFAULT_AUDIENCE = "om_lead";
const DEFAULT_CONTEXT = "utility_india";

function resolveLedgerPath(): string {
  const envPath = process.env.SEO_COVERAGE_LEDGER_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "seo-coverage-filled.json");
}

export function isCoverageLedgerEnabled(): boolean {
  const raw = process.env.COVERAGE_LEDGER_ENABLED?.trim().toLowerCase();
  if (raw === "false" || raw === "0") return false;
  return true;
}

const PREFLIGHT_FAILURE_PREFIX = "Pre-flight uniqueness failed";

/** Failures that must never be retried by retry-failed-slots / minimal-guards tiers. */
export const PERMANENT_SLOT_FAILURE_MARKERS = [
  "No unique title for coverage slot",
  PREFLIGHT_FAILURE_PREFIX,
  "Topic already published",
  "already covered by existing post",
] as const;

export function isPermanentSlotFailure(reason: string): boolean {
  return PERMANENT_SLOT_FAILURE_MARKERS.some((marker) =>
    reason.includes(marker)
  );
}

/** Thrown when every title candidate for a slot is blocked — slot must not be retried. */
export class SlotTitleExhaustedError extends Error {
  readonly slotKey: string;
  readonly keyword: string;

  constructor(slotKey: string, keyword: string) {
    super(`No unique title for coverage slot ${slotKey}`);
    this.name = "SlotTitleExhaustedError";
    this.slotKey = slotKey;
    this.keyword = keyword;
  }
}

export async function loadPermanentFailedSlotKeys(): Promise<Set<string>> {
  const permanent = new Set<string>();
  const ledger = readLedgerFile();
  for (const row of ledger.failed) {
    if (row.slotKey && isPermanentSlotFailure(row.reason)) {
      permanent.add(row.slotKey);
    }
  }
  return permanent;
}

/** Seed-title probes are not final failures — drop stale preflight blocks from the ledger. */
export function prunePreflightFailedSlots(): number {
  const ledger = readLedgerFile();
  const before = ledger.failed.length;
  ledger.failed = ledger.failed.filter(
    (row) => !row.reason.startsWith(PREFLIGHT_FAILURE_PREFIX)
  );
  if (ledger.failed.length < before) {
    writeLedgerFile(ledger);
  }
  return before - ledger.failed.length;
}

export function buildSlotKey(keyword: string, angleId: string): string {
  return `${keyword.toLowerCase().trim()}::${angleId.trim()}`;
}

export function parseSlotKey(slotKey: string): { keyword: string; angleId: string } | null {
  const idx = slotKey.indexOf("::");
  if (idx <= 0) return null;
  return {
    keyword: slotKey.slice(0, idx).trim(),
    angleId: slotKey.slice(idx + 2).trim(),
  };
}

/** Parse slot metadata from published_topics.category string. */
export function parseSlotFromCategory(category?: string): {
  keyword: string | null;
  angleId: string | null;
  audience: string | null;
  plantContext: string | null;
  intentFamily: string | null;
  subAngle: string | null;
} {
  const cat = category ?? "";
  const seoMatch = cat.match(/seo:([^|]+)/i);
  const slotMatch = cat.match(/slot:([^|]+)/i);
  const audMatch = cat.match(/aud:([^|]+)/i);
  const ctxMatch = cat.match(/ctx:([^|]+)/i);
  const intentMatch = cat.match(/intent:([^|]+)/i);
  const subangMatch = cat.match(/subang:([^|]+)/i);
  return {
    keyword: seoMatch?.[1]?.trim().toLowerCase() ?? null,
    angleId: slotMatch?.[1]?.trim() ?? null,
    audience: audMatch?.[1]?.trim() ?? null,
    plantContext: ctxMatch?.[1]?.trim() ?? null,
    intentFamily: intentMatch?.[1]?.trim().toLowerCase() ?? null,
    subAngle: subangMatch?.[1]?.trim() ?? null,
  };
}

function readLedgerFile(): CoverageLedgerFile {
  const filePath = resolveLedgerPath();
  if (!fs.existsSync(filePath)) {
    return { filled: [], failed: [] };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as CoverageLedgerFile & {
      description?: string;
    };
    return {
      filled: Array.isArray(raw.filled) ? raw.filled : [],
      failed: Array.isArray(raw.failed) ? raw.failed : [],
    };
  } catch {
    return { filled: [], failed: [] };
  }
}

function writeLedgerFile(data: CoverageLedgerFile): void {
  const filePath = resolveLedgerPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    JSON.stringify(
      {
        description:
          "Filled and failed coverage ledger slots (keyword::angleId). Backfill via scripts/backfill-coverage-slots.mjs",
        ...data,
      },
      null,
      2
    )
  );
}

export async function loadFilledSlotKeys(): Promise<Set<string>> {
  const filled = new Set<string>();
  const ledger = readLedgerFile();
  for (const row of ledger.filled) {
    if (row.slotKey) filled.add(row.slotKey);
  }

  const topics = await readPublishedTopics();
  for (const topic of topics) {
    const parsed = parseSlotFromCategory(topic.category);
    if (parsed.keyword && parsed.angleId) {
      filled.add(buildSlotKey(parsed.keyword, parsed.angleId));
    }
  }

  return filled;
}

export async function loadFailedSlotKeys(): Promise<Set<string>> {
  const failed = new Set<string>();
  const ledger = readLedgerFile();
  for (const row of ledger.failed) {
    if (row.slotKey) failed.add(row.slotKey);
  }
  return failed;
}

function orderedKeywords(): string[] {
  const queue = loadSeoBlogQueueKeywords();
  const boost = loadGscBoostKeywords();
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const kw of [...queue, ...boost]) {
    const lower = kw.toLowerCase().trim();
    if (!lower || seen.has(lower)) continue;
    seen.add(lower);
    ordered.push(lower);
  }

  const rows = loadSeoKeywordRows();
  for (const row of rows) {
    if (!seen.has(row.keyword)) {
      seen.add(row.keyword);
      ordered.push(row.keyword);
    }
  }

  return ordered;
}

export function buildSlotCatalog(): Omit<CoverageSlot, "seoBrief">[] {
  const slots: Omit<CoverageSlot, "seoBrief">[] = [];
  const rows = loadSeoKeywordRows();
  const byKeyword = new Map(rows.map((r) => [r.keyword, r]));

  for (const keyword of orderedKeywords()) {
    if (!byKeyword.has(keyword)) continue;
    const angles = anglesForKeyword(keyword);
    const sortedIds = sortAngleIdsByIntentGap(
      keyword,
      angles.map((a) => a.id)
    );
    const angleById = new Map(angles.map((a) => [a.id, a]));
    for (const angleId of sortedIds) {
      const angle = angleById.get(angleId);
      if (!angle) continue;
      const seedTitle = angle.buildTitle(keyword).trim();
      slots.push({
        slotKey: buildSlotKey(keyword, angle.id),
        keyword,
        angleId: angle.id,
        angleLabel: angle.id.replace(/-/g, " "),
        seedTitle,
        audience: DEFAULT_AUDIENCE,
        plantContext: DEFAULT_CONTEXT,
      });
    }
  }

  return slots;
}

/** Rotate catalog scan order by UTC day so cron does not always hit the same keywords first. */
export function rotatedSlotCatalog(): Omit<CoverageSlot, "seoBrief">[] {
  const slots = buildSlotCatalog();
  if (slots.length <= 1) return slots;
  const dayOffset = Math.floor(Date.now() / 86_400_000) % slots.length;
  return [...slots.slice(dayOffset), ...slots.slice(0, dayOffset)];
}

export type PickCoverageSlotOptions = {
  excludeKeywords?: string[];
  rejectedSlotKeys?: string[];
  corpus?: BlogSimilarityCorpusRow[];
  skipFailed?: boolean;
};

export type PickEditorialContractOptions = PickCoverageSlotOptions & {
  uniquenessCtx?: BlogUniquenessContext;
  /** When set, only pick contracts for this keyword (campaign focus day). */
  focusKeyword?: string;
};

type PickRelaxation = {
  /** Omit or set undefined to scan all keywords (no campaign focus filter). */
  focusKeyword?: string;
  clearFocusKeyword?: boolean;
  skipKeywordCorpusBlock?: boolean;
  skipPreflight?: boolean;
  skipArchetypeExhaustion?: boolean;
  skipSeedArchetypeTitleMatch?: boolean;
};

function buildForbiddenArchetypeSet(
  keyword: string,
  angleMeta: AngleContractMeta
): StructuralArchetype[] {
  const index = loadCorpusIndex();
  const exhausted = exhaustedArchetypesForKeywordCluster(keyword, index);
  return [
    ...new Set<StructuralArchetype>([
      ...(angleMeta.forbiddenArchetypes ?? []),
      ...exhausted,
    ]),
  ];
}

async function scanForEditorialContract(
  options: PickEditorialContractOptions & PickRelaxation
): Promise<EditorialContract | null> {
  const filled = await loadFilledSlotKeys();
  const permanentFailed = await loadPermanentFailedSlotKeys();
  const allFailed = await loadFailedSlotKeys();
  /** retry-failed-slots may retry transient failures only — never permanent blocks. */
  const failedToSkip =
    options.skipFailed === false ? permanentFailed : allFailed;
  const excludedKeywords = new Set(
    (options.excludeKeywords ?? [])
      .map((k) => k.toLowerCase().trim())
      .filter(Boolean)
  );
  const rejectedSlots = new Set(options.rejectedSlotKeys ?? []);
  const rows = loadSeoKeywordRows();
  const available = rows.filter(Boolean);
  const byKeyword = new Map(available.map((r) => [r.keyword, r]));
  const index = loadCorpusIndex();
  const ctx = options.uniquenessCtx;
  const corpus = options.corpus ?? [];
  const focusKeyword = options.clearFocusKeyword
    ? null
    : options.focusKeyword?.toLowerCase().trim() || null;

  for (const slot of rotatedSlotCatalog()) {
    if (focusKeyword && slot.keyword.toLowerCase() !== focusKeyword) continue;
    if (filled.has(slot.slotKey)) continue;
    if (permanentFailed.has(slot.slotKey)) continue;
    if (failedToSkip.has(slot.slotKey)) continue;
    if (rejectedSlots.has(slot.slotKey)) continue;
    if (excludedKeywords.has(slot.keyword)) continue;
    if (isCompetitorPrimaryKeyword(slot.keyword)) continue;

    const row = byKeyword.get(slot.keyword);
    if (!row) continue;

    if (corpus.length && !options.skipKeywordCorpusBlock) {
      const conflict = findKeywordCorpusConflict(slot.keyword, corpus);
      if (conflict) continue;
    }

    const angleMeta = getAngleContractMeta(slot.angleId);
    if (!options.skipPreflight) {
      const coveredFamilies = getCoveredIntentFamilySet(slot.keyword);
      const slotIntent = inferIntentFamily({
        angleId: slot.angleId,
        archetype: angleMeta.archetype,
        title: slot.seedTitle,
      });
      if (coveredFamilies.has(slotIntent)) {
        const hasUncoveredSibling = rotatedSlotCatalog().some((sibling) => {
          if (sibling.keyword !== slot.keyword) return false;
          if (sibling.slotKey === slot.slotKey) return false;
          if (filled.has(sibling.slotKey) || permanentFailed.has(sibling.slotKey)) {
            return false;
          }
          const siblingMeta = getAngleContractMeta(sibling.angleId);
          const siblingIntent = inferIntentFamily({
            angleId: sibling.angleId,
            archetype: siblingMeta.archetype,
            title: sibling.seedTitle,
          });
          return !coveredFamilies.has(siblingIntent);
        });
        if (hasUncoveredSibling) continue;
      }
    }
    const forbiddenArchetypes = buildForbiddenArchetypeSet(
      slot.keyword,
      angleMeta
    );
    if (
      !options.skipArchetypeExhaustion &&
      exhaustedArchetypesForKeywordCluster(slot.keyword, index).has(
        angleMeta.archetype
      )
    ) {
      continue;
    }

    if (
      !options.skipSeedArchetypeTitleMatch &&
      titleMatchesForbiddenArchetype(slot.seedTitle, forbiddenArchetypes)
    ) {
      continue;
    }

    const syntheticMetaDescription = buildSyntheticMetaDescription(
      slot.keyword,
      angleMeta
    );

    if (ctx && corpus.length && !options.skipPreflight) {
      const probe = await preFlightUniquenessProbe(
        {
          title: slot.seedTitle,
          description: syntheticMetaDescription,
          h2Outline: angleMeta.h2Template,
          slug: createSlug(slot.seedTitle),
        },
        ctx,
        corpus
      );
      if (probe) {
        continue;
      }
    }

    const clusterEntries = corpusEntriesInKeywordCluster(slot.keyword, index);
    const forbiddenH2Themes = [
      ...new Set(clusterEntries.flatMap((e) => e.h2Outline).slice(0, 12)),
    ];

    return {
      ...slot,
      ...angleMeta,
      seoBrief: buildSeoKeywordBrief(row, available),
      syntheticMetaDescription,
      forbiddenArchetypes,
      forbiddenH2Themes,
    };
  }

  return null;
}

/** Strict pick for status previews — returns null when no slot passes default guards. */
export async function pickNextEditorialContract(
  options?: PickEditorialContractOptions
): Promise<EditorialContract | null> {
  return scanForEditorialContract({
    ...options,
    focusKeyword: options?.focusKeyword,
  });
}

/**
 * Ledger-only pick: walks progressively relaxed tiers until a keyword×angle contract is found.
 * Same keyword with a different angle is allowed once strict keyword-level blocking is relaxed.
 */
export async function pickNextEditorialContractAlways(
  options?: PickEditorialContractOptions
): Promise<EditorialContract> {
  const campaignFocus = options?.focusKeyword?.toLowerCase().trim() || null;
  const tiers: Array<{
    label: string;
    relaxation: PickRelaxation & Pick<PickEditorialContractOptions, "skipFailed">;
  }> = [
    {
      label: "campaign-focus",
      relaxation: { focusKeyword: campaignFocus || undefined },
    },
    { label: "catalog-wide", relaxation: { clearFocusKeyword: true } },
    {
      label: "keyword-angle-reuse",
      relaxation: { clearFocusKeyword: true, skipKeywordCorpusBlock: true },
    },
    {
      label: "minimal-guards",
      relaxation: {
        clearFocusKeyword: true,
        skipKeywordCorpusBlock: true,
        skipFailed: false,
        skipPreflight: true,
        skipArchetypeExhaustion: true,
        skipSeedArchetypeTitleMatch: true,
      },
    },
  ];

  for (const tier of tiers) {
    if (tier.label === "campaign-focus" && !campaignFocus) continue;

    const contract = await scanForEditorialContract({
      ...options,
      ...tier.relaxation,
    });
    if (contract) {
      if (tier.label !== "campaign-focus") {
        console.info(
          `Coverage ledger: picked via ${tier.label} → ${contract.slotKey}`
        );
      }
      return contract;
    }
  }

  throw new Error(
    "Coverage ledger exhausted: no open keyword×angle slot remains in the catalog"
  );
}

export async function pickNextCoverageSlot(
  options?: PickCoverageSlotOptions
): Promise<CoverageSlot | null> {
  const contract = await pickNextEditorialContract(options);
  return contract;
}

export function formatCoverageTopicCategory(
  categoryName: string,
  contract: EditorialContract | CoverageSlot,
  intent?: { intentFamily?: SearchIntentFamily; subAngle?: string | null }
): string {
  const base = formatTopicCategory(categoryName, contract.keyword);
  const archetype =
    "archetype" in contract ? contract.archetype : "general_om";
  const intentSuffix =
    intent?.intentFamily != null
      ? `|${formatIntentCategorySuffix(intent.intentFamily, intent.subAngle)}`
      : "";
  return `${base}|slot:${contract.angleId}|arch:${archetype}|aud:${contract.audience}|ctx:${contract.plantContext}${intentSuffix}`;
}

export function markSlotFilled(slotKey: string, slug: string): void {
  const ledger = readLedgerFile();
  ledger.filled = ledger.filled.filter((row) => row.slotKey !== slotKey);
  ledger.filled.push({
    slotKey,
    slug,
    filledAt: new Date().toISOString(),
  });
  ledger.failed = ledger.failed.filter((row) => row.slotKey !== slotKey);
  writeLedgerFile(ledger);
}

export function markSlotFailed(slotKey: string, reason: string): void {
  const ledger = readLedgerFile();
  ledger.failed = ledger.failed.filter((row) => row.slotKey !== slotKey);
  ledger.failed.push({
    slotKey,
    reason: reason.slice(0, 500),
    failedAt: new Date().toISOString(),
  });
  writeLedgerFile(ledger);
}

function titleReflectsKeyword(title: string, keyword: string): boolean {
  const t = title.toLowerCase();
  const k = keyword.toLowerCase().trim();
  if (t.includes(k)) return true;
  const words = k.split(/\s+/).filter((w) => w.length > 3);
  if (words.length === 0) return true;
  const hits = words.filter((w) => t.includes(w)).length;
  return hits >= Math.ceil(words.length * 0.6);
}

function isForbiddenTitle(
  title: string,
  forbidden: string[],
  seoKeyword: string
): boolean {
  const trimmed = title.trim();
  if (!trimmed || trimmed.length > 72) return true;
  if (isTooGenericTitle(trimmed, seoKeyword)) return true;
  if (!titleReflectsKeyword(trimmed, seoKeyword)) return true;

  for (const f of forbidden) {
    if (titlesTooSimilar(trimmed, f)) return true;
  }
  return false;
}

export type TitleCheckpointContext = {
  contract: EditorialContract;
  description: string;
  ctx: BlogUniquenessContext;
  corpus: BlogSimilarityCorpusRow[];
};

export async function validateTitleCandidate(
  title: string,
  seoKeyword: string,
  forbiddenTitles: string[],
  checkpoint?: TitleCheckpointContext
): Promise<boolean> {
  if (isForbiddenTitle(title, forbiddenTitles, seoKeyword)) return false;
  const slug = createSlug(title);
  const conflict = await findTitleConflict(title, slug);
  if (conflict) return false;
  if (checkpoint) {
    const match = await preFlightUniquenessProbe(
      {
        title,
        description: checkpoint.description,
        h2Outline: checkpoint.contract.h2Template,
        slug,
      },
      checkpoint.ctx,
      checkpoint.corpus
    );
    if (match) return false;
  }
  return true;
}

/** Slug/title collision check only — skips pre-flight corpus probe (last-resort path). */
export async function validateTitleCandidateLoose(
  title: string,
  seoKeyword: string,
  forbiddenTitles: string[]
): Promise<boolean> {
  if (isForbiddenTitle(title, forbiddenTitles, seoKeyword)) return false;
  const slug = createSlug(title);
  const conflict = await findTitleConflict(title, slug);
  return !conflict;
}

/** Deterministic unique title when SERP/hybrid candidates are saturated. */
export function buildLastResortTitle(contract: EditorialContract): string {
  const year = new Date().getFullYear();
  const angle = contract.angleLabel.replace(/\b\w/g, (c) => c.toUpperCase());
  const diff =
    contract.requiredDifferentiator?.trim() ||
    contract.structuralPromise?.trim() ||
    angle;
  let title = `${diff} for ${contract.keyword} in India (${year})`;
  if (title.length > 72) {
    title = `${contract.keyword}: ${angle} (${year})`;
  }
  return title.length > 72 ? title.slice(0, 72).trim() : title;
}

export type ResolveTitleResult = {
  title: string;
  /** When true, skip checkpoint B pre-flight (looser uniqueness path). */
  skipCheckpointB: boolean;
  intentFamily?: SearchIntentFamily;
  subAngle?: string;
};

function buildTitleIntentResult(
  contract: EditorialContract,
  title: string,
  skipCheckpointB: boolean,
  hybrid?: { intentFamily?: SearchIntentFamily; subAngle?: string }
): ResolveTitleResult {
  const cluster = resolveStoredIntentCluster({
    keyword: contract.keyword,
    aiIntent: hybrid?.intentFamily,
    aiSubAngle: hybrid?.subAngle,
    angleId: contract.angleId,
    archetype: contract.archetype,
    title,
  });
  return {
    title,
    skipCheckpointB,
    intentFamily: cluster.intentFamily,
    subAngle: cluster.subAngle,
  };
}

/** SERP → multi hybrid → seed → last-resort title with escalating relaxation. */
export async function resolveTitleForEditorialContract(input: {
  serpBrief: SerpResearchBrief;
  contract: EditorialContract;
  forbiddenTitles: string[];
  rejectedTitles: string[];
  titleCheckpoint: TitleCheckpointContext;
  category: TopicCategory;
  bylineAuthor: BlogAuthor;
  editorialContext: string;
}): Promise<ResolveTitleResult> {
  const { contract, serpBrief, forbiddenTitles, titleCheckpoint } = input;
  const hybridRejected = [...input.rejectedTitles];

  let title = await pickTitleFromSerpBrief(
    serpBrief,
    contract,
    forbiddenTitles,
    titleCheckpoint
  );
  if (title) return buildTitleIntentResult(contract, title, false);

  title = await pickTitleFromSerpBrief(
    serpBrief,
    contract,
    forbiddenTitles
  );
  if (title) return buildTitleIntentResult(contract, title, true);

  const attemptsRaw = process.env.BLOG_TITLE_HYBRID_ATTEMPTS?.trim();
  const hybridAttempts = attemptsRaw
    ? Number.parseInt(attemptsRaw, 10)
    : 8;
  const maxHybrid =
    Number.isFinite(hybridAttempts) && hybridAttempts > 0 ? hybridAttempts : 8;

  for (let i = 0; i < maxHybrid; i++) {
    try {
      const fallback = await pickTopicTitleHybrid({
        seoBrief: contract.seoBrief,
        category: input.category,
        author: input.bylineAuthor,
        editorialContext: input.editorialContext,
        rejectedTitles: hybridRejected,
      });
      if (!fallback.title) continue;
      hybridRejected.push(fallback.title);
      if (
        await validateTitleCandidate(
          fallback.title,
          contract.keyword,
          forbiddenTitles,
          titleCheckpoint
        )
      ) {
        return buildTitleIntentResult(contract, fallback.title, false, {
          intentFamily: fallback.intentFamily,
          subAngle: fallback.subAngle,
        });
      }
      if (
        await validateTitleCandidateLoose(
          fallback.title,
          contract.keyword,
          forbiddenTitles
        )
      ) {
        return buildTitleIntentResult(contract, fallback.title, true, {
          intentFamily: fallback.intentFamily,
          subAngle: fallback.subAngle,
        });
      }
    } catch {
      break;
    }
  }

  if (
    await validateTitleCandidate(
      contract.seedTitle,
      contract.keyword,
      forbiddenTitles,
      titleCheckpoint
    )
  ) {
    return buildTitleIntentResult(contract, contract.seedTitle, false);
  }

  const lastResort = buildLastResortTitle(contract);
  if (
    await validateTitleCandidateLoose(
      lastResort,
      contract.keyword,
      forbiddenTitles
    )
  ) {
    console.warn(
      `Coverage ledger: last-resort title for ${contract.slotKey}: ${lastResort}`
    );
    return buildTitleIntentResult(contract, lastResort, true);
  }

  throw new SlotTitleExhaustedError(contract.slotKey, contract.keyword);
}

/** Code-first title pick from grounded SERP brief, then slot seed. */
export async function pickTitleFromSerpBrief(
  brief: SerpResearchBrief,
  contract: EditorialContract,
  forbiddenTitles: string[],
  checkpoint?: TitleCheckpointContext
): Promise<string | null> {
  const forbidden = [...forbiddenTitles];
  for (const r of brief.rankingTitles) {
    if (r.title) forbidden.push(r.title);
  }

  for (const candidate of brief.candidateTitles) {
    if (titleMatchesForbiddenArchetype(candidate, contract.forbiddenArchetypes)) {
      continue;
    }
    if (
      await validateTitleCandidate(
        candidate,
        contract.keyword,
        forbidden,
        checkpoint
      )
    ) {
      return candidate.trim();
    }
  }

  if (
    !titleMatchesForbiddenArchetype(contract.seedTitle, contract.forbiddenArchetypes) &&
    (await validateTitleCandidate(
      contract.seedTitle,
      contract.keyword,
      forbidden,
      checkpoint
    ))
  ) {
    return contract.seedTitle;
  }

  return null;
}

export function serpBriefCacheEnabled(): boolean {
  const raw = process.env.BLOG_SERP_BRIEF_CACHE_PER_RUN?.trim().toLowerCase();
  if (raw === "false" || raw === "0") return false;
  return true;
}

function serpBriefCachePath(slotKey: string): string {
  const safe = slotKey.replace(/[^a-z0-9:-]+/gi, "_");
  return path.join(getDeploymentRoot(), ".runtime", "blog-research", `${safe}.json`);
}

export function loadCachedSerpBrief(slotKey: string): SerpResearchBrief | null {
  if (!serpBriefCacheEnabled()) return null;
  const file = serpBriefCachePath(slotKey);
  if (!fs.existsSync(file)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8")) as { serpBrief?: SerpResearchBrief };
    return raw.serpBrief ?? null;
  } catch {
    return null;
  }
}

export function saveCachedSerpBrief(
  slotKey: string,
  serpBrief: SerpResearchBrief
): void {
  if (!serpBriefCacheEnabled()) return;
  const file = serpBriefCachePath(slotKey);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    JSON.stringify({ savedAt: new Date().toISOString(), serpBrief }, null, 2)
  );
}

/** Checkpoint B: title + synthetic meta must pass pre-flight before fact research. */
export async function assertCheckpointB(
  contract: EditorialContract,
  title: string,
  description: string,
  ctx: BlogUniquenessContext,
  corpus: BlogSimilarityCorpusRow[]
): Promise<void> {
  const match = await preFlightUniquenessProbe(
    {
      title,
      description,
      h2Outline: contract.h2Template,
      slug: createSlug(title),
    },
    ctx,
    corpus
  );
  if (match) {
    throw new EditorialPreflightError(
      match,
      contract.slotKey,
      contract.keyword,
      title
    );
  }
}

export function buildForbiddenTitles(
  corpus: BlogSimilarityCorpusRow[],
  rejectedTitles: string[] = [],
  serpBrief?: SerpResearchBrief | null
): string[] {
  const titles = new Set<string>();
  for (const row of corpus) {
    if (row.title?.trim()) titles.add(row.title.trim());
  }
  for (const t of rejectedTitles) {
    if (t.trim()) titles.add(t.trim());
  }
  if (serpBrief) {
    for (const r of serpBrief.rankingTitles) {
      if (r.title?.trim()) titles.add(r.title.trim());
    }
  }
  return [...titles];
}

export function persistBlogResearchBriefs(input: {
  slug: string;
  slot: CoverageSlot;
  serpBrief: SerpResearchBrief;
  factBrief?: unknown;
}): void {
  const dir = path.join(getDeploymentRoot(), ".runtime", "blog-research");
  fs.mkdirSync(dir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const file = path.join(dir, `${date}-${input.slug}.json`);
  fs.writeFileSync(
    file,
    JSON.stringify(
      {
        savedAt: new Date().toISOString(),
        slot: input.slot,
        serpBrief: input.serpBrief,
        factBrief: input.factBrief ?? null,
      },
      null,
      2
    )
  );
}
