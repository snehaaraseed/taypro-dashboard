#!/usr/bin/env node
/**
 * Warm nginx HTML microcache before SEO crawls.
 *
 * Usage:
 *   node scripts/warm-html-cache.mjs
 *   node scripts/warm-html-cache.mjs --site=https://taypro.in --concurrency=5 --limit=250
 */

const SITE = (
  process.argv.find((a) => a.startsWith("--site="))?.split("=")[1] ??
  "https://taypro.in"
).replace(/\/$/, "");

const CONCURRENCY = Number(
  process.argv.find((a) => a.startsWith("--concurrency="))?.split("=")[1] ?? 5
);
const LIMIT = Number(
  process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 250
);

function parseSitemapLocs(xml) {
  const locs = [];
  const re = /<loc>([^<]+)<\/loc>/gi;
  let match;
  while ((match = re.exec(xml)) !== null) {
    locs.push(match[1].trim());
  }
  return locs;
}

async function fetchSitemapUrls() {
  const res = await fetch(`${SITE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml ${res.status}`);
  const xml = await res.text();
  return parseSitemapLocs(xml).filter((loc) => loc.startsWith("http"));
}

async function warmUrl(url) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TayproCacheWarmer/1.0" },
      redirect: "follow",
    });
    await res.arrayBuffer();
    const cache = res.headers.get("x-cache-status") ?? "-";
    return {
      url,
      status: res.status,
      ms: Date.now() - started,
      cache,
      ok: res.ok,
    };
  } catch (err) {
    return {
      url,
      status: 0,
      ms: Date.now() - started,
      cache: "-",
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function runPool(urls, concurrency) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < urls.length) {
      const i = index++;
      results[i] = await warmUrl(urls[i]);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

async function main() {
  console.log(`Fetching sitemap from ${SITE}...`);
  const urls = (await fetchSitemapUrls()).slice(0, LIMIT);
  console.log(`Warming ${urls.length} URLs (concurrency ${CONCURRENCY})...`);

  const results = await runPool(urls, CONCURRENCY);
  const hits = results.filter((r) => r.cache === "HIT").length;
  const ok = results.filter((r) => r.ok).length;
  const slow = results.filter((r) => r.ms > 3000).length;
  const failed = results.filter((r) => !r.ok);

  console.log(
    `Done: ${ok}/${results.length} OK, ${hits} X-Cache-Status HIT, ${slow} >3s`
  );
  if (failed.length > 0) {
    console.log("Failures:");
    for (const f of failed.slice(0, 10)) {
      console.log(`  ${f.status} ${f.url} ${f.error ?? ""}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
