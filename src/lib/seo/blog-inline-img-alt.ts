/**
 * Client-safe inline <img> alt helpers (no Node/server imports).
 */

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
    return `${title}, utility-scale solar panel cleaning in India`.slice(
      0,
      140
    );
  }
  return "Utility-scale solar panel cleaning and O&M in India";
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
