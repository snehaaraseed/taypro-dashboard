#!/usr/bin/env npx tsx
/**
 * Verify SEO cannibalization fixes (redirects, sitemap locales, cluster owners).
 *   npx tsx scripts/verify-cannibalization.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  REDIRECTED_BLOG_SLUGS,
  REDIRECTED_BLOG_TARGETS,
} from "../src/lib/seo/redirected-blog-slugs";
import { getSitemapLocalesForPath } from "../src/lib/seo/sitemap-locales";
import { MONEY_PAGE_CLUSTERS } from "../src/lib/seo/money-page-clusters";
import { isLocalePageSubstantivelyTranslated } from "../src/lib/seo/locale-page-quality";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

for (const slug of REDIRECTED_BLOG_SLUGS) {
  assert.ok(
    REDIRECTED_BLOG_TARGETS[slug],
    `missing redirect target for ${slug}`
  );
}

const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");
assert.match(
  nextConfig,
  /getLegacyPathRedirects\(\)/,
  "next.config must spread getLegacyPathRedirects()"
);
for (const [from, to] of Object.entries(REDIRECTED_BLOG_TARGETS)) {
  assert.ok(
    nextConfig.includes("getLegacyPathRedirects"),
    `next.config must use getLegacyPathRedirects for blog redirect ${from}`
  );
  assert.equal(to, REDIRECTED_BLOG_TARGETS[from], `redirect target for ${from}`);
}

const aliases = JSON.parse(
  readFileSync(join(root, "data/url-aliases.json"), "utf8")
) as { aliases: Record<string, string> };
for (const [from, to] of Object.entries(REDIRECTED_BLOG_TARGETS)) {
  assert.equal(
    aliases.aliases[`/blog/${from}`],
    to,
    `url-aliases missing ${from}`
  );
}

const capexLocales = getSitemapLocalesForPath("/solar-cleaning-capex-vs-opex");
assert.ok(capexLocales.includes("en"), "capex-vs-opex sitemap must include en");
assert.equal(
  capexLocales.includes("hi"),
  isLocalePageSubstantivelyTranslated("solar-cleaning-capex-vs-opex", "hi"),
  "capex-vs-opex hi sitemap must match translation quality gate"
);

const serviceIndiaLocales = getSitemapLocalesForPath(
  "/solar-panel-cleaning-service-india"
);
assert.equal(
  serviceIndiaLocales.includes("hi"),
  isLocalePageSubstantivelyTranslated(
    "solar-panel-cleaning-service-india",
    "hi"
  ),
  "service-india hi sitemap must match translation quality gate"
);

const blog404Aliases: Record<string, string> = {
  "/blog/what-is-solar-panel-cleaning":
    "/blog/what-is-solar-panel-cleaning-why-is-it-necessary-to-clean-solar-panels",
  "/blog/how-does-a-solar-panel-cleaning-robot-work-":
    "/blog/how-does-a-solar-panel-cleaning-robot-work",
};
for (const [from, to] of Object.entries(blog404Aliases)) {
  assert.equal(aliases.aliases[from], to, `url-aliases missing ${from}`);
  assert.match(
    nextConfig,
    new RegExp(from.replace(/\//g, "\\/")),
    `next.config missing redirect for ${from}`
  );
}

const opexPricing = JSON.parse(
  readFileSync(
    join(root, "messages/pages/en/solar-cleaning-opex-pricing.json"),
    "utf8"
  )
) as {
  SolarCleaningOpexPricingPage: {
    related: { link1Href: string };
  };
};
const related = opexPricing.SolarCleaningOpexPricingPage.related;
assert.equal(
  related.link1Href,
  "/solar-panel-cleaning-system/solar-panel-cleaning-service",
  "opex pricing related should point to OPEX service product"
);

const ownerPaths = new Set(MONEY_PAGE_CLUSTERS.map((c) => c.ownerPath));
assert.equal(ownerPaths.size, MONEY_PAGE_CLUSTERS.length, "duplicate cluster owners");

console.log("verify-cannibalization: ok");
console.log(`  blog redirects: ${REDIRECTED_BLOG_SLUGS.size} pairs`);
console.log(`  money-page clusters: ${MONEY_PAGE_CLUSTERS.length}`);
console.log(`  capex-vs-opex sitemap locales: ${capexLocales.join(",")}`);
