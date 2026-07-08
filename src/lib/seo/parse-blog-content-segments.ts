export type BlogContentSegment =
  | { kind: "html"; html: string }
  | {
      kind: "image";
      src: string;
      alt: string;
      className: string;
      width?: number;
      height?: number;
      caption?: string;
    };

function getAttr(attrs: string, name: string): string {
  const re = new RegExp(
    `${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i"
  );
  const match = re.exec(attrs);
  return (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();
}

function parseIntAttr(attrs: string, name: string): number | undefined {
  const raw = getAttr(attrs, name);
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : undefined;
}

function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]+>/g, "").trim();
}

function parseStandaloneImages(chunk: string): BlogContentSegment[] {
  const segments: BlogContentSegment[] = [];
  const imgRe = /<img\b([^>]*)\/?>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = imgRe.exec(chunk)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: "html", html: chunk.slice(lastIndex, match.index) });
    }

    const attrs = match[1] ?? "";
    segments.push({
      kind: "image",
      src: getAttr(attrs, "src"),
      alt: getAttr(attrs, "alt"),
      className: getAttr(attrs, "class") || "w-full rounded-lg",
      width: parseIntAttr(attrs, "width"),
      height: parseIntAttr(attrs, "height"),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < chunk.length) {
    segments.push({ kind: "html", html: chunk.slice(lastIndex) });
  }

  return segments;
}

/** Split sanitized blog HTML into static chunks and image segments for next/image. */
export function parseBlogContentSegments(html: string): BlogContentSegment[] {
  if (!html.trim()) {
    return [];
  }

  const segments: BlogContentSegment[] = [];
  const figureRe = /<figure\b[^>]*>([\s\S]*?)<\/figure>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = figureRe.exec(html)) !== null) {
    if (match.index > lastIndex) {
      segments.push(...parseStandaloneImages(html.slice(lastIndex, match.index)));
    }

    const inner = match[1] ?? "";
    const imgMatch = /<img\b([^>]*)\/?>/i.exec(inner);
    if (imgMatch) {
      const attrs = imgMatch[1] ?? "";
      const figcaptionMatch = /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i.exec(
        inner
      );
      segments.push({
        kind: "image",
        src: getAttr(attrs, "src"),
        alt: getAttr(attrs, "alt"),
        className: getAttr(attrs, "class") || "w-full rounded-lg",
        width: parseIntAttr(attrs, "width"),
        height: parseIntAttr(attrs, "height"),
        caption: figcaptionMatch
          ? stripHtmlTags(figcaptionMatch[1] ?? "")
          : undefined,
      });
    } else {
      segments.push({ kind: "html", html: match[0] });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < html.length) {
    segments.push(...parseStandaloneImages(html.slice(lastIndex)));
  }

  if (segments.length === 0) {
    return [{ kind: "html", html }];
  }

  return segments;
}
