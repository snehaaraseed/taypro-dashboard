"use client";

import GoogleTagManagerLoader from "./GoogleTagManagerLoader";
import ClarityLoader from "./ClarityLoader";
import SiteLeadSlideIn from "./SiteLeadSlideIn";

/** Analytics + lead UI bundled for a single deferred chunk. */
export default function DeferredSecondaryWidgets() {
  return (
    <>
      <SiteLeadSlideIn />
      <GoogleTagManagerLoader />
      <ClarityLoader />
    </>
  );
}
