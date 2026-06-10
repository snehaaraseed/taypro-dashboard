/**
 * Unit-style checks for URL recovery (no network).
 * Run: npm run seo:test-url-recovery
 */
import assert from "node:assert/strict";
import { resolveAlias } from "../src/lib/url-recovery/aliases";
import {
  recoverBlogSlug,
  recoverStaticPath,
} from "../src/lib/url-recovery/recover";
import { scoreSlugSimilarity } from "../src/lib/url-recovery/slug-match";
import { isRecoveryBlocked } from "../src/lib/url-recovery/static-match";

function expectRedirect(
  result: { kind: string; destination?: string },
  destination: string
) {
  assert.equal(result.kind, "redirect");
  assert.equal(result.destination, destination);
}

// Aliases
assert.equal(resolveAlias("/contacts"), "/contact");
assert.equal(resolveAlias("/contact-us"), "/contact");
assert.equal(resolveAlias("/blogs"), "/blog");
assert.equal(resolveAlias("/about"), "/company");

// Static fuzzy
expectRedirect(recoverStaticPath("/contcat"), "/contact");
expectRedirect(recoverStaticPath("/site_map"), "/site-map");

// Blocked scanner paths
assert.equal(isRecoveryBlocked("/wp-admin/setup.php"), true);
assert.equal(recoverStaticPath("/wp-login.php").kind, "none");

// Blog slug: truncated prefix (unique)
const blogSlugs = [
  "how-does-a-solar-panel-cleaning-robot-work",
  "solar-panel-cleaning-frequency-guide",
];
const truncated = recoverBlogSlug(
  "how-does-a-solar-panel-cleaning-robot-wor",
  blogSlugs
);
expectRedirect(truncated, "/blog/how-does-a-solar-panel-cleaning-robot-work");

// Blog slug: small typo
const typoScore = scoreSlugSimilarity(
  "how-does-a-solar-panel-cleaning-robot-wrk",
  "how-does-a-solar-panel-cleaning-robot-work"
);
assert.ok(typoScore >= 0.88);

// Ambiguous: two very similar slugs → suggest or none, not redirect
const ambiguous = recoverBlogSlug("solar-panel-cleaning", [
  "solar-panel-cleaning-guide",
  "solar-panel-cleaning-cost",
]);
assert.notEqual(ambiguous.kind, "redirect");

console.log("url-recovery: all checks passed");
