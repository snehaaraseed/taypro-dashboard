"use client";

import { useTranslations } from "next-intl";
import OpenLeadModalButton from "./OpenLeadModalButton";

export function UtilityOperationsLeadCTAs() {
  const t = useTranslations("UtilityOperationsPage.cta");
  const tInvestor = useTranslations("CompanyPage.investors.leadModal");

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-3">
      <OpenLeadModalButton
        source="utility_operations"
        topic={t("quoteTopic")}
        title={t("quoteTitle")}
        subtitle={t("quoteSubtitle")}
        leadIntent={t("quoteTopic")}
        formPrompt={t("quoteFormPrompt")}
        submitLabel={t("quote")}
        analyticsFormType="utility_operations_quote"
        className="inline-flex justify-center px-6 py-3 rounded-lg bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
      >
        {t("quote")}
      </OpenLeadModalButton>
      <OpenLeadModalButton
        source="utility_operations"
        topic={tInvestor("topic")}
        title={tInvestor("title")}
        subtitle={tInvestor("subtitle")}
        leadIntent={tInvestor("topic")}
        formPrompt={tInvestor("formPrompt")}
        showMessageField
        messageLabel={tInvestor("messageLabel")}
        messagePlaceholder={tInvestor("messagePlaceholder")}
        submitLabel={tInvestor("submitLabel")}
        thankYouTitle={tInvestor("thankYouTitle")}
        thankYouMessage={tInvestor("thankYouMessage")}
        analyticsFormType="investor_inquiry"
        className="inline-flex justify-center px-6 py-3 rounded-lg border border-white/30 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
      >
        {t("company")}
      </OpenLeadModalButton>
    </div>
  );
}
