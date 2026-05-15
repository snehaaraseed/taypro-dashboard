"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CookieConsentWrapper = dynamic(
  () => import("./CookieConsentWrapper"),
  { ssr: false }
);
const SiteLeadSlideIn = dynamic(() => import("./SiteLeadSlideIn"), {
  ssr: false,
});
const GoogleTagManagerLoader = dynamic(
  () => import("./GoogleTagManagerLoader"),
  { ssr: false }
);
const ClarityLoader = dynamic(() => import("./ClarityLoader"), { ssr: false });

/** Defer non-critical widgets until the main thread is idle (better TBT / INP). */
function useIdleReady(timeoutMs = 4000) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const enable = () => setReady(true);
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(enable, { timeout: timeoutMs });
      return () => cancelIdleCallback(id);
    }
    const t = window.setTimeout(enable, Math.min(timeoutMs, 3000));
    return () => clearTimeout(t);
  }, [timeoutMs]);

  return ready;
}

/** Analytics, lead UI, and consent — consent first; rest after idle. */
export default function DeferredLayoutWidgets() {
  const secondaryReady = useIdleReady(4000);

  return (
    <>
      <CookieConsentWrapper />
      {secondaryReady ? (
        <>
          <SiteLeadSlideIn />
          <GoogleTagManagerLoader />
          <ClarityLoader />
        </>
      ) : null}
    </>
  );
}
