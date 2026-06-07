"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CookieConsent = dynamic(() => import("./CookieConsent"), { ssr: false });
const DeferredSecondaryWidgets = dynamic(
  () => import("./DeferredSecondaryWidgets"),
  { ssr: false }
);

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

/** Analytics, lead UI, and consent — both deferred so cookie banner cannot steal LCP. */
export default function DeferredLayoutWidgets() {
  const consentReady = useIdleReady(4000);
  const secondaryReady = useIdleReady(5000);

  return (
    <>
      {consentReady ? <CookieConsent /> : null}
      {secondaryReady ? <DeferredSecondaryWidgets /> : null}
    </>
  );
}
