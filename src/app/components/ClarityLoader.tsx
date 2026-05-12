"use client";

import { useEffect } from "react";

/** Must match `COOKIE_PREFERENCES_KEY` in `CookieConsent.tsx`. */
const COOKIE_PREFERENCES_KEY = "cookie-preferences";
const CLARITY_PROJECT_ID = "wq1fdkiogb";

type CookiePreferences = {
  analytics?: boolean;
};

type ClarityConsent = {
  ad_Storage: "granted" | "denied";
  analytics_Storage: "granted" | "denied";
};

type ClarityFn = ((command: string, ...args: unknown[]) => void) & {
  q?: unknown[][];
};

declare global {
  interface Window {
    clarity?: ClarityFn;
  }
}

function readAnalyticsPreference(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const raw = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (!raw) return false;

    const prefs = JSON.parse(raw) as CookiePreferences;
    return Boolean(prefs.analytics);
  } catch {
    return false;
  }
}

function ensureClarityBootstrap() {
  if (document.getElementById("taypro-clarity-script")) return;

  const clarity =
    window.clarity ||
    (function clarity(...args: unknown[]) {
      (clarity.q = clarity.q || []).push(args);
    } as ClarityFn);

  window.clarity = clarity;

  const script = document.createElement("script");
  script.id = "taypro-clarity-script";
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;

  const firstScript = document.getElementsByTagName("script")[0];
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
}

function updateClarityConsent(granted: boolean) {
  if (typeof window.clarity !== "function") return;

  const consent: ClarityConsent = {
    ad_Storage: "denied",
    analytics_Storage: granted ? "granted" : "denied",
  };

  window.clarity("consentv2", consent);

  if (!granted) {
    window.clarity("consent", false);
  }
}

/**
 * Loads Clarity only after analytics cookies are accepted.
 * Once loaded, keep Clarity in sync with consent changes.
 */
export default function ClarityLoader() {
  useEffect(() => {
    const sync = (analyticsGranted: boolean) => {
      if (analyticsGranted) {
        ensureClarityBootstrap();
      }

      updateClarityConsent(analyticsGranted);
    };

    sync(readAnalyticsPreference());

    const onConsent = (event: Event) => {
      const prefs = (event as CustomEvent<CookiePreferences>).detail;
      sync(Boolean(prefs?.analytics));
    };

    window.addEventListener("cookieConsentUpdated", onConsent);
    return () => window.removeEventListener("cookieConsentUpdated", onConsent);
  }, []);

  return null;
}
