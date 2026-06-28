"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CookieConsent = dynamic(() => import("./CookieConsent"), { ssr: false });
const DeferredSecondaryWidgets = dynamic(
  () => import("./DeferredSecondaryWidgets"),
  { ssr: false }
);

/** Minimum delay before mounting, idle callbacks can fire during the LCP window. */
function useMinDelayReady(delayMs: number) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return ready;
}

/** Analytics, lead UI, and consent, delayed so cookie copy cannot become LCP. */
export default function DeferredLayoutWidgets() {
  const consentReady = useMinDelayReady(15000);
  const secondaryReady = useMinDelayReady(8000);

  return (
    <>
      {consentReady ? <CookieConsent /> : null}
      {secondaryReady ? <DeferredSecondaryWidgets /> : null}
    </>
  );
}
