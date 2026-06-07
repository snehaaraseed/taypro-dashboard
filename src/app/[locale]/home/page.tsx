import { Suspense } from "react";
import { preload } from "react-dom";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import {
  robotProducts,
  robotSolutions,
  tayproHomeStatsStrip,
} from "@/app/data";
import HomePlatformSection from "./HomePlatformSection";
import { RobotCard } from "@/app/components/RobotCard";
import { Container } from "@/app/components/Container";
import {
  VideoObjectSchema,
  ProductSchema,
  FAQPageSchema,
} from "@/app/components/StructuredData";
import DynamicProjectsRollup from "@/app/components/DynamicProjectsRollup";
import HomePageInteractive from "./HomePageInteractive";
import HomeHeroCTAs from "./HomeHeroCTAs";
import HomeHeroVideo from "@/app/components/HomeHeroVideo";
import HomeLatestBlogs from "./HomeLatestBlogs";
import {
  HARDWARE_ROBOTS_GRID_HOME,
  hardwareRobotsGridItemClass,
} from "@/lib/products/robot-grid-layout";
import {
  COMPARISON_PAGES,
  type ComparisonPageId,
} from "@/lib/seo/comparison-pages-config";
import {
  STATE_LANDING_PAGES,
  type StateLandingId,
} from "@/lib/seo/state-landing-config";
import { PERFORMANCE_METHODOLOGY_PATH } from "@/lib/seo/performance-methodology";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const HERO_VIDEO_ID = "y9iRhH2bLwY";
const HERO_POSTER = "/tayproasset/taypro-robotFeature.jpg";

const FEATURE_COUNT = 4;
const OTHER_FEATURE_COUNT = 4;
const FAQ_COUNT = 7;
const STAT_COUNT = 4;

const HOME_COMPARE_IDS: ComparisonPageId[] = [
  "tayproVsSolabot",
  "indianCompetitors",
  "robotVsManual",
  "waterlessVsWater",
];

const HOME_STATE_IDS: StateLandingId[] = [
  "rajasthan",
  "gujarat",
  "karnataka",
  "maharashtra",
];

function buildTranslatedFeatures(
  t: Awaited<ReturnType<typeof getTranslations>>,
  prefix: "features" | "otherFeatures",
  count: number
) {
  return Array.from({ length: count }, (_, i) => ({
    title: t(`${prefix}.feature${i}.title`),
    description: t(`${prefix}.feature${i}.description`),
  }));
}

function buildHomeFaqs(t: Awaited<ReturnType<typeof getTranslations>>) {
  const faqs = Array.from({ length: FAQ_COUNT }, (_, i) => {
    if (i === 1) {
      return {
        question: t("faq.q1"),
        answer: `${t("faq.a1Before")} ${t("faq.a1Link")}${t("faq.a1After")}`,
      };
    }
    return {
      question: t(`faq.q${i}`),
      answer: t(`faq.a${i}`),
    };
  });
  return faqs;
}

