"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import OpenLeadModalButton from "./OpenLeadModalButton";
import type { LeadModalOpenOptions } from "./LeadModalContext";

type GenericContactLeadButtonProps = {
  children: ReactNode;
  className?: string;
  source: string;
  analyticsFormType?: string;
  showMessageField?: boolean;
} & Partial<LeadModalOpenOptions>;

/**
 * Default site-wide contact CTA: opens the lead modal with shared Forms copy.
 * Pass partial LeadModalOpenOptions to override title, subtitle, etc.
 */
export function GenericContactLeadButton({
  children,
  className,
  source,
  analyticsFormType = "contact_inquiry",
  showMessageField = true,
  topic,
  title,
  subtitle,
  leadIntent,
  formPrompt,
  messageLabel,
  messagePlaceholder,
  submitLabel,
  thankYouTitle,
  thankYouMessage,
  showCompanyField,
  ...rest
}: GenericContactLeadButtonProps) {
  const t = useTranslations("Forms.leadModal");

  return (
    <OpenLeadModalButton
      className={className}
      source={source}
      analyticsFormType={analyticsFormType}
      topic={topic ?? t("topic")}
      title={title ?? t("title")}
      subtitle={subtitle ?? t("subtitle")}
      leadIntent={leadIntent ?? topic ?? t("topic")}
      formPrompt={formPrompt ?? t("formPrompt")}
      showMessageField={showMessageField}
      showCompanyField={showCompanyField}
      messageLabel={messageLabel ?? t("messageLabel")}
      messagePlaceholder={messagePlaceholder ?? t("messagePlaceholder")}
      submitLabel={submitLabel ?? t("submitLabel")}
      thankYouTitle={thankYouTitle ?? t("thankYouTitle")}
      thankYouMessage={thankYouMessage ?? t("thankYouMessage")}
      {...rest}
    >
      {children}
    </OpenLeadModalButton>
  );
}
