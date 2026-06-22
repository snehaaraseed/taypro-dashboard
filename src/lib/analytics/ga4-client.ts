import { readAnalyticsConsent } from "./consent";

/** Same property configured in GTM (G-7G1M6KFY3K). Override via env if needed. */
export const GA4_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "G-7G1M6KFY3K";

type GtagFn = (...args: unknown[]) => void;

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: GtagFn;
};

let ga4InitStarted = false;
let ga4Ready = false;
const pendingEvents: Array<{ name: string; params: Record<string, unknown> }> =
  [];

function getAnalyticsWindow(): AnalyticsWindow | undefined {
  if (typeof window === "undefined") return undefined;
  return window as AnalyticsWindow;
}

function flushPendingEvents(gtag: GtagFn): void {
  while (pendingEvents.length > 0) {
    const next = pendingEvents.shift();
    if (next) gtag("event", next.name, next.params);
  }
  ga4Ready = true;
}

/**
 * Loads gtag.js and configures GA4 for custom events only.
 * Page views stay with GTM; this avoids creating a GTM tag per event.
 */
export function ensureGa4EventClient(): void {
  if (ga4Ready) return;
  if (!readAnalyticsConsent()) return;

  const win = getAnalyticsWindow();
  if (!win) return;

  win.dataLayer = win.dataLayer || [];
  if (!win.gtag) {
    win.gtag = function gtag(...args: unknown[]) {
      win.dataLayer!.push(args);
    };
  }

  const gtag = win.gtag;
  if (ga4InitStarted) return;
  ga4InitStarted = true;

  const finishInit = () => {
    gtag("js", new Date());
    gtag("config", GA4_MEASUREMENT_ID, { send_page_view: false });
    flushPendingEvents(gtag);
  };

  const existing = document.getElementById("taypro-ga4-script");
  if (existing) {
    finishInit();
    return;
  }

  const script = document.createElement("script");
  script.id = "taypro-ga4-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_MEASUREMENT_ID)}`;
  script.onload = finishInit;
  document.head.appendChild(script);
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

  const win = getAnalyticsWindow();
  if (!win) return;

  if (ga4Ready && win.gtag) {
    win.gtag("event", eventName, cleanParams);
    return;
  }

  pendingEvents.push({ name: eventName, params: cleanParams });
  ensureGa4EventClient();
}
