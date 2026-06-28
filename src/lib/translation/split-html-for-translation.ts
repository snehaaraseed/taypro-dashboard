/**
 * Split masked HTML for Gemini translation without breaking mid-tag when possible.
 * Order: block boundaries → table rows → sentences → whitespace → hard cap.
 */

const BLOCK_CLOSE =
  /<\/(?:p|section|h[1-6]|div|li|table|ul|ol|blockquote|thead|tbody|tfoot)>/gi;

const FINE_BLOCK_CLOSE = /<\/(?:tr|td|th|li|p)>/gi;

/** Minimum fraction of maxChunkSize before accepting a soft break. */
const MIN_SOFT_BREAK_RATIO = 0.35;

export function splitIntoBlockSegments(html: string): string[] {
  if (!html) return [];

  const segments: string[] = [];
  let lastIndex = 0;
  BLOCK_CLOSE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = BLOCK_CLOSE.exec(html)) !== null) {
    const end = match.index + match[0].length;
    const piece = html.slice(lastIndex, end);
    if (piece.length > 0) segments.push(piece);
    lastIndex = end;
  }

  const tail = html.slice(lastIndex);
  if (tail.length > 0) segments.push(tail);

  return segments.length > 0 ? segments : [html];
}

function splitAtTagBoundaries(html: string, tagRe: RegExp): string[] {
  const segments: string[] = [];
  let lastIndex = 0;
  tagRe.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(html)) !== null) {
    const end = match.index + match[0].length;
    const piece = html.slice(lastIndex, end);
    if (piece.length > 0) segments.push(piece);
    lastIndex = end;
  }

  const tail = html.slice(lastIndex);
  if (tail.length > 0) segments.push(tail);

  return segments.length > 0 ? segments : [html];
}

function findLastSentenceBreak(slice: string): number {
  // Latin + Devanagari danda + CJK full stop
  const re = /(?:[.!?。！？]|।)\s+/g;
  let last = -1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(slice)) !== null) {
    last = m.index + m[0].length;
  }
  return last;
}

function splitOversizedSegment(segment: string, maxChunkSize: number): string[] {
  if (segment.length <= maxChunkSize) return [segment];

  const fine = splitAtTagBoundaries(segment, FINE_BLOCK_CLOSE);
  if (fine.length > 1) {
    return packSegmentsIntoChunks(fine, maxChunkSize).flatMap((chunk) =>
      chunk.length > maxChunkSize
        ? splitAtSentenceOrWhitespace(chunk, maxChunkSize)
        : [chunk]
    );
  }

  return splitAtSentenceOrWhitespace(segment, maxChunkSize);
}

function splitAtSentenceOrWhitespace(html: string, maxChunkSize: number): string[] {
  if (html.length <= maxChunkSize) return [html];

  const chunks: string[] = [];
  let start = 0;
  const minBreak = Math.floor(maxChunkSize * MIN_SOFT_BREAK_RATIO);

  while (start < html.length) {
    const remaining = html.length - start;
    if (remaining <= maxChunkSize) {
      chunks.push(html.slice(start));
      break;
    }

    const slice = html.slice(start, start + maxChunkSize);
    let breakAt = findLastSentenceBreak(slice);

    if (breakAt < minBreak) {
      const ws = slice.lastIndexOf(" ");
      if (ws >= minBreak) breakAt = ws + 1;
    }

    if (breakAt < minBreak) {
      breakAt = maxChunkSize;
    }

    chunks.push(html.slice(start, start + breakAt));
    start += breakAt;
  }

  return chunks;
}

function packSegmentsIntoChunks(
  segments: string[],
  maxChunkSize: number
): string[] {
  const chunks: string[] = [];
  let current = "";

  for (const segment of segments) {
    if (segment.length > maxChunkSize) {
      if (current.length > 0) {
        chunks.push(current);
        current = "";
      }
      chunks.push(...splitOversizedSegment(segment, maxChunkSize));
      continue;
    }

    if (current.length > 0 && current.length + segment.length > maxChunkSize) {
      chunks.push(current);
      current = segment;
    } else {
      current += segment;
    }
  }

  if (current.length > 0) chunks.push(current);
  return chunks;
}

/**
 * Split HTML into translation chunks. Prefer whole paragraphs/sections;
 * oversized blocks are sub-split at row/sentence/whitespace boundaries.
 */
export function splitMaskedHtmlForTranslation(
  html: string,
  maxChunkSize: number
): string[] {
  if (!html || html.length <= maxChunkSize) {
    return html ? [html] : [];
  }

  const segments = splitIntoBlockSegments(html);
  const chunks = packSegmentsIntoChunks(segments, maxChunkSize);

  return chunks.filter((c) => c.length > 0);
}
