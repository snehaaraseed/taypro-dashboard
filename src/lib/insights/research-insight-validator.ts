import "server-only";

import type { FactResearchBrief } from "@/lib/gemini/grounded-fact-research";
import type { SerpResearchBrief } from "@/lib/gemini/grounded-serp-research";
import { h2OutlineCovered } from "@/lib/seo/blog-section-writer";
import type { ResearchReportPlan } from "@/lib/insights/research-report-planner";

export type ResearchValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };

export const RESEARCH_MIN_WORD_COUNT = (() => {
  const raw = process.env.RESEARCH_INSIGHT_MIN_WORDS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 3500;
  return Number.isFinite(n) && n > 500 ? n : 3500;
})();

export const RESEARCH_MIN_SOURCE_LINKS = (() => {
  const raw = process.env.RESEARCH_INSIGHT_MIN_SOURCES?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 6;
  return Number.isFinite(n) && n > 0 ? n : 6;
})();

export const RESEARCH_MIN_H2_SECTIONS = (() => {
  const raw = process.env.RESEARCH_INSIGHT_MIN_H2?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 10;
  return Number.isFinite(n) && n > 0 ? n : 10;
})();

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countResearchWords(html: string): number {
  const text = stripHtml(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function extractH2Headings(html: string): string[] {
  const headings: string[] = [];
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    headings.push(stripHtml(match[1] ?? ""));
  }
  return headings;
}

function countExternalSourceLinks(html: string): number {
  const re = /<a[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
  let count = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const href = match[1] ?? "";
    if (!href.includes("taypro.in") && !href.startsWith("/")) {
      count += 1;
    }
  }
  return count;
}

function normalizeH2Key(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

/** Model planning / chain-of-thought that must never reach the reader. */
const SCAFFOLDING_MARKERS: RegExp[] = [
  /\bpart\s+\d+\s*(?:of|\/)\s*\d+\b/i,
  /self[-\s]?correction/i,
  /proceeding to generate/i,
  /\bword[-\s]?count\b/i,
  /constraint checklist/i,
  /confidence score/i,
  /===html_(?:start|end)===/i,
];

function findScaffoldingLeak(text: string): string | null {
  for (const re of SCAFFOLDING_MARKERS) {
    const m = re.exec(text);
    if (m) return m[0];
  }
  return null;
}

export function validateResearchInsightContent(
  html: string,
  options?: {
    minWords?: number;
    minSourceLinks?: number;
    plan?: ResearchReportPlan;
    expectedSourceUris?: string[];
  }
): ResearchValidationResult {
  const errors: string[] = [];
  const minWords = options?.minWords ?? RESEARCH_MIN_WORD_COUNT;
  const minSourceLinks = options?.minSourceLinks ?? RESEARCH_MIN_SOURCE_LINKS;

  if (/<h1[\s>]/i.test(html)) {
    errors.push("Content must not include <h1> (page title is rendered separately).");
  }

  const scaffolding = findScaffoldingLeak(stripHtml(html));
  if (scaffolding) {
    errors.push(
      `Content contains leaked model scaffolding ("${scaffolding}"), not reader-ready.`
    );
  }

  const words = countResearchWords(html);
  if (words < minWords) {
    errors.push(`Word count ${words} is below minimum ${minWords}.`);
  }

  const h2s = extractH2Headings(html);
  if (h2s.length < RESEARCH_MIN_H2_SECTIONS) {
    errors.push(
      `Only ${h2s.length} H2 sections found; need at least ${RESEARCH_MIN_H2_SECTIONS}.`
    );
  }

  if (options?.plan?.h2Outline?.length) {
    const writtenKeys = new Set(h2s.map(normalizeH2Key));
    const missing = options.plan.h2Outline.filter(
      (planned) => !h2OutlineCovered(planned, writtenKeys)
    );
    if (missing.length > 0) {
      errors.push(
        `Missing planned sections: ${missing.slice(0, 4).join("; ")}${missing.length > 4 ? "…" : ""}`
      );
    }
  }

  const hasSourcesSection = h2s.some((h) =>
    /sources|references|methodology/i.test(h)
  );
  if (!hasSourcesSection) {
    errors.push('Missing "Sources" or "Methodology" H2 section.');
  }

  const externalLinks = countExternalSourceLinks(html);
  if (externalLinks < minSourceLinks) {
    errors.push(
      `Only ${externalLinks} external source links found; need at least ${minSourceLinks}.`
    );
  }

  if (options?.expectedSourceUris?.length) {
    const linked = new Set<string>();
    const re = /href=["'](https?:\/\/[^"']+)["']/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      linked.add(m[1]!);
    }
    const expected = options.expectedSourceUris.filter(Boolean);
    const matched = expected.filter((uri) =>
      [...linked].some((l) => l.startsWith(uri) || uri.startsWith(l))
    );
    if (matched.length < Math.min(3, expected.length)) {
      errors.push(
        "Body should cite at least 3 URIs from grounding metadata inline or in Sources."
      );
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}

export function mergeResearchSources(
  serp: SerpResearchBrief, ...facts: FactResearchBrief[]
): { title?: string; uri?: string }[] {
  const seen = new Set<string>();
  const out: { title?: string; uri?: string }[] = [];
  for (const src of [serp, ...facts].flatMap((b) => b.sources)) {
    const uri = src.uri?.trim();
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);
    out.push(src);
  }
  return out;
}

export function buildDeterministicSourcesSection(
  sources: { title?: string; uri?: string }[],
  generatedAt: string
): string {
  const items =
    sources.length > 0
      ? sources
          .slice(0, 25)
          .map((s) => {
            const label = s.title?.trim() || s.uri || "Source";
            const uri = s.uri?.trim();
            if (!uri) return `<li>${label}</li>`;
            return `<li><a href="${uri}" rel="noopener noreferrer">${label}</a></li>`;
          })
          .join("\n")
      : "<li>Grounded research did not return source URIs: verify claims independently.</li>";

  return `<h2>Sources &amp; methodology</h2>
<p>This monthly research report was compiled for Taypro Insights on ${generatedAt.slice(0, 10)}. Industry statistics, regulatory notes, and market trends were gathered through multiple Google Search grounding passes (Gemini). Economics tables use Taypro&apos;s deterministic ROI calculator, not third-party pricing databases.</p>
<ul>
${items}
</ul>
<p>For Taypro product performance definitions, see <a href="/performance-and-test-methodology">Performance &amp; Test Methodology</a>. This report is informational procurement research, not a binding quote or engineering study.</p>`;
}
