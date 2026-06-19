/**
 * Deterministic HTML hygiene for generated blog bodies (no Gemini).
 */

import { extractH2Headings } from "@/lib/seo/blog-similarity";

const INLINE_FIGURE_BLOCK =
  /<figure[^>]*class="[^"]*blog-inline-figure[^"]*"[^>]*>[\s\S]*?<\/figure>/gi;

const FIGURE_PLACEHOLDER_PREFIX = "\x00BLOG_FIGURE_";

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export function buildDefaultInlineImgAlt(input: {
  title: string;
  primaryKeyword?: string | null;
}): string {
  const kw = input.primaryKeyword?.trim();
  const title = input.title.trim();
  if (kw && title) {
    return `${title}: ${kw} for utility-scale solar plants in India`.slice(
      0,
      140
    );
  }
  if (title) {
    return `${title} — utility-scale solar panel cleaning in India`.slice(
      0,
      140
    );
  }
  return "Utility-scale solar panel cleaning and O&M in India";
}

/** Demote body H1 tags to H2 (page template renders the title as H1). */
export function demoteBodyH1ToH2(html: string): string {
  return html.replace(
    /<h1(\b[^>]*)>([\s\S]*?)<\/h1>/gi,
    (_match, attrs: string, inner: string) => `<h2${attrs}>${inner}</h2>`
  );
}

function maskInlineFigures(html: string): { masked: string; figures: string[] } {
  const figures: string[] = [];
  const masked = html.replace(INLINE_FIGURE_BLOCK, (figure) => {
    const token = `${FIGURE_PLACEHOLDER_PREFIX}${figures.length}\x00`;
    figures.push(figure);
    return token;
  });
  return { masked, figures };
}

function unmaskInlineFigures(masked: string, figures: string[]): string {
  let out = masked;
  for (let i = 0; i < figures.length; i++) {
    out = out.replace(`${FIGURE_PLACEHOLDER_PREFIX}${i}\x00`, figures[i] ?? "");
  }
  return out;
}

export function findInlineImgAltIssue(html: string): string | null {
  const { masked } = maskInlineFigures(html);
  const imgRe = /<img\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = imgRe.exec(masked)) !== null) {
    const tag = match[0] ?? "";
    const altMatch = tag.match(/\balt\s*=\s*["']([^"']*)["']/i);
    const alt = altMatch?.[1]?.trim() ?? "";
    if (alt.length < 20) {
      return alt
        ? `Inline <img> alt too short (${alt.length} chars; need ≥20)`
        : "Inline <img> missing descriptive alt (≥20 chars)";
    }
  }
  return null;
}

export function repairInlineImgAlts(
  html: string,
  context: { title: string; primaryKeyword?: string | null }
): string {
  const defaultAlt = buildDefaultInlineImgAlt(context);
  const safeAlt = escapeHtmlAttr(defaultAlt);
  const { masked, figures } = maskInlineFigures(html);

  const repaired = masked.replace(/<img\b([^>]*)>/gi, (_full, attrs: string) => {
    const altMatch = attrs.match(/\balt\s*=\s*["']([^"']*)["']/i);
    const alt = altMatch?.[1]?.trim() ?? "";
    if (alt.length >= 20) return `<img${attrs}>`;
    if (altMatch) {
      const nextAttrs = attrs.replace(
        /\balt\s*=\s*["'][^"']*["']/i,
        `alt="${safeAlt}"`
      );
      return `<img${nextAttrs}>`;
    }
    return `<img${attrs} alt="${safeAlt}">`;
  });

  return unmaskInlineFigures(repaired, figures);
}

function normalizeH2Key(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Split HTML into preamble (before first H2) and one block per H2 section. */
export function splitHtmlByH2Sections(html: string): {
  preamble: string;
  sections: { key: string; html: string }[];
} {
  const h2StartRe = /<h2\b[^>]*>/gi;
  const starts: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = h2StartRe.exec(html)) !== null) {
    starts.push(match.index);
  }
  if (starts.length === 0) {
    return { preamble: html, sections: [] };
  }

  const preamble = html.slice(0, starts[0]);
  const sections: { key: string; html: string }[] = [];
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i]!;
    const end = i + 1 < starts.length ? starts[i + 1]! : html.length;
    const sectionHtml = html.slice(start, end);
    const keyMatch = sectionHtml.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);
    const key = keyMatch?.[1] ? normalizeH2Key(keyMatch[1]) : `__section_${i}__`;
    sections.push({ key, html: sectionHtml });
  }
  return { preamble, sections };
}

