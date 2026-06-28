import "server-only";

import { generateAutomationText } from "@/lib/gemini/generate-automation-text";
import { parseGeminiJsonObject } from "@/lib/gemini/parse-json-response";
import type { SerpResearchBrief } from "@/lib/gemini/grounded-serp-research";
import type { FactResearchBrief } from "@/lib/gemini/grounded-fact-research";

/**
 * Inline grounded citations.
 *
 * Adds real outbound authority links from Google Search grounding to the draft:
 *  1. An LLM picks up to N existing verbatim phrases to attribute (it never
 *     rewrites the article and can only reference approved source indices).
 *  2. We perform the actual edits ourselves and append a "Sources and further
 *     reading" section. URLs come only from the grounding source set, so no
 *     hallucinated links are possible.
 *
 * If grounding produced no usable sources, or the LLM step fails (e.g. quota),
 * we still append a deterministic sources section, or skip cleanly.
 */

export type CitationSource = { title: string; uri: string; domain: string };

export type CitationResult = {
  content: string;
  citationCount: number;
  sourceCount: number;
  mode: "inline+sources" | "sources-only" | "skip";
};

const OWN_DOMAINS = ["taypro.in", "taypro.com", "www.taypro.in", "www.taypro.com"];
const MAX_SOURCES = 6;
const MAX_INLINE = 3;
const SOURCES_HEADING = "Sources and further reading";

export function inlineCitationsEnabled(): boolean {
  return process.env.BLOG_INLINE_CITATIONS?.trim().toLowerCase() !== "false";
}

