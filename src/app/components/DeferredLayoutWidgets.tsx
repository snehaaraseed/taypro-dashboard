"use client";

import dynamic from "next/dynamic";

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

/** Analytics, consent, and lead UI — client-only to keep initial HTML/JS lean. */
export default function DeferredLayoutWidgets() {
  return (
    <>
      <CookieConsentWrapper />
      <SiteLeadSlideIn />
      <GoogleTagManagerLoader />
      <ClarityLoader />
    </>
  );
}
