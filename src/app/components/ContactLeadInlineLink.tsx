"use client";

import type { ReactNode } from "react";
import { GenericContactLeadButton } from "./GenericContactLeadButton";
import type { LeadModalOpenOptions } from "./LeadModalContext";

type ContactLeadInlineLinkProps = {
  children: ReactNode;
  source: string;
  analyticsFormType?: string;
  className?: string;
} & Partial<LeadModalOpenOptions>;

/** Inline text CTA that opens the lead modal (for `t.rich` and body copy). */
export function ContactLeadInlineLink({
  children,
  source,
  analyticsFormType,
  className = "text-[#5a8f00] font-medium hover:underline",
  ...modalOptions
}: ContactLeadInlineLinkProps) {
  return (
    <GenericContactLeadButton
      source={source}
      analyticsFormType={analyticsFormType}
      className={className}
      {...modalOptions}
    >
      {children}
    </GenericContactLeadButton>
  );
}
