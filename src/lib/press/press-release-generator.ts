import "server-only";

import type { PressQueueItem } from "@/lib/press/press-release-queue";
import type { PressContact, PressQuote } from "@/lib/cms/pressReleaseService";
import { createSlug } from "@/lib/cms/pressReleaseService";
import { sanitizePressReleaseHtml } from "@/lib/security/sanitize-html";
import { generateTranslationJson } from "@/lib/translation/gemini-call";
import {
  buildPressKnowledgeContext,
  enforcePressProductNaming,
} from "@/lib/press/press-knowledge-context";

export type GeneratedPressRelease = {
  title: string;
  subhead: string;
  dateline: string;
  content: string;
  boilerplate: string;
  contact: PressContact;
  quotes: PressQuote[];
  slug: string;
};

type GeminiPressResponse = {
  title: string;
  subhead: string;
  dateline: string;
  content: string;
  boilerplate: string;
  contact: PressContact;
  quotes: PressQuote[];
};

const DEFAULT_BOILERPLATE =
  "About Taypro: Taypro Private Limited is India's leading supplier of robotic solar module cleaning equipment, ranked #1 by Mercom India (2024). Taypro's waterless dry-cleaning robots operate across 5 GW+ of utility and C&I solar capacity in India, helping asset owners recover generation, cut O&M costs, and eliminate water use on arid sites. Headquartered in Pune, India. Learn more at https://taypro.in.";

const MAX_HEADLINE_CHARS = 120;

/** Queue facts that are prompt/editor guidance — never append to published HTML. */
const INTERNAL_FACT_PATTERNS = [
  /do not call/i,
  /do not invent/i,
  /never abbreviate/i,
  /official product name/i,
  /use only these/i,
  /not "mds"/i,
  /not mds/i,
];

/** Leaked internal instructions that must not appear in published body copy. */
const LEAKED_BODY_PATTERNS = [
  /do not call it mds/i,
  /official product name for the row-transfer/i,
  /never abbreviate as mds/i,
];

export function isPublishablePressFact(fact: string): boolean {
  const plain = fact.trim();
  if (!plain) return false;
  return !INTERNAL_FACT_PATTERNS.some((p) => p.test(plain));
}

export function publishablePressFacts(facts: string[]): string[] {
  return facts.filter(isPublishablePressFact);
}

export function stripLeakedPressInstructions(html: string): string {
  let out = html;
  for (const pattern of LEAKED_BODY_PATTERNS) {
    out = out.replace(
      new RegExp(`<p[^>]*>[^<]*${pattern.source}[^<]*<\\/p>`, "gi"),
      ""
    );
  }
  return out.replace(/\n{3,}/g, "\n").trim();
}

function buildPrompt(
  item: PressQueueItem,
  options?: { previousErrors?: string[] }
): string {
  const facts = publishablePressFacts(item.facts)
    .map((f, i) => `${i + 1}. ${f}`)
    .join("\n");
  const editorNotes = item.facts
    .filter((f) => !isPublishablePressFact(f))
    .map((f, i) => `${i + 1}. ${f}`)
    .join("\n");
  const editorBlock = editorNotes
    ? `\nEditor notes (for your writing only — NEVER quote or paraphrase in the press release body):\n${editorNotes}\n`
    : "";
  const repairBlock =
    options?.previousErrors?.length ?
      `\nPrevious draft failed validation. Fix ALL of these:\n${options.previousErrors.map((e) => `- ${e}`).join("\n")}\n`
    : "";
  const knowledgeBlock = buildPressKnowledgeContext(item);
  return `You are a professional PR writer for Taypro, an Indian solar cleaning robotics company.
${repairBlock}
${knowledgeBlock}
${editorBlock}
Write a press release in JSON only (no markdown fences). Use this exact schema:
{
  "title": "string — headline, max 100 chars",
  "subhead": "string — one-line dek, max 160 chars",
  "dateline": "string — e.g. Pune, India — June 28, 2026",
  "content": "string — HTML body with 2-3 <p> paragraphs in inverted-pyramid style, one <blockquote> for the executive quote, and a final <p> with media contact. No <h1>. Use only facts provided.",
  "boilerplate": "string — About Taypro paragraph",
  "contact": { "name": "string", "email": "string", "phone": "optional", "company": "Taypro Private Limited" },
  "quotes": [{ "text": "string", "attribution": "string" }]
}

Rules:
- Angle: ${item.angle}
- Title hint: ${item.titleHint}
- Summary: ${item.summary}
- Quote attribution: ${item.quoteAttribution}
- Verified facts (use ONLY these for company/market claims; use PRODUCT KNOWLEDGE for product specs and names):
${facts}
- Tone: professional, newsworthy, third-person
- Do NOT use placeholder text like [TBD], [INSERT], Lorem ipsum, or XX%
- content must be 250-500 words of body copy (excluding boilerplate) — write full paragraphs; do not leave the body under 250 words
- NEVER include editor notes, naming instructions, or meta-guidance in the published content field
- Include one compelling quote from the attribution in a <blockquote>
- Media contact email: info@taypro.in`;
}

