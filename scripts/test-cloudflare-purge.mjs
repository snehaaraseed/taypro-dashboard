#!/usr/bin/env node
/**
 * Test Cloudflare single-URL purge against production.
 *
 * Usage:
 *   node scripts/test-cloudflare-purge.mjs
 *   node scripts/test-cloudflare-purge.mjs /company
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  expandPathsToLocalizedUrls,
  purgeCloudflarePaths,
} from "../src/lib/seo/purge-cloudflare-cache.ts";

function loadEnvLocal() {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const testPath = process.argv[2] || "/company";

async function cfStatus(url) {
  const res = await fetch(url, {
    headers: { "Cache-Control": "no-cache" },
    redirect: "follow",
  });
  return {
    status: res.status,
    cfCache: res.headers.get("cf-cache-status") ?? "unknown",
  };
}

const urls = expandPathsToLocalizedUrls([testPath], ["en"]);
const url = urls[0];
if (!url) {
  console.error("No URL to test");
  process.exit(1);
}

console.log(`Testing purge for: ${url}`);

const before = await cfStatus(url);
console.log(`Before purge: HTTP ${before.status}, cf-cache-status=${before.cfCache}`);

const ok = await purgeCloudflarePaths([testPath], ["en"]);
if (!ok) {
  console.error("❌ Purge API call failed or skipped (check API token)");
  process.exit(1);
}

const after = await cfStatus(url);
console.log(`After purge:  HTTP ${after.status}, cf-cache-status=${after.cfCache}`);

const urlsExpanded = expandPathsToLocalizedUrls(["/blog", "/blog/test-slug"], ["en", "hi"]);
const hubsFiltered = urlsExpanded.filter((u) => u.includes("test-slug") || !u.endsWith("/blog"));
console.log("\nURL expansion check (detail + hub, en+hi):");
console.log(`  all: ${urlsExpanded.join(", ")}`);
console.log(`  detail-only example: ${hubsFiltered.join(", ")}`);

if (after.status === 200) {
  console.log("\n✅ Purge test OK (API succeeded, page reachable)");
  process.exit(0);
}
console.error("\n❌ Page did not return 200 after purge");
process.exit(1);
