/**
 * Parse a display/publish ISO date from a press release dateline.
 * Examples: "Pune, India — May 22, 2024", "May 2024"
 */
export function parsePublishDateFromDateline(dateline: string): string | null {
  const trimmed = dateline.trim();
  if (!trimmed) return null;

  const datePart =
    trimmed.includes("—") || trimmed.includes("–") ?
      trimmed.split(/\s+[—–]\s+/).pop()?.trim() ?? trimmed
    : trimmed.includes(" - ") ?
      trimmed.split(/\s+-\s+/).pop()?.trim() ?? trimmed
    : trimmed;

  const monthYear = datePart.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYear) {
    const parsed = Date.parse(`${monthYear[1]} 1, ${monthYear[2]}`);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
  }

  const parsed = Date.parse(datePart);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }

  return null;
}

export function resolvePressPublishDate(options: {
  dateline?: string;
  publishDate?: string;
  fallback?: string;
}): string {
  if (options.dateline) {
    const fromDateline = parsePublishDateFromDateline(options.dateline);
    if (fromDateline) return fromDateline;
  }
  if (options.publishDate?.trim()) return options.publishDate.trim();
  return options.fallback ?? new Date().toISOString();
}
