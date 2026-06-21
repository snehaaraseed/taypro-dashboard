/**
 * Search-intent contract: what the title/keyword means and what the post must deliver.
 */
import { isRobotPromotionRelevant } from "@/lib/seo/blog-robot-relevance";

const TITLE_STOP = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "for",
  "to",
  "in",
  "on",
  "of",
  "is",
  "are",
  "your",
  "you",
  "with",
  "at",
  "by",
  "from",
  "that",
  "this",
  "it",
  "as",
  "be",
  "can",
  "how",
  "what",
  "when",
  "which",
  "why",
  "best",
  "top",
  "guide",
  "complete",
  "ultimate",
  "methods",
  "method",
  "costs",
  "cost",
  "options",
  "option",
  "compared",
  "comparison",
  "compare",
  "vs",
  "india",
  "indian",
  "utility",
  "scale",
  "solar",
  "panel",
  "panels",
  "plant",
  "plants",
  "blog",
]);

const ROBOT_PITCH_RE =
  /\b(cleaning robot|waterless robot|solar panel cleaning robot|automatic solar panel cleaning|glyde|nyuma|helyx|nectyr|price calculator)\b/gi;

export type BlogIntentContract = {
  title: string;
  primaryKeyword: string | null;
  searchIntent: string | null;
  readerQuestion: string;
  whyWeAreWriting: string;
  mustCover: string[];
  avoidTopics: string[];
  robotPromotionRelevant: boolean;
};

export function distinctiveTitleTokens(title: string): string[] {
  const tokens: string[] = [];
  const seen = new Set<string>();
  for (const raw of title.toLowerCase().split(/[^a-z0-9%]+/)) {
    const t = raw.trim();
    if (t.length < 2 || TITLE_STOP.has(t) || seen.has(t)) continue;
    seen.add(t);
    tokens.push(t);
  }
  return tokens;
}

function inferReaderQuestion(input: {
  title: string;
  primaryKeyword?: string | null;
  searchIntent?: string | null;
}): string {
  const kw = (input.primaryKeyword ?? input.title).toLowerCase();
  const title = input.title.toLowerCase();

  if (/\bpv panel roof\b|rooftop pv|roof.?mount|panel roof/.test(`${kw} ${title}`)) {
    return "What methods, access constraints, safety requirements, and costs apply to PV on rooftops or canopy structures—and how do cleaning/maintenance options compare for that layout?";
  }
  if (/manufacturer|supplier|mfg|module maker/.test(kw)) {
    return "Which PV manufacturers or suppliers matter for utility/C&I buyers in India, and what specs, warranty, and post-install O&M should decision-makers weigh?";
  }
  if (/panel price|pv panel price|photovoltaic panels price|module price/.test(kw)) {
    return "What drives PV module/panel pricing per MW in India, which budget lines matter, and what lifetime O&M implications follow commissioning?";
  }
  if (/inverter|string combiner|bos/.test(kw)) {
    return "How should plant owners evaluate this BOS equipment for utility-scale sites, and what reliability/O&M trade-offs matter?";
  }
  if (/brush|manual|robot|cleaning|soiling|frequency|waterless/.test(kw)) {
    return "Which cleaning or soiling approach fits utility-scale operations in India, and what costs, water use, and PR impact should plant managers expect?";
  }
  if (input.searchIntent?.trim()) {
    const first = input.searchIntent.split(/[.;]/)[0]?.trim();
    if (first && first.length > 20) return first;
  }
  return `What should a utility-scale solar decision-maker know about "${input.primaryKeyword || input.title}" in India?`;
}

