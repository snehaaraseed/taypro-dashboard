import "server-only";

/**
 * Weekly demand-first topic discovery.
 *
 * For each catalog domain, runs a Google Search grounded call to mine REAL
 * search demand (PAA, related searches, SERP gaps), validates each candidate
 * (dedup vs corpus + pending briefs, money-page/competitor guard, quality
 * score), and appends survivors to data/discovered-briefs.json. The daily blog
 * cron then writes one brief per day, top-scored first.
 *
 * Usage:
 *   npx tsx scripts/run-topic-discovery.ts [--domains=N] [--per-domain=N] [--target=N]
 */

import {
  discoverCandidatesForDomain,
  listDiscoveryDomainSeeds,
} from "@/lib/seo/topic-discovery";
import { validateCandidate } from "@/lib/seo/brief-validator";
import {
  appendDiscoveredBriefs,
  countBriefStats,
  loadDiscoveredBriefs,
  type DiscoveredBrief,
} from "@/lib/seo/discovered-brief-queue";
import { loadExistingBlogCorpus } from "@/lib/seo/blog-uniqueness";
import { readPublishedTopics } from "@/lib/cms/topicService";

function parseArg(name: string, fallback: number): number {
  const raw = process.argv
    .find((a) => a.startsWith(`--${name}=`))
    ?.split("=")[1];
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function main() {
  const perDomain = parseArg("per-domain", 5);
  const target = parseArg("target", 60);
  const allSeeds = listDiscoveryDomainSeeds();
  const maxDomains = parseArg("domains", allSeeds.length);
  const seeds = allSeeds.slice(0, maxDomains);

  console.log(
    `[discovery] Starting: ${seeds.length} domains, up to ${perDomain} candidates each, target +${target} briefs`
  );

  const corpus = await loadExistingBlogCorpus();
  const published = await readPublishedTopics();
  const forbiddenTitles = published.map((t) => t.title);

  const existingBriefs = loadDiscoveredBriefs();
  const existingBriefTitles = new Set(
    existingBriefs.map((b) => b.title.toLowerCase().trim())
  );
  const existingBriefKeywords = new Set(
    existingBriefs.map((b) => b.primaryKeyword.toLowerCase().trim())
  );

  const accepted: DiscoveredBrief[] = [];
  let candidateCount = 0;
  let rejectedCount = 0;
  const rejectionReasons = new Map<string, number>();

  for (const seed of seeds) {
    if (accepted.length >= target) break;
    const candidates = await discoverCandidatesForDomain({
      domainId: seed.domainId,
      domainLabel: seed.domainLabel,
      pillarPath: seed.pillarPath,
      forbiddenTitles,
      perDomain,
    });
    candidateCount += candidates.length;

    for (const candidate of candidates) {
      const result = await validateCandidate(candidate, {
        corpus,
        existingBriefTitles,
        existingBriefKeywords,
      });
      if (result.ok) {
        accepted.push(result.brief);
        forbiddenTitles.push(result.brief.title);
      } else {
        rejectedCount += 1;
        const key = result.reason.replace(/:.*$/, "").trim();
        rejectionReasons.set(key, (rejectionReasons.get(key) ?? 0) + 1);
      }
    }
    console.log(
      `[discovery] ${seed.domainLabel}: ${candidates.length} candidates, ${accepted.length} accepted so far`
    );
  }

  const added = appendDiscoveredBriefs(accepted);
  const stats = countBriefStats();

  console.log("\n[discovery] Summary");
  console.log(`  Candidates mined:   ${candidateCount}`);
  console.log(`  Accepted (new):     ${added}`);
  console.log(`  Rejected:           ${rejectedCount}`);
  if (rejectionReasons.size > 0) {
    console.log("  Top rejection reasons:");
    [...rejectionReasons.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .forEach(([reason, count]) => console.log(`    - ${reason}: ${count}`));
  }
  console.log(
    `  Queue now: ${stats.open} open / ${stats.total} total (${stats.filled} filled, ${stats.rejected} rejected)`
  );
}

main().catch((error) => {
  console.error("[discovery] Fatal:", error);
  process.exit(1);
});
