"use client";

import type { ButtonHTMLAttributes, MouseEvent } from "react";
import { useContext } from "react";
import { Link } from "@/i18n/navigation";
import {
  LeadModalContext,
  type LeadModalOpenOptions,
} from "./LeadModalContext";
import { trackCtaClick } from "@/lib/analytics/track-event";

interface OpenLeadModalButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    LeadModalOpenOptions {}

/**
 * Drop-in replacement for `<Link href="/contact">` style CTAs that should
 * keep the user on the page. Opens the global lead modal on click.
 *
 * Falls back to `/contact` when rendered outside `LeadModalProvider` (e.g. root
 * `not-found.tsx`, which is outside the locale layout).
 */
export default function OpenLeadModalButton({
  topic,
  source,
  title,
  subtitle,
  leadIntent,
  formPrompt,
  showMessageField,
  showCompanyField,
  messageLabel,
  messagePlaceholder,
  submitLabel,
  thankYouTitle,
  thankYouMessage,
  analyticsFormType,
  type = "button",
  onClick,
  children,
  className,
  ...rest
}: OpenLeadModalButtonProps) {
  const ctx = useContext(LeadModalContext);

  if (!ctx) {
    return (
      <Link
        href="/contact"
        className={className}
        onClick={() =>
          trackCtaClick({
            ctaName: source ?? topic ?? "contact_fallback",
            location: "unknown",
            destination: "/contact",
          })
        }
      >
        {children}
      </Link>
    );
  }

  const { openLeadModal } = ctx;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    trackCtaClick({
      ctaName: source ?? topic ?? "lead_modal",
      location: "modal",
      destination: "/contact",
    });
    openLeadModal({
      topic,
      source,
      title,
      subtitle,
      leadIntent,
      formPrompt,
      showMessageField,
      showCompanyField,
      messageLabel,
      messagePlaceholder,
      submitLabel,
      thankYouTitle,
      thankYouMessage,
      analyticsFormType,
    });
    onClick?.(event);
  };

  return (
    <button type={type} onClick={handleClick} className={className} {...rest}>
      {children}
    </button>
  );
}