function extractQuotesFromContent(
  html: string,
  fallbackAttribution: string
): PressQuote[] {
  const quotes: PressQuote[] = [];
  const re = /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const text = match[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) {
      quotes.push({ text, attribution: fallbackAttribution });
    }
  }
  return quotes;
}

function truncateHeadline(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length <= MAX_HEADLINE_CHARS) return trimmed;
  return `${trimmed.slice(0, MAX_HEADLINE_CHARS - 1).trim()}…`;
}

function finalizeGeneratedPressRelease(
  item: PressQueueItem,
  draft: GeneratedPressRelease
): GeneratedPressRelease {
  let title = enforcePressProductNaming(
    truncateHeadline(draft.title),
    item.productFocus
  );
  let content = enforcePressProductNaming(
    stripLeakedPressInstructions(draft.content.trim()),
    item.productFocus
  );

  let quotes =
    Array.isArray(draft.quotes) && draft.quotes.length > 0 ?
      draft.quotes.filter((q) => q.text?.trim())
    : extractQuotesFromContent(content, item.quoteAttribution);

  if (quotes.length === 0 && item.quoteAttribution) {
    quotes = [
      {
        text: `This innovation reflects Taypro's commitment to scalable, waterless solar O&M for Indian utility and C&I plants.`,
        attribution: item.quoteAttribution,
      },
    ];
  }

  return {
    ...draft,
    title,
    subhead: draft.subhead?.trim() || item.summary,
    dateline:
      draft.dateline?.trim() ||
      `Pune, India — ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`,
    content,
    boilerplate: draft.boilerplate?.trim() || DEFAULT_BOILERPLATE,
    contact: {
      name: draft.contact?.name?.trim() || "Taypro Media Team",
      email: draft.contact?.email?.trim() || "info@taypro.in",
      phone: draft.contact?.phone,
      company: draft.contact?.company?.trim() || "Taypro Private Limited",
    },
    quotes,
    slug: createSlug(title),
  };
}

export async function generatePressReleaseContent(
  item: PressQueueItem,
  options?: { previousErrors?: string[] }
): Promise<GeneratedPressRelease> {
  const raw = await generateTranslationJson<GeminiPressResponse>(
    buildPrompt(item, options),
    {
      quotaScope: "press",
    }
  );

  const title = raw.title?.trim() || item.titleHint;

  return finalizeGeneratedPressRelease(item, {
    title,
    subhead: raw.subhead?.trim() || item.summary,
    dateline:
      raw.dateline?.trim() ||
      `Pune, India — ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`,
    content: sanitizePressReleaseHtml(raw.content ?? ""),
    boilerplate: raw.boilerplate?.trim() || DEFAULT_BOILERPLATE,
    contact: {
      name: raw.contact?.name ?? "Taypro Media Team",
      email: raw.contact?.email ?? "info@taypro.in",
      phone: raw.contact?.phone,
      company: raw.contact?.company ?? "Taypro Private Limited",
    },
    quotes: Array.isArray(raw.quotes) ? raw.quotes : [],
    slug: createSlug(title),
  });
}

export function buildPressReleaseSlug(item: PressQueueItem, title: string): string {
  return `${createSlug(title)}-${item.id}`;
}
