/** Must match `COOKIE_PREFERENCES_KEY` in `CookieConsent.tsx`. */
export const COOKIE_PREFERENCES_KEY = "cookie-preferences";

export function readAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (!raw) return false;
    const prefs = JSON.parse(raw) as { analytics?: boolean };
    return Boolean(prefs.analytics);
  } catch {
    return false;
  }
}
