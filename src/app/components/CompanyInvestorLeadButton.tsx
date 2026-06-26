"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import OpenLeadModalButton from "./OpenLeadModalButton";

type CompanyInvestorLeadButtonProps = {
  className?: string;
};

export function CompanyInvestorLeadButton({
  className = "inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors",
}: CompanyInvestorLeadButtonProps) {
  const t = useTranslations("CompanyPage.investors.leadModal");

  return (
    <OpenLeadModalButton
      className={className}
      source="company_investors"
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
      analyticsFormType="investor_inquiry"
    >
      {t("ctaLabel")}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </OpenLeadModalButton>
  );
}
