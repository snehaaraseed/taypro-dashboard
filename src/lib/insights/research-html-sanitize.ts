import "server-only";

import { demoteBodyH1ToH2, splitHtmlByH2Sections } from "@/lib/seo/blog-body-hygiene";

/**
 * Gemma "thinks out loud", it restates the prompt, plans, and self-critiques
 * before (and sometimes around) the real HTML. These markers identify text that
 * is planning/scaffolding and must never reach the reader.
 */
const PLANNING_PATTERNS: RegExp[] = [
  /\bpart\s+\d+\s*(?:of|\/)\s*\d+\b/i,
  /self[-\s]?correction/i,
  /\bword[-\s]?count\b/i,
  /proceeding to generate/i,
  /constraint checklist/i,
  /confidence score/i,
  /^\s*drafting\b/i,
  /\b\d{2,4}\s*[–\-]\s*\d{2,4}\s+words\b/i,
  /html fragment only/i,
  /no markdown(?:\s+fences)?/i,
  /dense,\s*readable prose/i,
  /\*\s*(?:goal|content|focus|links?|citations?|formatting|heading)\s*:/i,
  /check (?:word count|links|citations)/i,
  /===html_(?:start|end)===/i,
];

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Remove leaked planning/chain-of-thought, empty paragraphs, and runaway <br>
 * spacing from a model-generated fragment. Safe to run on assembled content
 * (does not touch tables/headings/real prose).
 */
function blockLooksLikePlanning(text: string): boolean {
  if (!text) return true;
  return PLANNING_PATTERNS.some((re) => re.test(text));
}

/** Remove planning-only sentences from mixed prose (keeps the rest of the paragraph). */
function stripPlanningSentences(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const kept = sentences.filter((s) => !blockLooksLikePlanning(s.trim()));
  return kept.join(" ").trim();
}

export function stripPlanningArtifacts(html: string): string {
  let out = html;

  // Drop <p>/<li> blocks whose visible text is empty or pure planning.
  out = out.replace(
    /<(p|li|h3|h4|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi,
    (full: string, _tag: string, inner: string) => {
      const text = plainText(inner);
      if (!text) return "";
      if (blockLooksLikePlanning(text)) {
        const cleaned = stripPlanningSentences(text);
        if (!cleaned || blockLooksLikePlanning(cleaned)) return "";
        return full.replace(inner, cleaned);
      }
      return full;
    }
  );

  // Stray planning sentences sitting as raw text between tags.
  out = out.replace(/(^|>)\s*Part\s+\d+\s*(?:of|\/)\s*\d+[^<]*/gi, "$1");
  out = out.replace(/(^|>)\s*\(\s*Proceeding to generate[^<]*/gi, "$1");
  out = out.replace(/\bSelf[-\s]?Correction\b[^<]*/gi, "");
  out = out.replace(/\bWord[-\s]?count\b[^<]*/gi, "");

  // Collapse runaway spacing the model emits as "formatting".
  out = out.replace(/(?:\s*<br\s*\/?>\s*){2,}/gi, "<br>");
  out = out.replace(/<p\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "");
  out = out.replace(/\n{3,}/g, "\n\n");

  return out.trim();
}

/**
 * Clean a single section-writer chunk: keep only real H2 sections (drop any
 * planning preamble before the first <h2>) and strip leaked artifacts.
 */
export function cleanResearchSectionHtml(html: string): string {
  const { sections } = splitHtmlByH2Sections(html);
  const body = sections.length
    ? sections.map((s) => s.html).join("\n")
    : /<h2[\s>]/i.test(html)
      ? html
      : "";
  return stripPlanningArtifacts(body);
}

/** Page template renders title as H1: strip/demote any model-emitted H1. */
export function sanitizeResearchReportHtml(html: string): string {
  let out = demoteBodyH1ToH2(html);
  out = out.replace(/<h1(\b[^>]*)>/gi, "<h2$1>");
  out = out.replace(/<\/h1>/gi, "</h2>");
  out = stripPlanningArtifacts(out);
  return out;
}

export function researchHtmlHasH1(html: string): boolean {
  return /<h1[\s>]/i.test(html);
}
