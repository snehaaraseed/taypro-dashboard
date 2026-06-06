import { canonicalCategoryLabel } from "@/lib/cms/project-categories";

export type ProjectGridItem = {
  id: string;
  title: string;
  img: string;
  href: string;
  description?: string;
  cardExcerpt?: string;
  imageAlt?: string;
  details?: string[];
};

export type ProjectsGridLayout = {
  /** Span the first card across the row on md+ */
  featuredFirst?: boolean;
  /** Column count from md breakpoint upward */
  columns?: 2 | 3;
};

const INDIAN_STATE_NAMES = [
  "andhra pradesh",
  "arunachal pradesh",
  "assam",
  "bihar",
  "chhattisgarh",
  "goa",
  "gujarat",
  "gujrat",
  "haryana",
  "himachal pradesh",
  "jharkhand",
  "karnataka",
  "kerala",
  "madhya pradesh",
  "maharashtra",
  "manipur",
  "meghalaya",
  "mizoram",
  "nagaland",
  "odisha",
  "punjab",
  "rajasthan",
  "sikkim",
  "tamil nadu",
  "telangana",
  "tripura",
  "uttar pradesh",
  "uttarakhand",
  "west bengal",
];

function normalizeCompare(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function titleContainsPhrase(title: string, phrase: string): boolean {
  const titleNorm = normalizeCompare(title);
  const phraseNorm = normalizeCompare(phrase);
  return phraseNorm.length >= 3 && titleNorm.includes(phraseNorm);
}

function isMegawattTag(tag: string, title: string): boolean {
  const mwMatch = tag.trim().match(/^(\d+(?:\.\d+)?)\s*mw$/i);
  if (!mwMatch) return false;
  const titleMw = title.match(/(\d+(?:\.\d+)?)\s*mw/i);
  return Boolean(titleMw && titleMw[1] === mwMatch[1]);
}

function isIndianStateTag(tag: string, title: string): boolean {
  const lower = tag.trim().toLowerCase();
  if (!INDIAN_STATE_NAMES.some((state) => lower === state || lower.includes(state))) {
    return false;
  }
  return titleContainsPhrase(title, tag);
}

function isGenericScaleTag(tag: string): boolean {
  return /^utility[-\s]?scale$/i.test(tag.trim());
}

function isMetadataSummaryLine(description: string): boolean {
  const parts = description
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 3) return false;
  return (
    /\d+\s*mw/i.test(description) ||
    /robots|gwh|litre|liters|saves/i.test(description)
  );
}

function isZeroRobotCountTag(tag: string): boolean {
  return /^0\s+(auto|semi[-\s]?auto(?:matic)?)\s+robots?$/i.test(tag.trim());
}

/** Drop chips that repeat information already visible in the card title. */
export function isRedundantProjectDetailTag(tag: string, title: string): boolean {
  const trimmed = tag.trim();
  if (!trimmed) return true;
  if (isZeroRobotCountTag(trimmed)) return true;
  if (isMegawattTag(trimmed, title)) return true;
  if (isIndianStateTag(trimmed, title)) return true;
  if (isGenericScaleTag(trimmed)) return true;
  if (titleContainsPhrase(title, trimmed)) return true;
  return false;
}

function detailTagPriority(tag: string): number {
  if (canonicalCategoryLabel(tag)) return 0;
  if (/robot|glyde|helyx|nyuma|nectyr|fleet|capex|opex/i.test(tag)) return 1;
  if (/tracker|ground\s*mount|fixed[-\s]?tilt|single[-\s]?axis|array/i.test(tag)) {
    return 2;
  }
  return 3;
}

/** Surface procurement model, robot mix, and array type — not repeated MW/state. */
export function prioritizeProjectCardDetails(
  details: string[] | undefined,
  title: string,
  maxTags = 5
): string[] {
  if (!details?.length) return [];

  const seen = new Set<string>();
  const filtered: string[] = [];

  for (const raw of details) {
    const tag = raw.trim();
    if (!tag || isRedundantProjectDetailTag(tag, title)) continue;

    const dedupeKey = normalizeCompare(tag);
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    filtered.push(tag);
  }

  return filtered
    .sort((a, b) => detailTagPriority(a) - detailTagPriority(b))
    .slice(0, maxTags);
}

export function projectCardCategoryEyebrow(details: string[] | undefined): string | null {
  for (const tag of details ?? []) {
    const category = canonicalCategoryLabel(tag);
    if (category) return category;
  }

  const joined = (details ?? []).join(" ").toLowerCase();
  const autoCountMatch = joined.match(/(\d+)\s*auto\s*robots?/);
  const semiCountMatch = joined.match(
    /(\d+)\s*semi[-\s]?auto(?:matic)?\s*robots?/
  );
  const autoCount = autoCountMatch ? Number(autoCountMatch[1]) : 0;
  const semiCount = semiCountMatch ? Number(semiCountMatch[1]) : 0;

  if (autoCount > 0 && semiCount > 0) return "Mixed deployment";
  if (semiCount > 0) return "Semi-Automatic";
  if (autoCount > 0) return "Automatic";
  if (/\bcapex\b/.test(joined)) return "Capex";

  return null;
}

export function excerptFromProjectContent(
  content: string | undefined,
  maxLength = 160
): string {
  if (!content?.trim()) return "";

  const text = content
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^Executive summary\s*/i, "");

  if (!text) return "";

  const firstParagraph = text.split(/(?<=[.!?])\s+/)[0]?.trim() ?? text;
  return projectCardExcerpt(firstParagraph, maxLength);
}

export function projectCardExcerpt(
  description: string | undefined,
  maxLength = 160
): string {
  if (!description?.trim()) return "";
  if (isMetadataSummaryLine(description)) return "";

  const text = description.replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;

  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = lastSpace > 80 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed}…`;
}
