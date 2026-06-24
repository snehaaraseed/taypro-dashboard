import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import LazyWhenVisible from "@/app/components/LazyWhenVisible";
import { robotProducts, robotSolutions } from "@/app/data";
import HomePlatformSection from "./HomePlatformSection";
import HomeStatsSection from "./HomeStatsSection";
import HomeRobotLineup, { type HomeLineupRobot } from "./HomeRobotLineup";
import { Container } from "@/app/components/Container";
import {
  VideoObjectSchema,
  ProductSchema,
  FAQPageSchema,
} from "@/app/components/StructuredData";
import DynamicProjectsRollup from "@/app/components/DynamicProjectsRollup";
import HomePageInteractive from "./HomePageInteractive";
import HomeHero from "./HomeHero";
import HomeSeoProse from "./HomeSeoProse";
import HomeFaqServer from "./HomeFaqServer";
import HomeLatestBlogs from "./HomeLatestBlogs";
import { PRODUCT_CATALOG } from "@/lib/products/catalog";
import {
  COMPARISON_PAGES,
  type ComparisonPageId,
} from "@/lib/seo/comparison-pages-config";
import {
  STATE_LANDING_PAGES,
  type StateLandingId,
} from "@/lib/seo/state-landing-config";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const HERO_VIDEO_ID = "y9iRhH2bLwY";

const FEATURE_COUNT = 4;
const OTHER_FEATURE_COUNT = 6;
const FAQ_COUNT = 7;
const HOME_COMPARE_IDS: ComparisonPageId[] = [
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

const DISCOVER_LINK_CLASS =
  "text-[#A8C117] hover:text-[#c5d94a] text-sm md:text-base font-medium underline underline-offset-2 decoration-[#A8C117]/50 hover:decoration-[#c5d94a] transition-colors";

const DISCOVER_MORE_CLASS =
  "inline-block mt-4 text-[#A8C117] hover:text-[#c5d94a] text-sm font-semibold transition-colors";

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
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Home" });
  const tHub = await getTranslations({ locale, namespace: "SolarSystemPage" });

  const features = buildTranslatedFeatures(t, "features", FEATURE_COUNT);
  const otherFeatures = buildTranslatedFeatures(t, "otherFeatures", OTHER_FEATURE_COUNT);
  const homeFaqs = buildHomeFaqs(t);

  const plantTypeToFilter = {
    fixed_tilt: ["fixed_tilt"],
    tracker: ["tracker"],
    distributed: ["distributed"],
  } as const;

  const translatedHardware: HomeLineupRobot[] = robotProducts.map((robot, i) => {
    const productId = "productId" in robot ? robot.productId : undefined;
    const plantType = productId ? PRODUCT_CATALOG[productId].plantType : undefined;
    const filterTags = plantType
      ? [...plantTypeToFilter[plantType as keyof typeof plantTypeToFilter]]
      : [];

    return {
      ...robot,
      marketingName: t(`robots.robot${i}.marketingName`),
      description: t(`robots.robot${i}.description`),
      filterTags,
    };
  });

  const translatedSolutions: HomeLineupRobot[] = robotSolutions.map((robot, i) => {
    const msgIdx = robotProducts.length + i;
    const filterTags =
      robot.model === "Taypro Opex"
        ? (["service"] as const)
        : robot.model === "NECTYR"
          ? (["software"] as const)
          : [];

    return {
      ...robot,
      marketingName: t(`robots.robot${msgIdx}.marketingName`),
      description: t(`robots.robot${msgIdx}.description`),
      filterTags: [...filterTags],
    };
  });

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
        offerPriceKey="home"
        siteUrl={siteUrl}
      />
      <FAQPageSchema faqs={homeFaqs} />

      <div className="min-h-screen overflow-x-hidden">
        <HomeHero />

        <HomeSeoProse />

        <HomeStatsSection />

        <HomePlatformSection />

        <HomeRobotLineup
          hardwareRobots={translatedHardware}
          solutionRobots={translatedSolutions}
        />

        <HomePageInteractive
          features={features}
          otherFeatures={otherFeatures}
        />

        <HomeFaqServer faqs={homeFaqs} />

        <section
          className="py-14 md:py-16 bg-[#052638] border-y border-white/10"
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
                      <Link href={COMPARISON_PAGES[id].path} className={DISCOVER_LINK_CLASS}>
                        {tHub(`compareGuides.${id}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/solar-panel-cleaning-system#compare-guides"
                  className={DISCOVER_MORE_CLASS}
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
                      <Link href={STATE_LANDING_PAGES[id].path} className={DISCOVER_LINK_CLASS}>
                        {tHub(`indianConditions.stateGuides.${id}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/solar-panel-cleaning-system#state-guides" className={DISCOVER_MORE_CLASS}>
                  {t("discover.statesAll")} →
                </Link>
              </AnimateOnScroll>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10">
              <ul className="space-y-2">
                <li>
                  <Link href="/solar-panel-cleaning-machine" className={DISCOVER_LINK_CLASS}>
                    {t("discover.machineLink")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/solar-panel-cleaning-system/miny-compact-rooftop-cleaning-robot"
                    className={DISCOVER_LINK_CLASS}
                  >
                    {t("discover.rooftopLink")}
                  </Link>
                </li>
              </ul>
            </div>
          </Container>
        </section>

        <LazyWhenVisible placeholderClassName="min-h-[520px]">
          <DynamicProjectsRollup
            locale={locale}
            eyebrow={t("projects.eyebrow")}
            heading={t("projects.heading")}
            subheading={t("projects.subheading")}
            quote={t("projects.quote")}
            limit={4}
            background="white"
          />
        </LazyWhenVisible>

        <LazyWhenVisible placeholderClassName="min-h-[400px]">
          <Suspense fallback={null}>
            <HomeLatestBlogs />
          </Suspense>
        </LazyWhenVisible>
      </div>
    </>
  );
}
