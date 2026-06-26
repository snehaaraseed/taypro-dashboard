"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";

export default function HomeHeroCTAs() {
  const t = useTranslations("Home.hero");

  return (
    <div className="flex w-full max-w-lg flex-row items-stretch justify-center gap-2 px-3 pt-2 sm:max-w-none sm:gap-4 sm:px-0">
      <OpenLeadModalButton
        source="home_hero"
        topic={t("ctaQuoteTopic")}
        title={t("ctaQuoteTitle")}
        subtitle={t("ctaQuoteSubtitle")}
        leadIntent={t("ctaQuoteTopic")}
        submitLabel={t("ctaQuote")}
        analyticsFormType="home_hero_quote"
        className="inline-flex flex-1 items-center justify-center min-h-[48px] bg-[#A8C117] text-[#052638] font-semibold px-3 py-3 text-sm rounded-lg hover:bg-[#b3cf3d] transition text-center sm:flex-none sm:px-7 sm:text-base"
      >
        {t("ctaQuote")}
      </OpenLeadModalButton>
      <Link
        href="/solar-panel-cleaning-system"
        className="inline-flex flex-1 items-center justify-center min-h-[48px] border-2 border-white/80 text-white font-medium px-3 py-3 text-sm rounded-lg hover:bg-white/10 transition text-center sm:flex-none sm:px-7 sm:text-base"
      >
        {t("ctaExplore")}
      </Link>
    </div>
  );
}
