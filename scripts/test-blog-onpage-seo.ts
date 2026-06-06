/**
 * Unit checks for on-page SEO validators (internal links, H1, img alt, keywords).
 * Run: npm run seo:test-onpage-seo
 */
import {
  countQualifyingInternalLinks,
  extractBlogPostLinkSlugs,
  extractQualifyingInternalLinkPaths,
  findInternalLinkAnchorIssue,
  MIN_BLOG_POST_LINKS,
  MIN_INTERNAL_LINKS,
} from "../src/lib/seo/blog-pillar-links";
import {
  buildBlogPostKeywords,
  resolveBlogPrimaryKeyword,
} from "../src/lib/seo/blog-metadata";
import { isRobotPromotionRelevant } from "../src/lib/seo/blog-robot-relevance";
import {
  demoteBodyH1ToH2,
  findInlineImgAltIssue,
  repairInlineImgAlts,
  sanitizeGeneratedBlogBodyHtml,
} from "../src/lib/seo/blog-body-hygiene";
import { buildBlogQueryIndex } from "../src/lib/seo/gsc-blog-queries";
import {
  buildBlogIntentContract,
  findBlogIntentAlignmentIssues,
  isIntentOnlyFailure,
} from "../src/lib/seo/blog-intent-contract";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const blogA = `<a href="/blog/solar-panel-maintenance-guide">maintenance planning guide</a>`;
const blogB = `<a href="/blog/panel-price-india-utility">panel price benchmarks</a>`;
const blogC = `<a href="/blog/dust-soiling-india-plants">soiling loss on Indian plants</a>`;
const pillar = `<a href="/cleaning-technology">waterless cleaning technology</a>`;

assert(countQualifyingInternalLinks("<p>No links here</p>") === 0, "0 links → count 0");
assert(
  countQualifyingInternalLinks(`<p>${blogA}${blogB}${blogC}</p>`) === 3,
  "3 blog post links → pass count"
);
assert(
  extractBlogPostLinkSlugs(`<p>${blogA}${blogB}</p>`).length === 2,
  "extractBlogPostLinkSlugs works"
);
assert(
  countQualifyingInternalLinks(`<p>${blogA}${blogB}${pillar}</p>`) === 3,
  "blog + pillar paths both count"
);

assert(
  findInternalLinkAnchorIssue(
    `<p><a href="/blog/test-post">here</a>${blogB}</p>`
  ) !== null,
  "generic blog anchor fails"
);
assert(
  findInternalLinkAnchorIssue(`<p>${blogA}${blogB}${blogC}</p>`) === null,
  "descriptive blog anchors pass"
);

assert(
  !isRobotPromotionRelevant({
    primaryKeyword: "photovoltaic panels price",
    title: "PV module price per MW in India",
  }),
  "equipment price keyword skips robot promotion"
);
assert(
  isRobotPromotionRelevant({
    primaryKeyword: "solar panel cleaning brush",
    title: "Brush vs robot on 50 MW plants",
  }),
  "cleaning keyword allows robot promotion"
);

assert(
  !/<h1\b/i.test(demoteBodyH1ToH2("<h1>Title</h1><h2>Section</h2>")),
  "demoteBodyH1ToH2 removes h1"
);

assert(
  findInlineImgAltIssue(
    repairInlineImgAlts('<img src="/x.jpg">', {
      title: "Solar cleaning frequency",
      primaryKeyword: "solar panel cleaning frequency",
    })
  ) === null,
  "repairInlineImgAlts fixes missing alt"
);

assert(
  !/<h1\b/i.test(
    sanitizeGeneratedBlogBodyHtml("<h1>X</h1><img src='/a.jpg'>", {
      title: "Test title",
      primaryKeyword: "solar panel cleaning",
    })
  ),
  "sanitize fixes h1 and img together"
);

const keywords = buildBlogPostKeywords({
  title: "How Often Should You Clean Solar Panels on a 50 MW Plant?",
  description: "Cleaning frequency guide for utility-scale solar in India.",
  primaryKeyword: "solar panel cleaning frequency",
});
assert(keywords[0] === "solar panel cleaning frequency", "primary keyword first");

assert(
  resolveBlogPrimaryKeyword({
    seoKeyword: "stored keyword",
    gscKeywords: ["gsc keyword"],
  }) === "stored keyword",
  "resolveBlogPrimaryKeyword prefers blogs.seo_keyword"
);

const index = buildBlogQueryIndex([
  {
    page: "https://taypro.in/blog/test-slug",
    query: "solar panel cleaning robot",
    clicks: 1,
    impressions: 100,
    ctr: 0.01,
    position: 12,
  },
]);
assert(index["test-slug"]?.[0] === "solar panel cleaning robot", "GSC index maps slug");

assert(MIN_INTERNAL_LINKS === 3, "MIN_INTERNAL_LINKS is 3");
assert(MIN_BLOG_POST_LINKS === 2, "MIN_BLOG_POST_LINKS is 2");

const roofIntent = buildBlogIntentContract({
  title: "PV panel roof methods, costs, and robot options compared",
  primaryKeyword: "pv panel roof",
  searchIntent:
    "Informational/comparison for rooftop or canopy PV—access, safety, cleaning/maintenance methods, and costs for roof-mounted arrays.",
});
assert(
  roofIntent.robotPromotionRelevant === false,
  "roof keyword disables robot pitch"
);
assert(
  roofIntent.mustCover.some((m) => /roof/i.test(m)),
  "roof intent mustCover mentions roof context"
);

const robotDriftHtml = `
<p>Autonomous cleaning robots like GLYDE and NYUMA deliver the best ROI on 50 MW ground-mount plants.</p>
<p>Waterless solar panel cleaning robots reduce soiling losses across utility-scale fleets.</p>
<h2>Quick answer</h2><ul><li>Robots win on TCO</li></ul>
<h2>Why robots beat manual brush</h2><p>Robot fleet deployment...</p>
`.repeat(3);

const roofIssues = findBlogIntentAlignmentIssues({
  title: "PV panel roof methods, costs, and robot options compared",
  content: robotDriftHtml,
  primaryKeyword: "pv panel roof",
});
assert(
  roofIssues.some((i) => i.includes("cleaning-robot") || i.includes("title")),
  "robot-heavy roof draft fails intent alignment"
);

assert(
  isIntentOnlyFailure([
    "Opening must reflect the title topic (need ≥2 distinctive title terms in first ~900 chars; found 0)",
    "Content drifts into cleaning-robot pitch (5 product/robot mentions in opening third) but keyword intent is equipment/topic research — refocus on title",
  ]),
  "isIntentOnlyFailure detects intent-only validation failures"
);

console.log("seo:test-onpage-seo — all checks passed");
