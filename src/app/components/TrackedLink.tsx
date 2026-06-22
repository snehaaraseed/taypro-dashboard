"use client";

import type { ComponentProps, MouseEvent } from "react";
import { Link } from "@/i18n/navigation";
import {
  trackContentClick,
  trackNotFoundRecovery,
  type AnalyticsLocation,
} from "@/lib/analytics/track-event";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  trackTitle?: string;
  trackLocation?: AnalyticsLocation | string;
  trackType?: string;
  recoveryType?: "did_you_mean" | "quick_link";
};

function hrefToString(href: TrackedLinkProps["href"]): string {
  if (typeof href === "string") return href;
  if (href && typeof href === "object" && "pathname" in href) {
    return String(href.pathname ?? "");
  }
  return "";
}

export default function TrackedLink({
  href,
  trackTitle,
  trackLocation,
  trackType,
  recoveryType,
  onClick,
  children,
  ...rest
}: TrackedLinkProps) {
  const hrefStr = hrefToString(href);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (recoveryType) {
      trackNotFoundRecovery({
        recoveryType,
        destination: hrefStr,
        label: trackTitle,
      });
    } else {
      trackContentClick({
        href: hrefStr,
        title: trackTitle,
        location: trackLocation,
        linkType: trackType,
      });
    }
    onClick?.(event);
  };

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
