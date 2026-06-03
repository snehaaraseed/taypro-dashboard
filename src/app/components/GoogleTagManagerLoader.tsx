"use client";

import { useEffect } from "react";

/** Must match `COOKIE_PREFERENCES_KEY` in `CookieConsent.tsx`. */
const COOKIE_PREFERENCES_KEY = "cookie-preferences";

const GTM_CONTAINER_ID = "GTM-N5DH4N38";

function readAnalyticsPreference(): boolean {
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

/**
 * Loads the GTM web container only after analytics cookies are accepted.
 * Configure GA4 (e.g. G-7G1M6KFY3K) and other tags inside Tag Manager, not in this repo.
 */
export default function GoogleTagManagerLoader() {
  useEffect(() => {
    const win = window as Window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
    };

    const applyAnalyticsConsent = (granted: boolean) => {
      const gtag = win.gtag;
      if (typeof gtag === "function") {
        gtag("consent", "update", {
          analytics_storage: granted ? "granted" : "denied",
        });
      }
    };

    const ensureGtmBootstrap = () => {
      if (document.getElementById("taypro-gtm-script")) return;

      win.dataLayer = win.dataLayer || [];
      win.gtag = function gtag(...args: unknown[]) {
        win.dataLayer!.push(args);
      };
      win.gtag("consent", "default", {
        analytics_storage: "denied",
        wait_for_update: 500,
      });

      win.dataLayer.push({
        "gtm.start": new Date().getTime(),
        event: "gtm.js",
      });

      const script = document.createElement("script");
      script.id = "taypro-gtm-script";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_CONTAINER_ID)}`;
      script.onload = () => {
        applyAnalyticsConsent(true);
      };
      const firstScript = document.getElementsByTagName("script")[0];
      if (firstScript?.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
    };

    const sync = (analytics: boolean) => {
      if (analytics) {
        if (document.getElementById("taypro-gtm-script")) {
          applyAnalyticsConsent(true);
        } else {
          ensureGtmBootstrap();
        }
      } else {
        applyAnalyticsConsent(false);
      }
    };

    sync(readAnalyticsPreference());

    const onConsent = (e: Event) => {
      const prefs = (e as CustomEvent<{ analytics?: boolean }>).detail;
      sync(Boolean(prefs?.analytics));
    };
    window.addEventListener("cookieConsentUpdated", onConsent);
    return () => window.removeEventListener("cookieConsentUpdated", onConsent);
  }, []);

  return null;
}
