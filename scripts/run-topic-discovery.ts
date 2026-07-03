import "server-only";

/**
 * Weekly demand-first topic discovery (CLI wrapper).
 *
 * Usage:
 *   npx tsx scripts/run-topic-discovery.ts [--domains=N] [--per-domain=N] [--target=N]
 */

import {
  getDiscoveryWeeklyTarget,
  runTopicDiscovery,
} from "@/lib/seo/run-topic-discovery";
import { countBriefStats } from "@/lib/seo/discovered-brief-queue";

function parseArg(name: string, fallback: number): number {
  const raw = process.argv
    .find((a) => a.startsWith(`--${name}=`))
    ?.split("=")[1];
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function main() {
  const perDomain = parseArg("per-domain", 5);
  const target = parseArg("target", getDiscoveryWeeklyTarget());
  const maxDomains = parseArg("domains", 999);

  const result = await runTopicDiscovery({
    perDomain,
    target,
    maxDomains,
    reason: "cli",
  });

  const stats = countBriefStats();
  console.log("\n[discovery] Summary");
  console.log(`  Candidates mined:   ${result.candidatesMined}`);
  console.log(`  Accepted (new):     ${result.added}`);
  console.log(`  Rejected:           ${result.rejected}`);
  if (Object.keys(result.rejectionReasons).length > 0) {
    console.log("  Top rejection reasons:");
    Object.entries(result.rejectionReasons)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .forEach(([reason, count]) => console.log(`    - ${reason}: ${count}`));
  }
  console.log(
    `  Queue now: ${stats.open} open / ${stats.total} total (${stats.filled} filled, ${stats.rejected} rejected)`
  );
  console.log(`  Search focus: ${result.searchFocus}`);
}

main().catch((error) => {
  console.error("[discovery] Fatal:", error);
  process.exit(1);
});