/**
 * Remove repeated H2 blocks (section writer / expand passes often re-emit prior sections).
 * Keeps the first occurrence of each H2 heading key.
 */
export function dedupeRepeatedH2Sections(html: string): {
  html: string;
  removedCount: number;
} {
  const { preamble, sections } = splitHtmlByH2Sections(html);
  if (sections.length <= 1) {
    return { html, removedCount: 0 };
  }

  const seen = new Set<string>();
  const kept: string[] = [];
  let removedCount = 0;
  for (const section of sections) {
    if (seen.has(section.key)) {
      removedCount++;
      continue;
    }
    seen.add(section.key);
    kept.push(section.html);
  }

  if (removedCount === 0) {
    return { html, removedCount: 0 };
  }

  return {
    html: `${preamble}${kept.join("")}`.trim(),
    removedCount,
  };
}

/**
 * When the model repeats the full article with paraphrased H2 titles (translations / expand passes).
 * Keeps the first half when each H2 in block 1 has a thematic twin in block 2.
 */
export function dedupeMirroredH2Block(html: string): {
  html: string;
  removedCount: number;
} {
  const keyDedupe = dedupeRepeatedH2Sections(html);
  if (keyDedupe.removedCount > 0) {
    return keyDedupe;
  }

  const { preamble, sections } = splitHtmlByH2Sections(keyDedupe.html);
  if (sections.length < 8 || sections.length % 2 !== 0) {
    return keyDedupe;
  }

  const half = sections.length / 2;
  let parallelPairs = 0;
  for (let i = 0; i < half; i++) {
    const keyA = sections[i]!.key;
    const keyB = sections[i + half]!.key;
    const wordsA = keyA.split(/\s+/).filter((w) => w.length > 2);
    const wordsB = new Set(keyB.split(/\s+/).filter((w) => w.length > 2));
    let overlap = wordsA.filter((w) => wordsB.has(w)).length;
    if (overlap === 0 && keyA.length > 8 && keyB.length > 8) {
      const gramsA = new Set<string>();
      for (let j = 0; j <= keyA.length - 4; j++) gramsA.add(keyA.slice(j, j + 4));
      let gramHits = 0;
      for (let j = 0; j <= keyB.length - 4; j++) {
        if (gramsA.has(keyB.slice(j, j + 4))) gramHits++;
      }
      overlap = gramHits >= 3 ? 2 : 0;
    }
    if (overlap >= Math.min(2, Math.ceil(Math.max(wordsA.length, 1) * 0.2))) {
      parallelPairs++;
    }
  }

  if (parallelPairs >= Math.max(3, half - 1)) {
    return {
      html: `${preamble}${sections
        .slice(0, half)
        .map((s) => s.html)
        .join("")}`.trim(),
      removedCount: half,
    };
  }

  return keyDedupe;
}

/** Drop H2 sections from a chunk that were already written in prior chunks. */
export function stripPriorH2Sections(
  chunkHtml: string,
  priorH2Keys: Set<string>
): string {
  const { preamble, sections } = splitHtmlByH2Sections(chunkHtml);
  const kept = sections.filter((s) => !priorH2Keys.has(s.key));
  if (kept.length === sections.length) {
    return chunkHtml.trim();
  }
  if (kept.length === 0) {
    return preamble.trim();
  }
  return `${preamble}${kept.map((s) => s.html).join("")}`.trim();
}

export function countDuplicateH2Headings(html: string): number {
  const h2s = extractH2Headings(html);
  return h2s.length - new Set(h2s).size;
}

/** Strip H1 + dedupe H2 blocks + fix short inline img alts before validation. */
export function sanitizeGeneratedBlogBodyHtml(
  html: string,
  context: { title: string; primaryKeyword?: string | null }
): string {
  let out = repairInlineImgAlts(demoteBodyH1ToH2(html), context);
  const { html: deduped, removedCount } = dedupeMirroredH2Block(out);
  if (removedCount > 0) {
    console.warn(
      `Blog body hygiene: removed ${removedCount} duplicate H2 section(s)`
    );
  }
  return deduped;
}

export function isBodyHygieneIssue(issue: string): boolean {
  return (
    issue.includes("<h1>") ||
    issue.includes("Inline <img>") ||
    issue.includes("img alt")
  );
}

export function isBodyHygieneOnlyFailure(issues: string[]): boolean {
  return issues.length > 0 && issues.every(isBodyHygieneIssue);
}
