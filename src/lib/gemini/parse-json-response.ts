/**
 * Hardened JSON extraction from Gemini text responses (control chars, fenced blocks).
 */

/** Remove illegal control characters that break JSON.parse. */
export function sanitizeGeminiJsonText(raw: string): string {
  return raw
    .replace(/^\uFEFF/, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/\u2028|\u2029/g, " ");
}

function extractJsonSubstring(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]?.trim()) {
    return fenced[1].trim();
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1);
  }
  return text.trim();
}

/**
 * Parse a JSON object from Gemini output with sanitization and light repairs.
 */
export function parseGeminiJsonObject<T extends Record<string, unknown>>(
  text: string
): T {
  const candidates = [
    sanitizeGeminiJsonText(text.trim()),
    sanitizeGeminiJsonText(extractJsonSubstring(text)),
  ];

  let lastError: unknown;
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      return JSON.parse(candidate) as T;
    } catch (error) {
      lastError = error;
      try {
        const repaired = candidate
          .replace(/,\s*([}\]])/g, "$1")
          .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');
        return JSON.parse(repaired) as T;
      } catch (inner) {
        lastError = inner;
      }
    }
  }

  const msg =
    lastError instanceof Error ? lastError.message : String(lastError ?? "unknown");
  throw new Error(`Could not parse JSON from AI response: ${msg}`);
}

export function parseGeminiJsonField<T>(
  text: string,
  field: string
): T | null {
  try {
    const parsed = parseGeminiJsonObject<Record<string, unknown>>(text);
    const value = parsed[field];
    return (value ?? null) as T | null;
  } catch {
    return null;
  }
}