function hostnameOf(uri: string): string | null {
  try {
    return new URL(uri).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Dedupe + clean grounding sources into a stable, attributable set. */
export function buildCitationSources(
  serpBrief?: SerpResearchBrief | null,
  factBrief?: FactResearchBrief | null
): CitationSource[] {
  const raw = [
    ...(serpBrief?.sources ?? []), ...(factBrief?.sources ?? []),
  ];
  const seen = new Set<string>();
  const out: CitationSource[] = [];

  for (const s of raw) {
    const uri = s.uri?.trim();
    if (!uri) continue;
    const domain = hostnameOf(uri);
    if (!domain) continue;
    if (OWN_DOMAINS.includes(domain.toLowerCase())) continue;
    if (seen.has(uri)) continue;
    seen.add(uri);
    const title = (s.title?.trim() || domain).slice(0, 90);
    out.push({ title, uri, domain });
    if (out.length >= MAX_SOURCES) break;
  }
  return out;
}

function buildSourcesSection(sources: CitationSource[]): string {
  const items = sources
    .map(
      (s) =>
        `<li><a href="${escapeHtml(s.uri)}" target="_blank" rel="nofollow noopener">${escapeHtml(
          s.title
        )}</a></li>`
    )
    .join("");
  return `<h2>${SOURCES_HEADING}</h2><ul>${items}</ul>`;
}

function hasSourcesSection(html: string): boolean {
  return new RegExp(SOURCES_HEADING, "i").test(html);
}

/** True when `index` in `html` lies inside an HTML tag or an existing anchor. */
function isUnsafeInsertPosition(html: string, index: number): boolean {
  const before = html.slice(0, index);
  const lastOpenTag = before.lastIndexOf("<");
  const lastCloseTag = before.lastIndexOf(">");
  if (lastOpenTag > lastCloseTag) return true; // inside a tag

  const lastOpenAnchor = before.toLowerCase().lastIndexOf("<a ");
  const lastCloseAnchor = before.toLowerCase().lastIndexOf("</a>");
  if (lastOpenAnchor > lastCloseAnchor) return true; // inside an anchor
  return false;
}

/** Wrap the first safe verbatim occurrence of `phrase` in an outbound link. */
function insertAnchor(
  html: string,
  phrase: string,
  href: string
): { html: string; inserted: boolean } {
  const trimmed = phrase.trim();
  if (trimmed.length < 6 || trimmed.length > 120) {
    return { html, inserted: false };
  }
  const re = new RegExp(escapeRegExp(trimmed), "g");
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const idx = match.index;
    if (isUnsafeInsertPosition(html, idx)) continue;
    const anchor = `<a href="${escapeHtml(href)}" target="_blank" rel="nofollow noopener">${escapeHtml(
      trimmed
    )}</a>`;
    return {
      html: html.slice(0, idx) + anchor + html.slice(idx + trimmed.length),
      inserted: true,
    };
  }
  return { html, inserted: false };
}

function buildMappingPrompt(
  content: string,
  primaryKeyword: string,
  sources: CitationSource[]
): string {
  const sourceList = sources
    .map((s, i) => `${i}. ${s.title} (${s.domain})`)
    .join("\n");
  return `You attach citations to an already-written blog about "${primaryKeyword}" (utility-scale solar O&M, India).

APPROVED SOURCES (you may ONLY reference these by index):
${sourceList}

ARTICLE HTML:
${content.slice(0, 16000)}

Pick up to ${MAX_INLINE} factual or statistical claims in the article that a reader would want backed by a source. For each, copy an EXACT short verbatim phrase (6-100 chars) from the article body text (not from inside an HTML tag), and map it to the most relevant approved source index.

Return ONLY valid JSON:
{
  "citations": [
    { "anchorPhrase": "exact text copied verbatim from the article", "sourceIndex": 0 }
  ]
}

Rules:
- anchorPhrase MUST appear verbatim in the article text above (same case and spacing).
- Prefer phrases near a number, percentage, regulation, or specific factual claim.
- Do NOT invent sources or phrases. Empty array if nothing fits.`;
}

async function pickInlineCitations(
  content: string,
  primaryKeyword: string,
  sources: CitationSource[]
): Promise<{ anchorPhrase: string; sourceIndex: number }[]> {
  const prompt = buildMappingPrompt(content, primaryKeyword, sources);
  const text = await generateAutomationText(prompt, { maxOutputTokens: 1024 });
  const parsed = parseGeminiJsonObject<Record<string, unknown>>(text);
  const list = Array.isArray(parsed.citations) ? parsed.citations : [];
  const out: { anchorPhrase: string; sourceIndex: number }[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const anchorPhrase = String(row.anchorPhrase ?? "").trim();
    const sourceIndex = Number(row.sourceIndex);
    if (!anchorPhrase) continue;
    if (!Number.isInteger(sourceIndex) || sourceIndex < 0 || sourceIndex >= sources.length) {
      continue;
    }
    out.push({ anchorPhrase, sourceIndex });
    if (out.length >= MAX_INLINE) break;
  }
  return out;
}

/**
 * Enrich a finished draft with grounded inline citations + a sources section.
 * Never rewrites article prose; only wraps existing phrases and appends links.
 */
export async function enrichWithInlineCitations(input: {
  content: string;
  primaryKeyword: string;
  serpBrief?: SerpResearchBrief | null;
  factBrief?: FactResearchBrief | null;
}): Promise<CitationResult> {
  if (!inlineCitationsEnabled()) {
    return { content: input.content, citationCount: 0, sourceCount: 0, mode: "skip" };
  }

  const sources = buildCitationSources(input.serpBrief, input.factBrief);
  if (sources.length < 2 || hasSourcesSection(input.content)) {
    return { content: input.content, citationCount: 0, sourceCount: 0, mode: "skip" };
  }

  let content = input.content;
  let citationCount = 0;
  const usedSourceUris = new Set<string>();

  try {
    const picks = await pickInlineCitations(content, input.primaryKeyword, sources);
    const linkedPhrases = new Set<string>();
    for (const pick of picks) {
      const key = pick.anchorPhrase.toLowerCase();
      if (linkedPhrases.has(key)) continue;
      const source = sources[pick.sourceIndex]!;
      const { html, inserted } = insertAnchor(content, pick.anchorPhrase, source.uri);
      if (inserted) {
        content = html;
        linkedPhrases.add(key);
        usedSourceUris.add(source.uri);
        citationCount += 1;
      }
    }
  } catch (error) {
    console.warn(
      "[citations] Inline mapping skipped (sources-only):",
      error instanceof Error ? error.message.slice(0, 120) : error
    );
  }

  content = `${content}\n${buildSourcesSection(sources)}`;

  return {
    content,
    citationCount,
    sourceCount: sources.length,
    mode: citationCount > 0 ? "inline+sources" : "sources-only",
  };
}
