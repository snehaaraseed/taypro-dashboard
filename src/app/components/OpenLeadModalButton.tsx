"use client";

import type { ButtonHTMLAttributes, MouseEvent } from "react";
import { useLeadModal, type LeadModalOpenOptions } from "./LeadModalContext";

interface OpenLeadModalButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    LeadModalOpenOptions {}

/**
 * Drop-in replacement for `<Link href="/contact">` style CTAs that should
 * keep the user on the page. Opens the global lead modal on click.
 *
 * Pass through any standard button props (className, children, etc.).
 */
export default function OpenLeadModalButton({
  topic,
  source,
  title,
  subtitle,
  type = "button",
  onClick,
  children,
  ...rest
}: OpenLeadModalButtonProps) {
  const { openLeadModal } = useLeadModal();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    openLeadModal({ topic, source, title, subtitle });
    onClick?.(event);
  };

  return (
    <button type={type} onClick={handleClick} {...rest}>
      {children}
    </button>
  );
}
