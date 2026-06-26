"use client";

import { useTranslations } from "next-intl";
import OpenLeadModalButton from "./OpenLeadModalButton";

export function AiIntelligenceContactButton({
  className = "inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl border border-white/25 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors",
}: {
  className?: string;
}) {
  const t = useTranslations("AiIntelligencePage.cta.leadModal");

  return (
    <OpenLeadModalButton
      className={className}
      source="ai_intelligence"
      topic={t("topic")}
      title={t("title")}
      subtitle={t("subtitle")}
      leadIntent={t("topic")}
      formPrompt={t("formPrompt")}
      showMessageField
      messageLabel={t("messageLabel")}
      messagePlaceholder={t("messagePlaceholder")}
      submitLabel={t("submitLabel")}
      thankYouTitle={t("thankYouTitle")}
      thankYouMessage={t("thankYouMessage")}
      analyticsFormType="ai_intelligence_inquiry"
    >
      {t("ctaLabel")}
    </OpenLeadModalButton>
  );
}
