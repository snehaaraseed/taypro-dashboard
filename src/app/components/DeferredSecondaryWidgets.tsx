"use client";

import { useEffect, useState } from "react";
import GoogleTagManagerLoader from "./GoogleTagManagerLoader";
import ClarityLoader from "./ClarityLoader";
import SiteLeadSlideIn from "./SiteLeadSlideIn";

/** Must match `COOKIE_PREFERENCES_KEY` in `CookieConsent.tsx`. */
const COOKIE_PREFERENCES_KEY = "cookie-preferences";

function readAnalyticsConsent(): boolean {
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
 * Lead UI loads after idle; analytics chunks mount only when cookies are accepted
 * (avoids parsing GTM/Clarity JS on first paint — better mobile TBT).
 */
export default function DeferredSecondaryWidgets() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAnalyticsAllowed(readAnalyticsConsent());
    sync();

    const onConsent = (event: Event) => {
      const prefs = (event as CustomEvent<{ analytics?: boolean }>).detail;
      setAnalyticsAllowed(Boolean(prefs?.analytics));
    };

    window.addEventListener("cookieConsentUpdated", onConsent);
    return () => window.removeEventListener("cookieConsentUpdated", onConsent);
  }, []);

  return (
    <>
      <SiteLeadSlideIn />
      {analyticsAllowed ? (
        <>
          <GoogleTagManagerLoader />
          <ClarityLoader />
        </>
      ) : null}
    </>
  );
}
