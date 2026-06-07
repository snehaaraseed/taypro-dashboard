import * as cheerio from "cheerio";

const PLACEHOLDER_RE = /⟦M\d+⟧/g;

/** Elements whose markup and URLs must not be altered by the model. */
const PRESERVE_SELECTORS =
  "figure, img, picture, video, iframe, source, svg, object, embed, audio";

const INTERNAL_ANCHOR_RE =
  /<a\b[^>]*\bhref\s*=\s*["'](\/[^"'#][^"']*)["'][^>]*>[\s\S]*?<\/a>/gi;

export type MaskedHtml = {
  masked: string;
  fragments: Map<string, string>;
};

/**
 * Replace media-heavy tags with opaque placeholders before translation.
 * Restores exact markup (src, width, classes) after translation.
 */
export function maskMediaInHtml(html: string): MaskedHtml {
  const fragments = new Map<string, string>();
  if (!html?.trim()) {
    return { masked: html || "", fragments };
  }

  const closeTag = "</" + "div>";
  const $ = cheerio.load(`<div id="__tr_root__">${html}${closeTag}`, {
    xml: false,
  });

  $(PRESERVE_SELECTORS).each((_, el) => {
    const key = `⟦M${fragments.size}⟧`;
    const outer = $.html(el);
    if (!outer) return;
    fragments.set(key, outer);
    $(el).replaceWith(key);
  });

  const masked = $("#__tr_root__").html() ?? "";
  return { masked, fragments };
}

export function unmaskMediaInHtml(masked: string, fragments: Map<string, string>): string {
  let html = masked;
  for (const [key, fragment] of fragments) {
    html = html.split(key).join(fragment);
  }

  const dangling = [...new Set(html.match(PLACEHOLDER_RE) ?? [])];
  for (const key of dangling) {
    const fragment = fragments.get(key);
    if (fragment) {
      html = html.split(key).join(fragment);
    }
  }

  // Model sometimes deletes placeholders entirely — append missing media from source mask.
  for (const fragment of fragments.values()) {
    if (!html.includes(fragment)) {
      html += `\n${fragment}`;
    }
  }

  const stillMissing = html.match(PLACEHOLDER_RE);
  if (stillMissing?.length) {
    throw new Error(
      `Translation dropped media placeholders: ${[...new Set(stillMissing)].join(", ")}`
    );
  }

  return html;
}

/** Copy internal Taypro links from English source when the model strips them. */
export function restoreMissingInternalLinks(
  sourceHtml: string,
  translatedHtml: string
): string {
  const seen = new Set<string>();
  let out = translatedHtml;
  INTERNAL_ANCHOR_RE.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = INTERNAL_ANCHOR_RE.exec(sourceHtml)) !== null) {
    const href = match[1];
    const full = match[0];
    if (seen.has(href)) continue;
    seen.add(href);
    if (out.includes(`href="${href}"`) || out.includes(`href='${href}'`)) continue;
    out += `\n<p>${full}</p>`;
  }

  return out;
}

/** Post-process translated blog HTML so structure checks pass without losing media or links. */
export function repairTranslatedBlogHtml(
  sourceHtml: string,
  translatedHtml: string
): string {
  return restoreMissingInternalLinks(sourceHtml, translatedHtml);
}
