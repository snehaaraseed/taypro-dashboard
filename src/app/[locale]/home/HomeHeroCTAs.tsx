import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

/** Server-rendered hero CTAs — no client JS on the critical path. */
export default async function HomeHeroCTAs() {
  const t = await getTranslations("Home.hero");

  return (
    <div className="flex w-full max-w-lg flex-row items-stretch justify-center gap-2 px-3 pt-2 sm:max-w-none sm:gap-4 sm:px-0">
      <Link
        href="/contact"
        className="inline-flex flex-1 items-center justify-center min-h-[48px] bg-[#A8C117] text-[#052638] font-semibold px-3 py-3 text-sm rounded-lg hover:bg-[#b3cf3d] transition text-center sm:flex-none sm:px-7 sm:text-base"
      >
        {t("ctaQuote")}
      </Link>
      <Link
        href="/solar-panel-cleaning-system"
        className="inline-flex flex-1 items-center justify-center min-h-[48px] border-2 border-white/80 text-white font-medium px-3 py-3 text-sm rounded-lg hover:bg-white/10 transition text-center sm:flex-none sm:px-7 sm:text-base"
      >
        {t("ctaExplore")}
      </Link>
    </div>
  );
}
