"use client";

import { useEffect, useState } from "react";
import GoogleTagManagerLoader from "./GoogleTagManagerLoader";
import ClarityLoader from "./ClarityLoader";
import SiteLeadSlideIn from "./SiteLeadSlideIn";
import { readAnalyticsConsent } from "@/lib/analytics/consent";

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