function inferMustCover(input: {
  title: string;
  primaryKeyword?: string | null;
}): string[] {
  const kw = (input.primaryKeyword ?? "").toLowerCase();
  const title = input.title.toLowerCase();
  const items: string[] = [];

  if (/roof/.test(`${kw} ${title}`)) {
    items.push(
      "Rooftop/canopy vs ground-mount context (access, pitch, safety)",
      "Cleaning or maintenance methods realistic for roof-mounted arrays",
      "Cost and scheduling constraints specific to roof layouts"
    );
  }
  if (/price|cost/.test(`${kw} ${title}`)) {
    items.push("Capex/opex ranges or budget drivers (industry-typical, India utility/C&I)");
  }
  if (/manufacturer|supplier/.test(kw)) {
    items.push("Shortlist criteria, specs, warranty, and commissioning implications");
  }
  if (/compare|vs|options/.test(title)) {
    items.push("A comparison table or checklist with decision criteria");
  }
  for (const token of distinctiveTitleTokens(input.title).slice(0, 4)) {
    items.push(`Address "${token}" as named in the title`);
  }
  if (items.length === 0) {
    items.push("Answer the title question in the opening and H2 sections");
  }
  return [...new Set(items)].slice(0, 6);
}

export function buildBlogIntentContract(input: {
  title: string;
  primaryKeyword?: string | null;
  searchIntent?: string | null;
  category?: string | null;
  angleId?: string | null;
}): BlogIntentContract {
  const robotPromotionRelevant = isRobotPromotionRelevant(input);
  const readerQuestion = inferReaderQuestion(input);
  const mustCover = inferMustCover(input);

  const avoidTopics = robotPromotionRelevant
    ? [
        "Generic solar industry growth filler",
        "Ignoring the primary keyword in the opening",
      ]
    : [
        "Leading with autonomous cleaning robots as the main answer",
        "Product model names (GLYDE, NYUMA, HELYX) unless comparing cleaning methods briefly",
        "Recasting equipment/price/manufacturer research as a ground-mount robot sales page",
        "Generic MW-scale robot TCO when the title is about another topic",
      ];

  return {
    title: input.title.trim(),
    primaryKeyword: input.primaryKeyword?.trim().toLowerCase() ?? null,
    searchIntent: input.searchIntent?.trim() ?? null,
    readerQuestion,
    whyWeAreWriting: input.searchIntent?.trim() || readerQuestion,
    mustCover,
    avoidTopics,
    robotPromotionRelevant,
  };
}

export function formatBlogIntentPromptBlock(contract: BlogIntentContract): string {
  return `INTENT CONTRACT (read first — entire post must match this; do NOT write a generic Taypro robot article):
Title: ${contract.title}
Primary SEO keyword: ${contract.primaryKeyword ?? "(from title)"}
Why we are writing: ${contract.whyWeAreWriting}
Reader question to answer: ${contract.readerQuestion}
Must cover (use as H2 themes / section focus):
${contract.mustCover.map((m) => `- ${m}`).join("\n")}
Do NOT drift into:
${contract.avoidTopics.map((a) => `- ${a}`).join("\n")}
${
  contract.robotPromotionRelevant
    ? "Robot/cleaning products: mention only where the section compares cleaning methods."
    : "Robot pitch: OFF for this post — answer the equipment/topic intent first; optional one-sentence O&M bridge at the end only."
}
Process: (1) Parse the title + keyword. (2) Plan sections that answer the reader question. (3) Write — every H2 serves the title, not a template.`;
}

export type IntentAlignmentInput = {
  title: string;
  content: string;
  primaryKeyword?: string | null;
  searchIntent?: string | null;
  category?: string | null;
  angleId?: string | null;
  slug?: string | null;
};

function countRegexMatches(text: string, re: RegExp): number {
  const flags = re.flags.includes("g") ? re.flags : `${re.flags}g`;
  const global = new RegExp(re.source, flags);
  return [...text.matchAll(global)].length;
}

