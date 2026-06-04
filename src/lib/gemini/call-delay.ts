import "server-only";

const DEFAULT_DELAY_MS = 5_000;

/** Pause between Gemini API calls (RPM smoothing). Set GEMINI_CALL_DELAY_MS=0 to disable. */
export function getGeminiCallDelayMs(): number {
  const raw = process.env.GEMINI_CALL_DELAY_MS?.trim();
  if (raw === "0" || raw === "false" || raw === "off") return 0;
  if (!raw) return DEFAULT_DELAY_MS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_DELAY_MS;
}

export async function pauseAfterGeminiCall(): Promise<void> {
  const ms = getGeminiCallDelayMs();
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}
