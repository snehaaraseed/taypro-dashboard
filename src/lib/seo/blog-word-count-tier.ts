import { getWordCountTierForAngle } from "@/lib/seo/angle-contract-data";
import type { BlogWordCountTier } from "@/lib/seo/structural-archetypes";

export type { BlogWordCountTier };

export type BlogWordCountPolicy = {
  tier: BlogWordCountTier;
  minWords: number;
  targetMin: number;
  targetMax: number;
};

export type BlogStructurePolicy = {
  minH2: number;
  maxH2Hint: number;
  quickAnswerBulletsMin: number;
  quickAnswerBulletsMax: number;
  wordsPerH2ChunkMin: number;
  wordsPerH2ChunkMax: number;
};

const TIER_DEFAULTS: Record<
  BlogWordCountTier,
  Omit<BlogWordCountPolicy, "tier">
> = {
  pillar: { minWords: 1800, targetMin: 2000, targetMax: 2400 },
  standard: { minWords: 1200, targetMin: 1400, targetMax: 1800 },
  narrow: { minWords: 900, targetMin: 1000, targetMax: 1400 },
};

const TIER_STRUCTURE: Record<BlogWordCountTier, BlogStructurePolicy> = {
  pillar: {
    minH2: 6,
    maxH2Hint: 10,
    quickAnswerBulletsMin: 3,
    quickAnswerBulletsMax: 6,
    wordsPerH2ChunkMin: 400,
    wordsPerH2ChunkMax: 550,
  },
  standard: {
    minH2: 6,
    maxH2Hint: 9,
    quickAnswerBulletsMin: 3,
    quickAnswerBulletsMax: 5,
    wordsPerH2ChunkMin: 350,
    wordsPerH2ChunkMax: 500,
  },
  narrow: {
    minH2: 5,
    maxH2Hint: 7,
    quickAnswerBulletsMin: 3,
    quickAnswerBulletsMax: 4,
    wordsPerH2ChunkMin: 280,
    wordsPerH2ChunkMax: 400,
  },
};

function envInt(name: string): number | null {
  const raw = process.env[name]?.trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function isComparisonSearchIntent(searchIntent: string): boolean {
  return /comparison/i.test(searchIntent);
}

export type ResolveBlogWordCountInput = {
  primaryKeyword?: string;
  angleId?: string;
  searchIntent?: string;
  volumeBucket?: number;
  competitionIndex?: number;
};

export function resolveBlogStructurePolicy(
  tier: BlogWordCountTier
): BlogStructurePolicy {
  return TIER_STRUCTURE[tier];
}

export function resolveBlogWordCountTier(
  input: ResolveBlogWordCountInput
): BlogWordCountTier {
  const keyword = input.primaryKeyword?.toLowerCase().trim() ?? "";
  const angleId = input.angleId?.trim();

  if (angleId) {
    return getWordCountTierForAngle(angleId);
  }

  if (input.searchIntent && isComparisonSearchIntent(input.searchIntent)) {
    return "pillar";
  }

  const volume = input.volumeBucket ?? 0;
  const compIndex = input.competitionIndex ?? 0;

  // Tier B high-competition clusters (SEO-STRATEGY §3)
  if (volume >= 5000 && compIndex >= 85) return "pillar";
  if (volume >= 500 && compIndex >= 95) return "pillar";
  if (
    /brush|washing machine|\bwashing\b|cleaning equipment|robot vs|vs robot|vs\.?\s*brush/i.test(
      keyword
    )
  ) {
    return "pillar";
  }
  if (
    volume >= 500 &&
    /panel price|manufacturer|supplier|inverter/i.test(keyword)
  ) {
    return "pillar";
  }

  // Tier C long-tail and scheduling (SEO-STRATEGY §3)
  if (volume > 0 && volume <= 50) return "narrow";
  if (compIndex > 0 && compIndex <= 10 && volume > 0 && volume <= 500) {
    return "narrow";
  }
  if (
    /cleaning frequency|best way to clean|how often|cleaning kit|near me|dust on solar|waterless solar panel cleaning robot|robot manufacturers in india|robotic cleaning of solar panels|autonomous solar panel cleaning/i.test(
      keyword
    )
  ) {
    return "narrow";
  }

  return "standard";
}

/** Tier-based floors aligned with docs/SEO-STRATEGY.md; optional BLOG_MIN_WORD_COUNT override. */
export function resolveBlogWordCountPolicy(
  input: ResolveBlogWordCountInput
): BlogWordCountPolicy {
  const tier = resolveBlogWordCountTier(input);
  const defaults = TIER_DEFAULTS[tier];
  const envOverride = envInt("BLOG_MIN_WORD_COUNT");

  if (envOverride !== null) {
    return {
      tier,
      minWords: envOverride,
      targetMin: envOverride,
      targetMax: envOverride + 400,
    };
  }

  return { tier, ...defaults };
}

export type WordCountPreview = {
  wordCountTier: BlogWordCountTier;
  minWords: number;
  targetMin: number;
  targetMax: number;
  targetRange: string;
  actualWords?: number;
};

export function formatWordCountPreview(
  input: ResolveBlogWordCountInput,
  actualWords?: number
): WordCountPreview {
  const policy = resolveBlogWordCountPolicy(input);
  const preview: WordCountPreview = {
    wordCountTier: policy.tier,
    minWords: policy.minWords,
    targetMin: policy.targetMin,
    targetMax: policy.targetMax,
    targetRange: `${policy.targetMin}-${policy.targetMax}`,
  };
  if (actualWords !== undefined) {
    preview.actualWords = actualWords;
  }
  return preview;
}

export function formatLongFormWordCountRules(
  policy: BlogWordCountPolicy
): string {
  const structure = resolveBlogStructurePolicy(policy.tier);
  return `DEPTH & LENGTH (${policy.tier} tier: minimum ${policy.minWords} words, target ${policy.targetMin}–${policy.targetMax}, quality over padding):
- Every section must add a NEW idea: data range, decision criterion, plant scenario, or trade-off, no repeating the intro in different words.
- Structure: ${structure.minH2}–${structure.maxH2Hint} H2 sections including "Quick answer" (or "Summary for plant managers") and one question-shaped H2 with a direct answer paragraph; use H3 subsections where a topic needs steps or sub-comparisons.
- Include at least one of: HTML comparison table (<table> with <thead>), numbered checklist, or bullet list with specific thresholds (days, %, MW, INR ranges as industry-typical). Comparison-intent posts MUST include an HTML <table>.
- Do NOT put a "Frequently asked questions" heading or FAQ list in the HTML body; Q&A for schema lives only in the JSON "faqs" array.
- End the article with a short "Key takeaways" or "What plant managers should do next" H2 (${structure.quickAnswerBulletsMin}–${structure.quickAnswerBulletsMax} bullets), no FAQ heading in content.
- Include exactly 3–8 internal links: ≥2 to related /blog/ posts (validator enforced) plus optional pillar paths when cleaning/O&M is on-topic.
- Do NOT inflate word count with generic AI intros, duplicate conclusions, or filler about "the solar industry growing".`;
}
