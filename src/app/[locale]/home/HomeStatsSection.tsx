import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import HomeHeroVideo from "@/app/components/HomeHeroVideo";
import { PERFORMANCE_METHODOLOGY_PATH } from "@/lib/seo/performance-methodology";

const HERO_VIDEO_ID = "y9iRhH2bLwY";

export default async function HomeStatsSection() {
  const t = await getTranslations("Home.stats");
  const tHero = await getTranslations("Home.hero");

  return (
    <section
      className="w-full border-y border-gray-200/80 bg-[#f4f7f9] py-10 md:py-14"
      aria-labelledby="home-field-video-heading"
    >
      <Container>
        <AnimateOnScroll animation="fadeInUp">
          <div className="max-w-3xl mx-auto text-center mb-6 md:mb-8">
            <p className="text-[#5a8f00] text-sm font-medium uppercase tracking-wide mb-2">
              {tHero("videoEyebrow")}
            </p>
            <h2
              id="home-field-video-heading"
              className="text-[#052638] font-semibold text-2xl md:text-3xl leading-snug"
            >
              {tHero("videoHeading")}
            </h2>
          </div>
          <div className="relative mx-auto w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-md ring-1 ring-gray-200/90 bg-white">
            <HomeHeroVideo videoId={HERO_VIDEO_ID} title={tHero("videoTitle")} />
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fadeInUp" delay={120}>
          <p className="mt-8 rounded-xl border border-gray-200/80 bg-white/80 px-4 py-3.5 text-center text-[#5a7a8f] text-xs sm:text-sm max-w-3xl mx-auto leading-relaxed">
            {t("methodologyBefore")}{" "}
            <Link
              href={PERFORMANCE_METHODOLOGY_PATH}
              className="text-[#5a8f00] font-medium underline-offset-2 hover:underline"
            >
              {t("methodologyLink")}
            </Link>{" "}
            {t("methodologyAfter")}
          </p>
        </AnimateOnScroll>
      </Container>
    </section>
  );
}
