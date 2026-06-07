import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import HomeHeroQuoteButton from "./HomeHeroQuoteButton";

/** Server-rendered hero CTAs — only the quote button hydrates (lead modal). */
export default async function HomeHeroCTAs() {
  const t = await getTranslations("Home.hero");

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2">
      <HomeHeroQuoteButton
        label={t("ctaQuote")}
        topic={t("ctaQuoteTopic")}
        title={t("ctaQuoteTitle")}
        subtitle={t("ctaQuoteSubtitle")}
      />
      <Link
        href="/solar-panel-cleaning-system"
        className="inline-flex items-center justify-center min-h-[48px] border-2 border-white/80 text-white font-medium px-7 py-3 rounded-lg hover:bg-white/10 transition text-center"
      >
        {t("ctaExplore")}
      </Link>
      <Link
        href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
        className="inline-flex items-center justify-center min-h-[48px] border border-[#A8C117]/60 text-[#A8C117] font-medium px-6 py-3 rounded-lg hover:bg-[#A8C117]/10 transition text-center"
      >
        {t("ctaService")}
      </Link>
      <Link
        href="/solar-panel-cleaning-robot-price-calculator#calculator"
        className="inline-flex items-center justify-center min-h-[48px] brand-inline-link font-medium px-4 py-3 text-center"
      >
        {t("ctaRoi")}
      </Link>
    </div>
  );
}
