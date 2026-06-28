import "server-only";

const MAX_NUMBERED_KEYS = 10;

/** Primary + GEMINI_API_KEY_2 … GEMINI_API_KEY_10 (deduped, non-empty). */
export function listGeminiApiKeys(): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();

  const add = (raw: string | undefined) => {
    const key = raw?.trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    keys.push(key);
  };

  add(process.env.GEMINI_API_KEY);
  for (let i = 2; i <= MAX_NUMBERED_KEYS; i++) {
    add(process.env[`GEMINI_API_KEY_${i}` as keyof NodeJS.ProcessEnv] as
      | string
      | undefined);
  }

  if (keys.length === 0) {
    throw new Error("GEMINI_API_KEY is not set, add it to run AI features.");
  }

  return keys;
}

export function getGeminiKeyPoolSize(): number {
  return listGeminiApiKeys().length;
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
