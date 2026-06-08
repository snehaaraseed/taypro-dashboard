"use client";

import type { ButtonHTMLAttributes, MouseEvent } from "react";
import { useContext } from "react";
import { Link } from "@/i18n/navigation";
import {
  LeadModalContext,
  type LeadModalOpenOptions,
} from "./LeadModalContext";

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
  type = "button",
  onClick,
  children,
  className,
  ...rest
}: OpenLeadModalButtonProps) {
  const ctx = useContext(LeadModalContext);

  if (!ctx) {
    return (
      <Link href="/contact" className={className}>
        {children}
      </Link>
    );
  }

  const { openLeadModal } = ctx;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    openLeadModal({ topic, source, title, subtitle });
    onClick?.(event);
  };

  return (
    <button type={type} onClick={handleClick} className={className} {...rest}>
      {children}
    </button>
  );
}
