export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Demote in-content h1 tags and close skipped heading levels (e.g. h2 → h4).
 * Assumes the page shell already exposes a single h1.
 */
export function normalizeHeadingLevels(html: string): string {
  if (!html) return html;

  let out = html;
  let prev = "";

  while (out !== prev) {
    prev = out;
    let lastLevel = 1;
    out = out.replace(
      /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi,
      (match, levelStr, attrs, innerHtml) => {
        let level = Number(levelStr);
        if (level === 1) {
          level = 2;
        }
        if (level > lastLevel + 1) {
          level = lastLevel + 1;
        }
        lastLevel = level;
        return `<h${level}${attrs}>${innerHtml}</h${level}>`;
      }
    );
  }

  return out;
}

export function addHeadingIdsAndExtractToc(html: string): {
  contentWithIds: string;
  toc: TocItem[];
} {
  if (!html) {
    return { contentWithIds: html, toc: [] };
  }

  const toc: TocItem[] = [];
  const usedIds = new Set<string>();

  const contentWithIds = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, levelStr, attrs, innerHtml) => {
      const plainText = innerHtml
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();

      if (!plainText) return match;

      const level = Number(levelStr) as 2 | 3;
      let id = slugifyHeading(plainText) || `section-${toc.length + 1}`;
      let suffix = 2;
      while (usedIds.has(id)) {
        id = `${id}-${suffix}`;
        suffix += 1;
      }
      usedIds.add(id);

      toc.push({ id, text: plainText, level });

      if (/id\s*=\s*["'][^"']+["']/i.test(attrs)) {
        return `<h${level}${attrs}>${innerHtml}</h${level}>`;
      }

      return `<h${level}${attrs} id="${id}">${innerHtml}</h${level}>`;
    }
  );

  return { contentWithIds, toc };
}
