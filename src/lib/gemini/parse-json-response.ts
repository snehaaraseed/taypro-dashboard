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

/** Pull a string field from malformed JSON (e.g. truncated html/content). */
export function extractJsonStringField(raw: string, field: string): string | null {
  const key = `"${field}"`;
  const idx = raw.indexOf(key);
  if (idx < 0) return null;
  let i = idx + key.length;
  while (i < raw.length && /[\s:]/.test(raw[i]!)) i += 1;
  if (raw[i] !== '"') return null;

  i += 1;
  let out = "";
  let escaped = false;
  while (i < raw.length) {
    const ch = raw[i]!;
    if (escaped) {
      if (ch === "n") out += "\n";
      else if (ch === "r") out += "\r";
      else if (ch === "t") out += "\t";
      else if (ch === '"') out += '"';
      else if (ch === "\\") out += "\\";
      else out += ch;
      escaped = false;
      i += 1;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      i += 1;
      continue;
    }
    if (ch === '"') {
      return out.trim() || null;
    }
    out += ch;
    i += 1;
  }
  return out.trim() || null;
}

function jsonFieldCandidates(text: string): string[] {
  const balanced = extractFirstBalancedObject(text);
  return [
    sanitizeGeminiJsonText(text.trim()),
    sanitizeGeminiJsonText(extractJsonSubstring(text)),
    ...(balanced ? [sanitizeGeminiJsonText(balanced)] : []),
  ].filter(Boolean);
}

/** Parse `{ "html": "..." }` or `{ "content": "..." }` from blog section/expand calls. */
export function parseGeminiJsonHtmlField(text: string): string {
  try {
    const parsed = parseGeminiJsonObject<{ html?: string; content?: string }>(text);
    const html = parsed.html ?? parsed.content;
    if (typeof html === "string" && html.trim()) return html.trim();
  } catch {
    // fall through to field extraction
  }
  for (const candidate of jsonFieldCandidates(text)) {
    for (const field of ["html", "content"] as const) {
      const value = extractJsonStringField(candidate, field);
      if (value?.trim()) return value.trim();
    }
  }
  throw new Error("Could not parse html field from AI response");
}

/** Parse `{ "faqs": [ ... ] }` with field extraction fallback. */
export function parseGeminiJsonFaqsField(text: string): unknown {
  try {
    const parsed = parseGeminiJsonObject<{ faqs?: unknown }>(text);
    if (parsed.faqs !== undefined) return parsed.faqs;
  } catch {
    // fall through
  }
  for (const candidate of jsonFieldCandidates(text)) {
    const key = '"faqs"';
    const idx = candidate.indexOf(key);
    if (idx < 0) continue;
    let i = idx + key.length;
    while (i < candidate.length && /[\s:]/.test(candidate[i]!)) i += 1;
    if (candidate[i] !== "[") continue;
    const start = i;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (; i < candidate.length; i++) {
      const ch = candidate[i]!;
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
      if (ch === "[") depth++;
      else if (ch === "]") {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(candidate.slice(start, i + 1));
          } catch {
            break;
          }
        }
      }
    }
  }
  throw new Error("Could not parse faqs field from AI response");
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
