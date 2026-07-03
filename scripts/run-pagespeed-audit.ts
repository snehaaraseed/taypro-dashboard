/**
 * Monthly PageSpeed Insights audit (CLI wrapper).
 *
 * Usage:
 *   npx tsx scripts/run-pagespeed-audit.ts
 *   PAGESPEED_MAX_URLS=5 npx tsx scripts/run-pagespeed-audit.ts
 */

import { runPagespeedAudit } from "@/lib/seo/run-pagespeed-audit";

async function main() {
  const result = await runPagespeedAudit({
    onProgress: (done, total, url) => {
      console.log(`[pagespeed] ${done}/${total} ${url}`);
    },
  });

  console.log("\n[pagespeed] Summary");
  console.log(`  Run ID:          ${result.summary.runId}`);
  console.log(`  URLs audited:    ${result.pagesAudited}`);
  console.log(`  Failed:          ${result.pagesFailed}`);
  console.log(`  Median score:    ${result.summary.siteMedianScore}`);
  console.log(`  Below 70:        ${result.summary.pagesBelow70}`);
  console.log(`  Duration:        ${Math.round(result.durationMs / 1000)}s`);
  console.log(`  Report:          ${result.summaryPath}`);
}

main().catch((err) => {
  console.error("[pagespeed] FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});
