import { getTranslations } from "next-intl/server";
import { Container } from "@/app/components/Container";
import HomeHeroCTAs from "./HomeHeroCTAs";
import HomeHeroHeadline from "./HomeHeroHeadline";
import HomeHeroSubheadline from "./HomeHeroSubheadline";
import HomeHeroStats from "./HomeHeroStats";
import Image from "next/image";

const COVER_GRADIENT =
  "linear-gradient(to right, rgba(5,38,56,1) 0%, rgba(5,38,56,1) 24%, rgba(5,38,56,0.82) 40%, rgba(5,38,56,0.52) 58%, rgba(5,38,56,0.26) 76%, rgba(5,38,56,0.1) 86%, rgba(5,38,56,0.03) 94%, rgba(5,38,56,0) 100%)";

export default async function HomeHero() {
  const t = await getTranslations("Home.hero");

  return (
    <>
      <section
        id="home-hero"
        className="relative flex min-h-[100dvh] flex-col overflow-hidden px-0 pt-20 sm:px-1 lg:pt-24"
      >
        <div className="absolute inset-0 select-none pointer-events-none" aria-hidden>
          <Image
            src="/tayproasset/cover-solar-hero.webp"
            alt="Autonomous solar panel cleaning robot operating on a utility-scale solar farm in India"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-[72%_100%] origin-bottom-right"
          />
        </div>
        <div className="absolute inset-0" style={{ background: COVER_GRADIENT }} aria-hidden />
        <div className="absolute inset-0 bg-[#052638]/35" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,38,56,0.55)_0%,rgba(5,38,56,0.15)_55%,transparent_100%)]"
          aria-hidden
        />

        <Container
          size="wide"
          className="relative z-10 flex flex-1 w-full !max-w-none flex-col items-center justify-center !px-0 py-8 sm:py-10"
        >
          <div className="w-full max-w-none mx-auto text-center">
            <HomeHeroHeadline
              titleLine1={t("titleLine1")}
              titleLine2={t("titleLine2")}
              titleMobileLines={[
                t("titleMobileLine1"),
                t("titleMobileLine2"),
                t("titleMobileLine3"),
                t("titleMobileLine4"),
              ]}
            />

            <div className="mt-5 w-full max-w-none sm:mt-6">
              <HomeHeroSubheadline
                subtitleLine1={t("subtitleLine1")}
                subtitleLine2={t("subtitleLine2")}
              />
            </div>

            <div className="mt-7 sm:mt-8 flex justify-center">
              <HomeHeroCTAs />
            </div>

            <div className="mt-8 sm:mt-10 w-full px-3 sm:px-4 md:px-6">
              <HomeHeroStats />
            </div>
          </div>
        </Container>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#A8C117]" aria-hidden />
      </section>
    </>
  );
}
