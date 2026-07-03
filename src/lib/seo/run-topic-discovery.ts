import "server-only";

import {
  discoverCandidatesForDomain,
  listDiscoveryDomainSeeds,
  type DomainDiscoverySeed,
} from "@/lib/seo/topic-discovery";
import { validateCandidate } from "@/lib/seo/brief-validator";
import {
  appendDiscoveredBriefs,
  countBriefStats,
  loadDiscoveredBriefs,
  loadDiscoveredBriefsState,
  type DiscoveredBrief,
} from "@/lib/seo/discovered-brief-queue";
import {
  advanceDiscoveryRunState,
  loadDiscoveryRunState,
  pickDiscoverySearchFocus,
} from "@/lib/seo/discovery-run-state";
import { loadExistingBlogCorpus } from "@/lib/seo/blog-uniqueness";
import { readPublishedTopics } from "@/lib/cms/topicService";

export type RunTopicDiscoveryOptions = {
  /** Stop after this many new briefs accepted in this run. */
  target?: number;
  /** Max domains to scan (default: all). */
  maxDomains?: number;
  /** Candidates requested per domain grounding call. */
  perDomain?: number;
  /** Why this run was triggered (for logs). */
  reason?: string;
};

export type RunTopicDiscoveryResult = {
  candidatesMined: number;
  accepted: number;
  added: number;
  rejected: number;
  rejectionReasons: Record<string, number>;
  openBriefs: number;
  searchFocus: string;
  domainsScanned: number;
};

function parseEnvInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getDiscoveryMinOpenBriefs(): number {
  return parseEnvInt("DISCOVERY_MIN_OPEN_BRIEFS", 3);
}

export function getDiscoveryTargetWhenLow(): number {
  return parseEnvInt("DISCOVERY_TARGET_WHEN_LOW", 12);
}

export function getDiscoveryWeeklyTarget(): number {
  return parseEnvInt("DISCOVERY_TARGET", 30);
}

function rotateDomainSeeds(
  seeds: DomainDiscoverySeed[],
  offset: number
): DomainDiscoverySeed[] {
  if (seeds.length === 0) return seeds;
  const o = ((offset % seeds.length) + seeds.length) % seeds.length;
  return [...seeds.slice(o), ...seeds.slice(0, o)];
}

function collectForbiddenQueries(): string[] {
  const fromBriefs = loadDiscoveredBriefs().map((b) => b.query.trim());
  const state = loadDiscoveredBriefsState();
  const fromRun = loadDiscoveryRunState().recentQueries;
  return [...new Set([...fromBriefs, ...fromRun].filter(Boolean))];
}

/** Grounded demand mining + validation → append to discovered-briefs.json. */
export async function runTopicDiscovery(
  options?: RunTopicDiscoveryOptions
): Promise<RunTopicDiscoveryResult> {
  const runState = loadDiscoveryRunState();
  const searchFocus = pickDiscoverySearchFocus(runState.searchFocusIndex);
  const perDomain = options?.perDomain ?? parseEnvInt("DISCOVERY_PER_DOMAIN", 5);
  const target = options?.target ?? getDiscoveryWeeklyTarget();
  const allSeeds = rotateDomainSeeds(
    listDiscoveryDomainSeeds(),
    runState.domainRotationOffset
  );
  const maxDomains =
    options?.maxDomains ?? parseEnvInt("DISCOVERY_DOMAINS", allSeeds.length);
  const seeds = allSeeds.slice(0, maxDomains);
  const forbiddenQueries = collectForbiddenQueries();

  const reason = options?.reason ?? "manual";
  console.info(
    `[discovery] Start (${reason}): ${seeds.length} domains, +${target} target, focus="${searchFocus.slice(0, 60)}…"`
  );

  const corpus = await loadExistingBlogCorpus();
  const published = await readPublishedTopics();
  const forbiddenTitles = [
    ...published.map((t) => t.title),
    ...loadDiscoveredBriefs().map((b) => b.title),
  ];

  const existingBriefs = loadDiscoveredBriefs();
  const existingBriefTitles = new Set(
    existingBriefs.map((b) => b.title.toLowerCase().trim())
  );
  const existingBriefKeywords = new Set(
    existingBriefs.map((b) => b.primaryKeyword.toLowerCase().trim())
  );
  const existingBriefQueries = new Set(
    existingBriefs.map((b) => b.query.toLowerCase().trim())
  );

  const accepted: DiscoveredBrief[] = [];
  const newQueries: string[] = [];
  let candidateCount = 0;
  let rejectedCount = 0;
  const rejectionReasons = new Map<string, number>();
  let domainsScanned = 0;

  for (const seed of seeds) {
    if (accepted.length >= target) break;
    domainsScanned += 1;

    const candidates = await discoverCandidatesForDomain({
      domainId: seed.domainId,
      domainLabel: seed.domainLabel,
      pillarPath: seed.pillarPath,
      forbiddenTitles,
      forbiddenQueries,
      searchFocus,
      runStamp: new Date().toISOString().slice(0, 10),
      perDomain,
    });
    candidateCount += candidates.length;

    for (const candidate of candidates) {
      const result = await validateCandidate(candidate, {
        corpus,
        existingBriefTitles,
        existingBriefKeywords,
        existingBriefQueries,
        discoveryMode: true,
      });
      if (result.ok) {
        accepted.push(result.brief);
        forbiddenTitles.push(result.brief.title);
        existingBriefQueries.add(result.brief.query.toLowerCase().trim());
        newQueries.push(result.brief.query);
      } else {
        rejectedCount += 1;
        const key = result.reason.replace(/:.*$/, "").trim();
        rejectionReasons.set(key, (rejectionReasons.get(key) ?? 0) + 1);
      }
    }
    console.info(
      `[discovery] ${seed.domainLabel}: ${candidates.length} candidates, ${accepted.length} accepted`
    );
  }

  const added = appendDiscoveredBriefs(accepted);
  advanceDiscoveryRunState({ domainsProcessed: domainsScanned, newQueries });
  const stats = countBriefStats();

  const summary: RunTopicDiscoveryResult = {
    candidatesMined: candidateCount,
    accepted: accepted.length,
    added,
    rejected: rejectedCount,
    rejectionReasons: Object.fromEntries(rejectionReasons),
    openBriefs: stats.open,
    searchFocus,
    domainsScanned,
  };

  console.info(
    `[discovery] Done: +${added} briefs (${stats.open} open), ${candidateCount} mined, ${rejectedCount} rejected`
  );
  return summary;
}

/** Refill queue when open briefs drop below the configured floor. */
export async function ensureBriefQueueForAutomation(): Promise<RunTopicDiscoveryResult | null> {
  const stats = countBriefStats();
  const minOpen = getDiscoveryMinOpenBriefs();
  if (stats.open >= minOpen) return null;

  return runTopicDiscovery({
    target: getDiscoveryTargetWhenLow(),
    reason: `automation-refill (${stats.open} open, min ${minOpen})`,
  });
}
