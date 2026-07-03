/**
 * Shared removal of leaked model planning / chain-of-thought.
 *
 * Gemma "thinks out loud": it restates the prompt, plans, and self-critiques
 * before (and sometimes around) the real HTML. These markers identify text that
 * is planning/scaffolding and must never reach the reader. Used by both the blog
 * and research-insight pipelines.
 */
const PLANNING_PATTERNS: RegExp[] = [
  /\bpart\s+\d+\s*(?:of|\/)\s*\d+\b/i,
  /self[-\s]?correction/i,
  /\bword[-\s]?count\b/i,
  /proceeding to generate/i,
  /constraint checklist/i,
  /confidence score/i,
  /^\s*drafting\b/i,
  /^\s*revised\s+(?:p\d|para|section|text|checklist)/i,
  /\b\d{2,4}\s*[–\-]\s*\d{2,4}\s+words\b/i,
  /html fragment only/i,
  /no markdown(?:\s+fences)?/i,
  /dense,\s*readable prose/i,
  /\*\s*(?:goal|content|focus|links?|citations?|formatting|heading)\s*:/i,
  /check (?:word count|links|citations)/i,
  /===html_?(?:start|end)===/i,
  /return only the html/i,
];

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

/**
 * Remove leaked planning/chain-of-thought, empty paragraphs, and runaway <br>
 * spacing from a model-generated fragment. Safe to run on assembled content
 * (does not touch tables/headings/real prose).
 */
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
