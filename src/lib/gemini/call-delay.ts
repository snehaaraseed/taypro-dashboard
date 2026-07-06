import "server-only";
import { getDb } from "@/lib/db";
import { sql } from "drizzle-orm";

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

  const db = getDb();
  let neededDelay = 0;

  // Run a synchronous SQLite transaction via drizzle-orm
  db.transaction(() => {
    // Ensure lock table exists
    db.run(sql`CREATE TABLE IF NOT EXISTS _gemini_call_lock (
      key TEXT PRIMARY KEY,
      last_call_at INTEGER NOT NULL
    )`);
    // Insert initial lock row if missing
    db.run(sql`INSERT OR IGNORE INTO _gemini_call_lock (key, last_call_at) VALUES ('gemini', 0)`);

    // Fetch the projected timestamp of the last call
    const row = db.get<{ last_call_at: number }>(
      sql`SELECT last_call_at FROM _gemini_call_lock WHERE key = 'gemini'`
    );
    const lastCallAt = row?.last_call_at ?? 0;
    const now = Date.now();

    let targetTime = now;
    if (now - lastCallAt < ms) {
      targetTime = lastCallAt + ms;
      neededDelay = targetTime - now;
    } else {
      targetTime = now;
      neededDelay = 0;
    }

    // Update projected call timestamp so subsequent requests wait further
    db.run(sql`UPDATE _gemini_call_lock SET last_call_at = ${targetTime} WHERE key = 'gemini'`);
  });

  // Perform the delay in the JS thread (outside the database write lock)
  if (neededDelay > 0) {
    await new Promise((resolve) => setTimeout(resolve, neededDelay));
  }
}
