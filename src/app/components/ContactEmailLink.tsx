"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  buildTayproMailtoHref,
  type TayproEmailMailbox,
} from "@/lib/contact";
import {
  trackEmailClick,
  type AnalyticsLocation,
} from "@/lib/analytics/track-event";

type ContactEmailLinkProps = {
  mailbox?: TayproEmailMailbox;
  subject?: string;
  body?: string;
  children: ReactNode;
  className?: string;
  location?: AnalyticsLocation;
};

/**
 * Mailto link whose address is applied after mount so simple scrapers
 * reading static HTML do not harvest a plaintext email.
 */
export function ContactEmailLink({
  mailbox = "sales",
  subject,
  body,
  children,
  className,
  location = "unknown",
}: ContactEmailLinkProps) {
  const [href, setHref] = useState<string | undefined>();

  useEffect(() => {
    setHref(buildTayproMailtoHref(mailbox, { subject, body }));
  }, [mailbox, subject, body]);

  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        if (!href) {
          event.preventDefault();
          return;
        }
        trackEmailClick(location, mailbox);
      }}
    >
      {children}
    </a>
  );
}
