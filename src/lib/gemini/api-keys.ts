import "server-only";

/** Primary + optional fallback keys (GEMINI_API_KEY_2 when primary quota is hit). */
export function listGeminiApiKeys(): string[] {
  const keys = [
    process.env.GEMINI_API_KEY?.trim(),
    process.env.GEMINI_API_KEY_2?.trim(),
  ].filter((key): key is string => Boolean(key));

  if (keys.length === 0) {
    throw new Error("GEMINI_API_KEY is not set, add it to run AI features.");
  }

  return keys;
}

export function getPrimaryGeminiApiKey(): string {
  return listGeminiApiKeys()[0];
}

export function isGeminiQuotaError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("429") ||
    message.toLowerCase().includes("quota") ||
    message.toLowerCase().includes("resource exhausted")
  );
}

export function geminiQuotaErrorMessage(error: unknown): string {
  const base =
    "Gemini API free-tier quota exceeded on all configured keys. Retry after the daily limit resets (Google AI Studio usage).";
  if (error instanceof Error && error.message) {
    return `${base} (${error.message.slice(0, 200)})`;
  }
  return base;
}