export function findBlogIntentAlignmentIssues(
  input: IntentAlignmentInput
): string[] {
  const issues: string[] = [];
  const contract = buildBlogIntentContract(input);
  const plain = input.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const opening = plain.slice(0, 900);
  const earlyBody = plain.slice(0, Math.floor(plain.length * 0.35));

  const titleTokens = distinctiveTitleTokens(input.title);
  if (titleTokens.length > 0) {
    const openingLower = opening.toLowerCase();
    const openingHits = titleTokens.filter((t) => openingLower.includes(t)).length;
    const minOpeningHits = Math.min(
      titleTokens.length,
      Math.max(2, Math.ceil(titleTokens.length * 0.4))
    );
    if (openingHits < minOpeningHits) {
      issues.push(
        `Opening must reflect the title topic (need ≥${minOpeningHits} distinctive title terms in first ~900 chars; found ${openingHits})`
      );
    }

    const h2Re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
    const h2Text: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = h2Re.exec(input.content)) !== null) {
      h2Text.push(m[1].replace(/<[^>]+>/g, " ").toLowerCase());
    }
    const h2Combined = h2Text.join(" ");
    const h2Hits = titleTokens.filter((t) => h2Combined.includes(t)).length;
    if (h2Hits < Math.min(2, titleTokens.length)) {
      issues.push(
        `H2 sections must reflect the title topic (distinctive title terms in headings: ${h2Hits}/${titleTokens.length})`
      );
    }
  }

  const kw = contract.primaryKeyword;
  if (kw) {
    const firstChunk = plain.slice(0, 1500).toLowerCase();
    if (!firstChunk.includes(kw)) {
      const words = kw.split(/\s+/).filter((w) => w.length > 3);
      const matched = words.filter((w) => firstChunk.includes(w)).length;
      const need = Math.max(2, Math.ceil(words.length * 0.5));
      if (words.length > 0 && matched < need) {
        issues.push(
          `Primary keyword "${kw}" must appear naturally in the opening sections (matched ${matched}/${words.length} key terms)`
        );
      }
    }
  }

  if (!contract.robotPromotionRelevant) {
    const robotMentions = countRegexMatches(earlyBody, ROBOT_PITCH_RE);
    if (robotMentions >= 4) {
      issues.push(
        `Content drifts into cleaning-robot pitch (${robotMentions} product/robot mentions in opening third) but keyword intent is equipment/topic research — refocus on title`
      );
    }
  }

  const slugKwIssue = findKeywordSlugMismatch(input);
  if (slugKwIssue) issues.push(slugKwIssue);

  return issues;
}

/** Reject generic cleaning keyword on non-cleaning slugs (metadata drift). */
export function findKeywordSlugMismatch(input: IntentAlignmentInput): string | null {
  const kw = (input.primaryKeyword ?? "").toLowerCase().trim();
  const slugHint = (input.slug ?? "").toLowerCase();
  if (!kw || !slugHint) return null;

  const cleaningKw =
    kw === "solar panel cleaning" ||
    /^solar panel cleaning\b/.test(kw);

  const slugIsCleaning =
    /clean|soil|dust|robot|brush|wash|wet|waterless|microfiber|soiling/.test(slugHint);

  if (cleaningKw && !slugIsCleaning) {
    return `Primary keyword "${input.primaryKeyword}" conflicts with slug topic — use an intent-aligned keyword`;
  }

  if (/installation.?cost|installation-cost/.test(slugHint) && !/install|cost|capex|epc|per mw|utility scale/.test(kw)) {
    return `Installation-cost slug requires capex/EPC keyword, not "${input.primaryKeyword}"`;
  }

  if (/choose-best-solar-panel|types-of-solar-panel|module-efficiency|panel-efficiency/.test(slugHint)) {
    if (/cleaning robot|waterless clean/.test(kw) && !/module|panel|efficiency|topcon|perc/.test(kw)) {
      return `Module slug should not use cleaning-only keyword "${input.primaryKeyword}"`;
    }
  }

  return null;
}

export function isIntentAlignmentIssue(issue: string): boolean {
  return (
    issue.includes("Opening must reflect the title") ||
    issue.includes("H2 sections must reflect the title") ||
    issue.includes("Primary keyword") ||
    issue.includes("Content drifts into cleaning-robot") ||
    issue.includes("Opening paragraphs should directly address")
  );
}

export function isIntentOnlyFailure(issues: string[]): boolean {
  return issues.length > 0 && issues.every(isIntentAlignmentIssue);
}
