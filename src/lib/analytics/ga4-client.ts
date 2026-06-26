import { readAnalyticsConsent } from "./consent";

/** Same property configured in GTM (G-7G1M6KFY3K). Override via env if needed. */
export const GA4_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "G-7G1M6KFY3K";

const CLIENT_ID_STORAGE_KEY = "taypro_ga_cid";

function getClientId(): string {
  const gaCookie = document.cookie.match(/(?:^|;\s*)_ga=GA\d+\.\d+\.(\d+\.\d+)/);
  if (gaCookie?.[1]) return gaCookie[1];

  try {
    const stored = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    if (stored) return stored;
    const generated = `${Math.floor(Math.random() * 1e9)}.${Math.floor(Date.now() / 1000)}`;
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, generated);
    return generated;
  } catch {
    return `${Math.floor(Math.random() * 1e9)}.${Math.floor(Date.now() / 1000)}`;
  }
}

function sendGa4EventBeacon(
  eventName: string,
  params: Record<string, unknown>,
): void {
  const searchParams = new URLSearchParams();
  searchParams.set("v", "2");
  searchParams.set("tid", GA4_MEASUREMENT_ID);
  searchParams.set("cid", getClientId());
  searchParams.set("en", eventName);
  searchParams.set("dl", window.location.href);
  searchParams.set("dt", document.title);
  searchParams.set("ul", navigator.language || "en");
  searchParams.set("sr", `${window.screen.width}x${window.screen.height}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) searchParams.set(`ep.${key}`, String(value));
  }

  const url = `https://www.google-analytics.com/g/collect?${searchParams.toString()}`;
  if (typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon(url);
    return;
  }

  fetch(url, { method: "POST", mode: "no-cors", keepalive: true }).catch(
    () => {},
  );
}

/**
 * Sends custom events directly to GA4.
 * GTM owns page views and replaces `window.gtag` with a dataLayer stub, so we
 * use the GA4 collect endpoint instead of gtag("event", …).
 */
export function ensureGa4EventClient(): void {
  // No-op: kept for callers that pre-warm analytics after consent.
}

export function sendGa4Event(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (typeof window === "undefined") return;
  if (!readAnalyticsConsent()) return;

  const cleanParams: Record<string, unknown> = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) cleanParams[key] = value;
    }
  }

  sendGa4EventBeacon(eventName, cleanParams);
}