export default async function HomePage() {
  preload(HERO_POSTER, { as: "image", fetchPriority: "high" });

  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Home" });
  const tHub = await getTranslations({ locale, namespace: "SolarSystemPage" });

  const features = buildTranslatedFeatures(t, "features", FEATURE_COUNT);
  const otherFeatures = buildTranslatedFeatures(t, "otherFeatures", OTHER_FEATURE_COUNT);
  const homeFaqs = buildHomeFaqs(t);

  const translatedHardware = robotProducts.map((robot, i) => ({
    ...robot,
    marketingName: t(`robots.robot${i}.marketingName`),
    description: t(`robots.robot${i}.description`),
  }));

  const translatedSolutions = robotSolutions.map((robot, i) => {
    const msgIdx = robotProducts.length + i;
    return {
      ...robot,
      marketingName: t(`robots.robot${msgIdx}.marketingName`),
      description: t(`robots.robot${msgIdx}.description`),
    };
  });

  const stats = tayproHomeStatsStrip.map((stat, i) => ({
    value: stat.value,
    label: t(`stats.stat${i}.label`),
  }));

  const videoTitle = t("hero.videoTitle");

  return (
    <>
      <VideoObjectSchema
        name={t("schema.video.name")}
        description={t("schema.video.description")}
        thumbnailUrl={`https://img.youtube.com/vi/${HERO_VIDEO_ID}/maxresdefault.jpg`}
        uploadDate="2024-01-01"
        embedUrl={`https://www.youtube.com/embed/${HERO_VIDEO_ID}`}
        contentUrl={`https://www.youtube.com/watch?v=${HERO_VIDEO_ID}`}
      />
      <ProductSchema
        name={t("schema.product.name")}
        description={t("schema.product.description")}
        image={`${siteUrl}/tayproasset/taypro-robotImage.png`}
        brand={t("schema.product.brand")}
        sku="SOLAR-PANEL-CLEANING-ROBOT"
        offers={{
          price: t("schema.product.offersPrice"),
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        }}
        siteUrl={siteUrl}
      />
      <FAQPageSchema faqs={homeFaqs} />

      <div className="min-h-screen overflow-x-hidden">
        <section className="relative px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <Container className="!px-0">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              <AnimateOnScroll
                animation="fadeInLeft"
                eager
                className="order-1 lg:order-none flex justify-center lg:justify-end lg:col-start-2 lg:row-start-1"
              >
                <div className="relative w-full max-w-[720px] aspect-video rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10">
                  <HomeHeroVideo videoId={HERO_VIDEO_ID} title={videoTitle} />
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll
                animation="fadeInRight"
                eager
                className="order-2 lg:order-none text-white space-y-5 lg:space-y-6 lg:col-start-1 lg:row-start-1"
              >
                <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide">
                  {t("hero.eyebrow")}
                </p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
                  {t("hero.title")}
                </h1>
                <p className="text-base sm:text-lg text-[#A8C117]/90 leading-relaxed max-w-xl font-medium">
                  {t("hero.subtitle")}
                </p>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-xl">
                  {t("hero.lead")}
                </p>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xl">
                  {t("hero.bodyBeforeProjects")}{" "}
                  <Link
                    href="/projects"
                    className="text-[#A8C117] font-medium hover:underline"
                  >
                    {t("hero.bodyProjectsLink")}
                  </Link>
                  {t("hero.bodyAfterProjects")}{" "}
                  <Link
                    href="/utility-scale-solar-operations"
                    className="text-[#A8C117] font-medium hover:underline"
                  >
                    {t("hero.bodyUtilityOpsLink")}
                  </Link>
                  {t("hero.bodyBeforeBlog")}{" "}
                  <Link href="/blog" className="text-[#A8C117] font-medium hover:underline">
                    {t("hero.bodyBlogLink")}
                  </Link>
                  {t("hero.bodyAfterBlog")}
                </p>
                <HomeHeroCTAs />
              </AnimateOnScroll>
            </div>
          </Container>
        </section>

        <section className="w-full py-10 md:py-12 bg-[#0a3a4a] border-y border-white/10">
          <Container>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 text-center">
              {stats.map((stat, idx) => (
                <AnimateOnScroll
                  key={stat.label}
                  animation="fadeInUp"
                  delay={idx * 80}
                  className="px-2"
                >
                  <p className="text-[#A8C117] font-semibold text-2xl sm:text-3xl md:text-4xl mb-1">
                    {stat.value}
                  </p>
                  <p className="text-white/80 text-xs sm:text-sm">{stat.label}</p>
                </AnimateOnScroll>
              ))}
            </div>
            <p className="mt-8 text-center text-white/60 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              {t("stats.methodologyBefore")}{" "}
              <Link
                href={PERFORMANCE_METHODOLOGY_PATH}
                className="text-[#A8C117] hover:underline"
              >
                {t("stats.methodologyLink")}
              </Link>{" "}
              {t("stats.methodologyAfter")}
            </p>
          </Container>
        </section>

        <HomePlatformSection />

        <section
          className="py-14 md:py-20 bg-white"
          aria-labelledby="robots-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center max-w-3xl mx-auto mb-8">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("robots.eyebrow")}
              </p>
              <h2
                id="robots-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3"
              >
                {t("robots.heading")}
              </h2>
              <p className="text-[#27415c] text-base md:text-lg leading-relaxed">
                {t("robots.subheadingBefore")}{" "}
                <Link
                  href="/solar-panel-cleaning-system"
                  className="text-[#5a8f00] font-medium hover:underline"
                >
                  {t("robots.compareLink")}
                </Link>
                {t("robots.subheadingAfter")}
              </p>
            </AnimateOnScroll>

            <div className="space-y-12">
              <div>
                <p className="text-[#5a7a8f] font-medium text-xs uppercase tracking-wider mb-5 text-center">
                  {t("robots.waterlessEyebrow")}
                </p>
                <div className={HARDWARE_ROBOTS_GRID_HOME}>
                  {translatedHardware.map((robot, idx) => (
                    <AnimateOnScroll
                      key={robot.model}
                      animation="fadeInUp"
                      delay={idx * 70}
                      className={hardwareRobotsGridItemClass(idx, "home")}
                    >
                      <RobotCard
                        robot={robot}
                        priority={idx === 0}
                        preferGenericTitle
                      />
                    </AnimateOnScroll>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[#5a7a8f] font-medium text-xs uppercase tracking-wider mb-5 text-center">
                  {t("robots.serviceEyebrow")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 items-stretch lg:grid-cols-6">
                  {translatedSolutions.map((robot, idx) => (
                    <AnimateOnScroll
                      key={robot.model}
                      animation="fadeInUp"
                      delay={idx * 70}
                      className={`h-full lg:col-span-2 ${
                        idx === 0 ? "lg:col-start-2" : "lg:col-start-4"
                      }`}
                    >
                      <RobotCard robot={robot} preferGenericTitle />
                    </AnimateOnScroll>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <HomePageInteractive
          features={features}
          otherFeatures={otherFeatures}
          homeFaqs={homeFaqs}
        />

        <section
          className="py-14 md:py-16 bg-[#0a3a4a] border-y border-white/10"
          aria-labelledby="discover-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("discover.eyebrow")}
              </p>
              <h2
                id="discover-heading"
                className="text-white font-semibold text-2xl md:text-3xl mb-3"
              >
                {t("discover.heading")}
              </h2>
              <p className="text-gray-300 text-base leading-relaxed">
                {t("discover.intro")}
              </p>
            </AnimateOnScroll>

            <div className="grid md:grid-cols-2 gap-10">
              <AnimateOnScroll animation="fadeInUp" delay={80}>
                <h3 className="text-white font-medium text-lg mb-4">
                  {t("discover.compareHeading")}
                </h3>
                <ul className="space-y-2">
                  {HOME_COMPARE_IDS.map((id) => (
                    <li key={id}>
                      <Link
                        href={COMPARISON_PAGES[id].path}
                        className="text-[#A8C117] hover:underline text-sm md:text-base"
                      >
                        {tHub(`compareGuides.${id}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/solar-panel-cleaning-system#compare-guides"
                  className="inline-block mt-4 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {t("discover.compareAll")} →
                </Link>
              </AnimateOnScroll>

              <AnimateOnScroll animation="fadeInUp" delay={120}>
                <h3 className="text-white font-medium text-lg mb-4">
                  {t("discover.statesHeading")}
                </h3>
                <ul className="space-y-2">
                  {HOME_STATE_IDS.map((id) => (
                    <li key={id}>
                      <Link
                        href={STATE_LANDING_PAGES[id].path}
                        className="text-[#A8C117] hover:underline text-sm md:text-base"
                      >
                        {tHub(`indianConditions.stateGuides.${id}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/solar-panel-cleaning-system#state-guides"
                  className="inline-block mt-4 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {t("discover.statesAll")} →
                </Link>
              </AnimateOnScroll>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/solar-panel-cleaning-machine"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("discover.machineLink")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/solar-panel-cleaning-system/miny-compact-rooftop-cleaning-robot"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("discover.rooftopLink")}
                  </Link>
                </li>
              </ul>
            </div>
          </Container>
        </section>

        <DynamicProjectsRollup
          locale={locale}
          eyebrow={t("projects.eyebrow")}
          heading={t("projects.heading")}
          subheading={t("projects.subheading")}
          quote={t("projects.quote")}
          limit={4}
          background="white"
        />

        <Suspense fallback={null}>
          <HomeLatestBlogs />
        </Suspense>
      </div>
    </>
  );
}
