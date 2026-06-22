"use client";

import type { ReactNode } from "react";
import {
  TAYPRO_SALES_PHONE_DISPLAY,
  TAYPRO_SALES_PHONE_TEL,
} from "@/lib/contact";
import {
  trackPhoneClick,
  type AnalyticsLocation,
} from "@/lib/analytics/track-event";

type ContactPhoneLinkProps = {
  className?: string;
  location?: AnalyticsLocation;
  children?: ReactNode;
};

export function ContactPhoneLink({
  className = "hover:text-[#A8C117] transition-colors",
  location = "unknown",
  children,
}: ContactPhoneLinkProps) {
  return (
    <a
      href={TAYPRO_SALES_PHONE_TEL}
      className={className}
      onClick={() => trackPhoneClick(location)}
    >
      {children ?? TAYPRO_SALES_PHONE_DISPLAY}
    </a>
  );
}
