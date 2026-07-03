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
 * Extract the first complete brace-balanced object, ignoring braces inside
 * strings. Handles trailing prose or a second JSON object after the first,
 * which indexOf/lastIndexOf slicing gets wrong.
 */
function extractFirstBalancedObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i]!;
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function escapeControlCharsInsideJsonStrings(input: string): string {
  let out = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!;
    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      out += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      out += ch;
      continue;
    }
    if (inString) {
      if (ch === "\n") {
        out += "\\n";
        continue;
      }
      if (ch === "\r") {
        out += "\\r";
        continue;
      }
      if (ch === "\t") {
        out += "\\t";
        continue;
      }
      if (ch.charCodeAt(0) < 32) {
        out += " ";
        continue;
      }
    }
    out += ch;
  }

  return out;
}

function repairJsonCandidate(candidate: string): string {
  return candidate
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');
}

/**
 * Parse a JSON object from Gemini output with sanitization and light repairs.
 */
export function parseGeminiJsonObject<T extends Record<string, unknown>>(
  text: string
): T {
  const balanced = extractFirstBalancedObject(text);
  const base = [
    sanitizeGeminiJsonText(text.trim()),
    sanitizeGeminiJsonText(extractJsonSubstring(text)),
    ...(balanced ? [sanitizeGeminiJsonText(balanced)] : []),
  ];

  const candidates = [
    ...base,
    ...base.map(escapeControlCharsInsideJsonStrings),
  ];

  let lastError: unknown;
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      return JSON.parse(candidate) as T;
    } catch (error) {
      lastError = error;
      try {
        return JSON.parse(repairJsonCandidate(candidate)) as T;
      } catch (inner) {
        lastError = inner;
        try {
          return JSON.parse(
            repairJsonCandidate(escapeControlCharsInsideJsonStrings(candidate))
          ) as T;
        } catch (deep) {
          lastError = deep;
        }
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
