import "server-only";

import type { PressQueueItem } from "@/lib/press/press-release-queue";
import type { PressContact, PressQuote } from "@/lib/cms/pressReleaseService";
import { createSlug } from "@/lib/cms/pressReleaseService";
import { sanitizePressReleaseHtml } from "@/lib/security/sanitize-html";
import { generateTranslationJson } from "@/lib/translation/gemini-call";

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

function buildPrompt(item: PressQueueItem): string {
  const facts = item.facts.map((f, i) => `${i + 1}. ${f}`).join("\n");
  return `You are a professional PR writer for Taypro, an Indian solar cleaning robotics company.

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
- Verified facts (use ONLY these; do not invent statistics or client names beyond this list):
${facts}
- Tone: professional, newsworthy, third-person
- Do NOT use placeholder text like [TBD], [INSERT], Lorem ipsum, or XX%
- content must be 250-500 words of body copy (excluding boilerplate)
- Include one compelling quote from the attribution in a <blockquote>
- Media contact email: info@taypro.in`;
}

export async function generatePressReleaseContent(
  item: PressQueueItem
): Promise<GeneratedPressRelease> {
  const raw = await generateTranslationJson<GeminiPressResponse>(buildPrompt(item), {
    quotaScope: "press",
  });

  const title = raw.title?.trim() || item.titleHint;
  const slug = createSlug(title);

  return {
    title,
    subhead: raw.subhead?.trim() || item.summary,
    dateline: raw.dateline?.trim() || `Pune, India — ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`,
    content: sanitizePressReleaseHtml(raw.content ?? ""),
    boilerplate: raw.boilerplate?.trim() || DEFAULT_BOILERPLATE,
    contact: {
      name: raw.contact?.name ?? "Taypro Media Team",
      email: raw.contact?.email ?? "info@taypro.in",
      phone: raw.contact?.phone,
      company: raw.contact?.company ?? "Taypro Private Limited",
    },
    quotes: Array.isArray(raw.quotes) ? raw.quotes : [],
    slug,
  };
}

export function buildPressReleaseSlug(item: PressQueueItem, title: string): string {
  return `${createSlug(title)}-${item.id}`;
}
