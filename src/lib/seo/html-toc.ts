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
