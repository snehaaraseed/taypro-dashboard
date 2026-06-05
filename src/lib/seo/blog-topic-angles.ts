import "server-only";

import { createSlug } from "@/app/utils/blogFileUtils";
import { isTopicPublished, readPublishedTopics } from "@/lib/cms/topicService";
import { titlesTooSimilar } from "@/lib/seo/blog-similarity";
import { buildFallbackTopicTitle } from "@/lib/seo/keyword-stats";

export type TopicAngle = {
  id: string;
  buildTitle: (keyword: string) => string;
};

function titleCaseKeyword(keyword: string): string {
  return keyword.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Rotating angles per keyword pattern — scales to many posts without repeating the same title shape. */
export function anglesForKeyword(keyword: string): TopicAngle[] {
  const k = keyword.toLowerCase().trim();
  const titled = titleCaseKeyword(keyword);

  if (/panel price|pv panel price|solar panel price/.test(k)) {
    return [
      {
        id: "price-capex-om",
        buildTitle: () =>
          "Solar Panel Price in India: Capex Context and O&M After You Buy",
      },
      {
        id: "price-per-watt-cleaning",
        buildTitle: () =>
          "Solar Panel Price per Watt in India: What O&M Teams Budget for Cleaning",
      },
      {
        id: "price-utility-tco",
        buildTitle: () =>
          "Utility-Scale Solar Panel Pricing in India: TCO Beyond Module Cost",
      },
      {
        id: "price-soiling-roi",
        buildTitle: () =>
          "Solar Module Price vs Soiling Loss: When Cleaning ROI Beats Cheaper Panels",
      },
    ];
  }

  if (/manufacturer|supplier/.test(k)) {
    return [
      {
        id: "mfg-om-bridge",
        buildTitle: () =>
          `${titled}: What Plant Owners Should Know Before O&M and Cleaning`,
      },
      {
        id: "mfg-shortlist",
        buildTitle: () =>
          `Shortlisting ${titled}: Specs That Matter for Utility Cleaning Robots`,
      },
      {
        id: "mfg-vendor-vs-robot",
        buildTitle: () =>
          `${titled} vs Cleaning Robot Partners: What MW Plants Evaluate`,
      },
    ];
  }

  if (/brush/.test(k)) {
    return [
      {
        id: "brush-vs-robot",
        buildTitle: () =>
          "Solar Panel Cleaning Brush vs Robot: TCO for Utility Plants in India",
      },
      {
        id: "brush-tracker",
        buildTitle: () =>
          "Manual Brush Cleaning on Tracker Arrays: Limits at 50 MW+ Scale",
      },
      {
        id: "brush-water",
        buildTitle: () =>
          "Brush Crews vs Waterless Robots: Labour and Water on Indian Solar Sites",
      },
    ];
  }

  if (/frequency|how often/.test(k)) {
    return [
      {
        id: "freq-50mw",
        buildTitle: () =>
          "How Often Should You Clean Solar Panels on a 50 MW Plant in India?",
      },
      {
        id: "freq-dust-belt",
        buildTitle: () =>
          "Solar Cleaning Frequency in Dust-Belt States: Seasonal Schedules for O&M",
      },
      {
        id: "freq-tracker",
        buildTitle: () =>
          "Cleaning Intervals on Single-Axis Trackers: When Daily Cycles Beat Fixed Tilt",
      },
    ];
  }

  if (/cost|price/.test(k)) {
    return [
      {
        id: "cost-manual-robot",
        buildTitle: () =>
          "Solar Panel Cleaning Cost on Utility Plants: Manual vs Robot Breakdown",
      },
      {
        id: "cost-per-mw",
        buildTitle: () =>
          `${titled}: Per-MW Budget Lines Indian Asset Owners Use`,
      },
      {
        id: "cost-water",
        buildTitle: () =>
          "Water, Labour, and Robot Cleaning Costs on 10–100 MW Sites in India",
      },
    ];
  }

  if (/waterless/.test(k)) {
    return [
      {
        id: "waterless-sprinkler",
        buildTitle: () =>
          "Waterless Solar Panel Cleaning Robots: When They Beat Sprinklers on MW Sites",
      },
      {
        id: "waterless-drought",
        buildTitle: () =>
          "Waterless Panel Cleaning in Water-Stressed States: Utility Plant Playbook",
      },
    ];
  }

  if (/robot|automatic|machine|system/.test(k)) {
    return [
      {
        id: "robot-eval",
        buildTitle: () =>
          `${titled}: What Indian Utility O&M Teams Should Evaluate`,
      },
      {
        id: "robot-tracker-fit",
        buildTitle: () =>
          `${titled} on Single-Axis Trackers: Docking, Cycle Time, and Night Windows`,
      },
      {
        id: "robot-capex-opex",
        buildTitle: () =>
          `${titled}: Capex vs Opex Models for 25–100 MW Portfolios`,
      },
    ];
  }

  return [
    {
      id: "default-guide",
      buildTitle: (kw) => buildFallbackTopicTitle(kw),
    },
    {
      id: "default-om",
      buildTitle: (kw) =>
        `${titleCaseKeyword(kw)}: O&M Decisions for Utility Plants in India`,
    },
    {
      id: "default-compare",
      buildTitle: (kw) =>
        `${titleCaseKeyword(kw)}: Methods, Costs, and Robot Options Compared`,
    },
  ];
}

async function publishedTitlesForKeyword(keyword: string): Promise<Set<string>> {
  const kw = keyword.toLowerCase().trim();
  const titles = new Set<string>();
  const topics = await readPublishedTopics();
  for (const topic of topics) {
    const cat = topic.category ?? "";
    if (cat.toLowerCase().includes(`seo:${kw}`)) {
      titles.add(topic.title.toLowerCase().trim());
    }
  }
  return titles;
}

function isRejectedTitle(title: string, rejected: Set<string>): boolean {
  const lower = title.toLowerCase().trim();
  if (rejected.has(lower)) return true;
  for (const r of rejected) {
    if (titlesTooSimilar(title, r)) return true;
  }
  return false;
}

/**
 * Pick the next unused angle for a keyword before any expensive body generation.
 * Returns null when all angles for this keyword are exhausted (caller should pick a new keyword).
 */
export async function pickRotatedTopicTitle(
  keyword: string,
  rejectedTitles: string[] = []
): Promise<string | null> {
  const rejected = new Set(rejectedTitles.map((t) => t.toLowerCase().trim()));
  const usedForKeyword = await publishedTitlesForKeyword(keyword);
  const angles = anglesForKeyword(keyword);

  for (const angle of angles) {
    const title = angle.buildTitle(keyword).trim();
    const lower = title.toLowerCase();
    if (isRejectedTitle(title, rejected)) continue;
    if (usedForKeyword.has(lower)) continue;
    if (await isTopicPublished(title, createSlug(title))) continue;
    return title;
  }

  return null;
}

/**
 * Code-generated title seeds for hybrid Gemini topic selection.
 * Returns unused angles that pass publish checks (up to maxSeeds).
 */
export async function listTopicAngleSeeds(
  keyword: string,
  rejectedTitles: string[] = [],
  maxSeeds = 5
): Promise<string[]> {
  const rejected = new Set(rejectedTitles.map((t) => t.toLowerCase().trim()));
  const usedForKeyword = await publishedTitlesForKeyword(keyword);
  const seeds: string[] = [];

  for (const angle of anglesForKeyword(keyword)) {
    const title = angle.buildTitle(keyword).trim();
    const lower = title.toLowerCase();
    if (isRejectedTitle(title, rejected)) continue;
    if (usedForKeyword.has(lower)) continue;
    if (await isTopicPublished(title, createSlug(title))) continue;
    seeds.push(title);
    if (seeds.length >= maxSeeds) break;
  }

  return seeds;
}
