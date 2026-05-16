import * as cheerio from "cheerio";

const PLACEHOLDER_RE = /⟦M\d+⟧/g;

/** Elements whose markup and URLs must not be altered by the model. */
const PRESERVE_SELECTORS =
  "img, picture, video, iframe, source, svg, object, embed, audio";

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

  const missing = html.match(PLACEHOLDER_RE);
  if (missing?.length) {
    throw new Error(
      `Translation dropped media placeholders: ${[...new Set(missing)].join(", ")}`
    );
  }

  return html;
}
