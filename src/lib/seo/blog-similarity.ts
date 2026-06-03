import { createHash } from "node:crypto";
import { extractKeywords, jaccardSimilarity } from "./blog-similarity-scoring";

export type { BlogSimilarityInput } from "./blog-similarity-scoring";
export {
  extractKeywords,
  jaccardSimilarity,
  calculateBlogSimilarity,
} from "./blog-similarity-scoring";

const TITLE_SIMILARITY_THRESHOLD = 0.78;
const DESCRIPTION_SIMILARITY_THRESHOLD = 0.75;

export function getBlogSimilarityThreshold(): number {
  const raw = process.env.BLOG_SIMILARITY_THRESHOLD?.trim();
  const parsed = raw ? Number.parseFloat(raw) : 0.52;
  return Number.isFinite(parsed) && parsed > 0 && parsed < 1 ? parsed : 0.52;
}

export function getBlogH2OverlapThreshold(): number {
  const raw = process.env.BLOG_H2_OVERLAP_THRESHOLD?.trim();
  const parsed = raw ? Number.parseFloat(raw) : 0.6;
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 1 ? parsed : 0.6;
}

export function getTitleSimilarityThreshold(): number {
  return TITLE_SIMILARITY_THRESHOLD;
}

export function getDescriptionSimilarityThreshold(): number {
  return DESCRIPTION_SIMILARITY_THRESHOLD;
}

export function titleWordSimilarity(a: string, b: string): number {
  const words1 = new Set(a.toLowerCase().trim().split(/\s+/).filter(Boolean));
  const words2 = new Set(b.toLowerCase().trim().split(/\s+/).filter(Boolean));
  return jaccardSimilarity(words1, words2);
}

export function descriptionsTooSimilar(a: string, b: string): boolean {
  return (
    jaccardSimilarity(extractKeywords(a), extractKeywords(b)) >
    DESCRIPTION_SIMILARITY_THRESHOLD
  );
}

export function titlesTooSimilar(a: string, b: string): boolean {
  return titleWordSimilarity(a, b) > TITLE_SIMILARITY_THRESHOLD;
}

export function extractH2Headings(html: string): string[] {
  const headings: string[] = [];
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const text = match[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    if (text.length > 0) headings.push(text);
  }
  return headings;
}

function normalizeH2Set(h2s: string[]): Set<string> {
  return new Set(h2s.map((h) => h.toLowerCase().trim()).filter(Boolean));
}

export function h2OverlapScore(h2sA: string[], h2sB: string[]): number {
  const setA = normalizeH2Set(h2sA);
  const setB = normalizeH2Set(h2sB);
  if (setA.size === 0 || setB.size === 0) return 0;
  return jaccardSimilarity(setA, setB);
}

export function stripHtmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const FINGERPRINT_WORD_LIMIT = 800;

export function buildContentFingerprint(
  title: string,
  description: string,
  content: string
): string {
  const h2s = extractH2Headings(content).join(" ");
  const plain = stripHtmlToPlainText(content);
  const words = plain.split(/\s+/).filter(Boolean);
  const excerpt = words.slice(0, FINGERPRINT_WORD_LIMIT).join(" ");
  const payload = [title.trim(), description.trim(), h2s, excerpt]
    .join("\n")
    .toLowerCase();
  return createHash("sha256").update(payload).digest("hex");
}

export function fingerprintsMatch(a: string, b: string): boolean {
  return a.length > 0 && a === b;
}

export function parseH2OutlineJson(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}
