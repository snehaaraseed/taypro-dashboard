import "server-only";

import { listAllBlogs } from "@/lib/cms/blogService";
import { readPublishedTopics } from "@/lib/cms/topicService";
import { SOURCE_LOCALE } from "@/lib/translation/config";
import { listStalePublishedBlogs } from "@/lib/seo/blog-freshness";
import {
  getUsedSeoKeywords,
  loadSeoKeywordRows,
} from "@/lib/seo/keyword-stats";
import { loadGscEditorialHint } from "@/lib/seo/gsc-sync";
import { loadSeoBlogQueueKeywords } from "@/lib/seo/seo-blog-queue";

const RECENT_POST_LIMIT = 15;
const AUTOMATION_HISTORY_LIMIT = 40;
const USED_KEYWORD_LIMIT = 20;

function parseAutomationSeoKeyword(category?: string): string | null {
  const match = (category ?? "").match(/seo:([^|]+)/i);
  return match?.[1]?.trim() ?? null;
}

/**
 * Core editorial rules (aligned with docs/SEO-STRATEGY.md §2–3).
 * Kept in code so production prompts stay stable without parsing markdown at runtime.
 */
const STRATEGY_CORE = `EDITORIAL STRATEGY (Taypro India):
- Funnel: Rank for the full plant stack—panel prices, manufacturers, inverters, brushes, trackers, suppliers—because today's equipment buyer is tomorrow's O&M and cleaning-robot buyer. Taypro does NOT sell modules; bridge every post from capex research to utility operations (soiling, cleaning economics, robots).
- Audience: Utility-scale asset owners, EPC, O&M (MW plants), plus high-intent researchers comparing panels/inverters/BOS who will operate or commission large sites in India.
- Business: Taypro sells autonomous waterless solar panel cleaning robots and plant O&M solutions, NOT PV modules or panel resale.
- Blog role (Tier B): Buyer guides, comparisons, how-to, soiling/PR, brush vs robot, cleaning frequency, equipment and price context—always tie back to post-commissioning O&M. Do not write a generic homepage.
- Money pages to reference naturally (suggest 2–3 internal links using these paths only):
  /solar-panel-cleaning-system
  /solar-panel-cleaning-system/automatic-solar-panel-cleaning-system
  /solar-panel-cleaning-system/solar-panel-cleaning-service
  /solar-panel-cleaning-robot-price-calculator
  /cleaning-technology
- For panel price / manufacturer / inverter keywords: authoritative India utility & C&I buyer angle—specs, capex, warranty/O&M implications, then natural links to cleaning systems and robots.
- Content gaps: robot vs brush TCO, cleaning frequency, dust/soiling and PR, waterless systems at scale, equipment buyer checklists including post-commissioning cleaning.
- Do NOT target: "near me" local spam, foreign (non-India) city names, residential DIY, unrelated trades (gutters), jobs/license spam, student PDF intent.
- Ranking goal: link-worthy for operators and equipment researchers; specific long-tail; internal links to Tier A money pages.`;

const TIER_B_ANGLES = [
  "panel / inverter / tracker capex → lifetime O&M and cleaning",
  "robot vs brush / manual cleaning TCO",
  "cleaning frequency & O&M scheduling",
  "dust, soiling, and performance ratio (PR)",
  "waterless / automatic cleaning at utility scale",
  "cleaning equipment for 10MW+ plants",
  "cost / ROI vs manual methods (link to calculator)",
  "manufacturer & supplier shortlists with post-install cleaning plan",
];

/**
 * Builds a compact prompt block: strategy, recent posts, used keywords, remaining pool.
 */
export async function formatEditorialContextPrompt(): Promise<string> {
  const allPosts = await listAllBlogs(true, SOURCE_LOCALE);
  const automationHistory = (await readPublishedTopics()).slice(
    0,
    AUTOMATION_HISTORY_LIMIT
  );
  const automationTitleSet = new Set(
    automationHistory.map((t) => t.title.toLowerCase().trim())
  );
  const recent = allPosts
    .filter((p) => !automationTitleSet.has(p.title.toLowerCase().trim()))
    .slice(0, RECENT_POST_LIMIT);
  const publishedCount = allPosts.filter((p) => p.published !== false).length;
  const draftCount = allPosts.length - publishedCount;

  const automationLines =
    automationHistory.length > 0
      ? automationHistory.map((t) => {
          const kw = parseAutomationSeoKeyword(t.category);
          return kw
            ? `  - ${t.title} (seo: ${kw})`
            : `  - ${t.title}`;
        })
      : ["  - (none from automation yet)"];

  const recentLines =
    recent.length > 0
      ? recent.map((p) => {
          const status = p.published === false ? "draft" : "published";
          return `  - [${status}] ${p.title}`;
        })
      : ["  - (none yet)"];

  const usedKeywords = [...(await getUsedSeoKeywords())].sort();
  const allKeywordRows = loadSeoKeywordRows();
  const remaining = allKeywordRows.length - usedKeywords.length;

  const usedLines =
    usedKeywords.length > 0
      ? usedKeywords
          .slice(-USED_KEYWORD_LIMIT)
          .map((k) => `  - ${k}`)
      : ["  - (none from automation yet)"];

  const recentTitlesLower = recent.map((p) => p.title.toLowerCase()).join(" ");
  const gapHints = TIER_B_ANGLES.filter(
    (angle) => !recentTitlesLower.includes(angle.split(" ")[0].toLowerCase())
  )
    .slice(0, 4)
    .map((g) => `  - ${g}`);

  const queue = loadSeoBlogQueueKeywords();
  const nextQueued = queue.find((k) => !usedKeywords.includes(k));
  const stalePosts = await listStalePublishedBlogs({
    olderThanDays: 180,
    limit: 5,
  });
  const gscHint = loadGscEditorialHint();
  const staleLines =
    stalePosts.length > 0
      ? stalePosts.map(
          (p) =>
            `  - ${p.title} (${p.daysSinceUpdate}d since update) — write NEW angles, do not duplicate`
        )
      : ["  - (none flagged)"];

  return `${STRATEGY_CORE}

CONTENT PROGRAM (do not repeat these topics or angles):
- English posts in CMS: ${allPosts.length} total (${publishedCount} published, ${draftCount} drafts).
- Automation history (last ${automationHistory.length} generated topics, do not repeat):
${automationLines.join("\n")}
- Last ${recent.length} CMS posts not listed above (newest first):
${recentLines.join("\n")}

SEO KEYWORDS already used by automation (${usedKeywords.length} of ${allKeywordRows.length}; ${remaining} still in queue):
${usedLines.join("\n")}

Suggested angles not obvious in recent titles (pick one if it fits today's keyword):
${gapHints.length > 0 ? gapHints.join("\n") : "  - (cover the primary SEO keyword with a fresh utility-scale angle)"}

Editorial queue (automation picks next unused): ${nextQueued ? `"${nextQueued}"` : "(queue complete — pool selection)"}

Stale posts (do not cannibalize; if covering same theme, add new data/angle):
${staleLines.join("\n")}
${gscHint ? `\n${gscHint}\n` : ""}
Rules for this draft:
- Pick a NEW angle vs the recent list above; do not rehash the same headline theme.
- Support Taypro pillars with 2–3 internal link mentions (paths above).
- Write for plant decision-makers, not consumers.`;
}
