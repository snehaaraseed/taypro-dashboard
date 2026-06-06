import Image from "next/image";
import {
  BadgeCheck,
  BatteryCharging,
  Check,
  ChevronRight,
  Cog,
  Droplets,
  Factory,
  Gauge,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  Sparkles,
  Sun,
  Wrench,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import CallbackCard from "@/app/components/CallbackCard";
import ClientsCard from "@/app/components/ClientsCard";
import ModuleManufacturerTrust from "@/app/components/ModuleManufacturerTrust";
import { RobotCard } from "@/app/components/RobotCard";
import {
  comingSoonRobotProducts,
  fleetAccessoryProducts,
  robotProducts,
  robotSolutions,
} from "@/app/data";
import { ComingSoonRobotCard } from "@/app/components/ComingSoonRobotCard";
import { COMPARISON_PAGE_LIST } from "@/lib/seo/comparison-pages-config";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import ROICalculatorEmbed from "@/app/components/ROICalculatorEmbed";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import {
  HARDWARE_ROBOTS_GRID_SOLAR,
  hardwareRobotsGridItemClass,
} from "@/lib/products/robot-grid-layout";
import { FaqSection } from "@/app/components/FaqSection";
import DynamicProjectsRollup from "@/app/components/DynamicProjectsRollup";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";
import {
  CollectionPageSchema,
  FAQPageSchema,
  ItemListSchema,
  VideoObjectSchema,
} from "@/app/components/StructuredData";
import YouTubeEmbed from "@/app/components/YouTubeEmbed";
import { Link } from "@/i18n/navigation";
import { PRODUCT_CATALOG, type ProductId } from "@/lib/products/catalog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const HUB_PRODUCT_VIDEO_ID = "y9iRhH2bLwY";

const BRUSH_COMPARE_BRUSH_KEYS = ["0", "1", "2", "3"] as const;
const BRUSH_COMPARE_ROBOT_KEYS = ["0", "1", "2", "3"] as const;

type SchemaItemKey =
  | "helyx"
  | "glyde"
  | "nyuma"
  | "glydeX"
  | "nyumaX"
  | "tayproOpex"
  | "tayproConsole"
  | "miny"
  | "cradyl"
  | "orion";

const COMPARISON_PRODUCT_KEYS = [
  "glyde",
  "glydeX",
  "nyuma",
  "nyumaX",
  "helyx",
] as const satisfies readonly ProductId[];

function productToSchemaKey(model: string): SchemaItemKey {
  const byName: Record<string, SchemaItemKey> = {
    HELYX: "helyx",
    GLYDE: "glyde",
    NYUMA: "nyuma",
    "GLYDE-X": "glydeX",
    "NYUMA-X": "nyumaX",
    "Taypro Opex": "tayproOpex",
    "NECTYR": "tayproConsole",
    MINY: "miny",
    CRADYL: "cradyl",
    ORION: "orion",
  };
  const key = byName[model];
  if (!key) {
    throw new Error(`Unknown robot model for schema i18n key: ${model}`);
  }
  return key;
}

const DECISION_GUIDE = [
  {
    icon: Sun,
    cardKey: "card0" as const,
    href: PRODUCT_CATALOG.glyde.href,
  },
  {
    icon: Cog,
    cardKey: "card1" as const,
    href: PRODUCT_CATALOG.glydeX.href,
  },
  {
    icon: Gauge,
    cardKey: "card2" as const,
    href: PRODUCT_CATALOG.nyuma.href,
  },
  {
    icon: Sparkles,
    cardKey: "card3" as const,
    href: PRODUCT_CATALOG.nyumaX.href,
  },
  {
    icon: Factory,
    cardKey: "card4" as const,
    href: PRODUCT_CATALOG.helyx.href,
  },
  {
    icon: BatteryCharging,
    cardKey: "card5" as const,
    href: "/solar-panel-cleaning-system/solar-panel-cleaning-service",
  },
] as const;

const INDIAN_CONDITIONS_ICONS: LucideIcon[] = [
  Droplets,
  Sun,
  Gauge,
  LifeBuoy,
];

const WHY_TAYPRO_ICONS: LucideIcon[] = [
  Factory,
  BadgeCheck,
  MapPin,
  Wrench,
];

const COMPARISON_ROW_KEYS = [
  "row0",
  "row1",
  "row2",
  "row3",
  "row4",
  "row5",
] as const;

const MARKET_COMPARISON_ROW_KEYS = [
  "row0",
  "row1",
  "row2",
  "row3",
  "row4",
] as const;

const MARKET_COMPARISON_COL_KEYS = [
  "manualWet",
  "importDry",
  "taypro",
] as const;

const FEATURED_CASE_STUDIES = [
  { slug: "agar-solar-project", cardKey: "agar" },
  { slug: "banda-solar-project", cardKey: "banda" },
  { slug: "yadgir-solar-project-50-mw", cardKey: "yadgir" },
  { slug: "bachau-dvc-gujrat-300-mw", cardKey: "bachau" },
] as const;

const HUB_QUICK_LINKS = [
  { key: "glyde", href: PRODUCT_CATALOG.glyde.href },
  { key: "glydeX", href: PRODUCT_CATALOG.glydeX.href },
  { key: "nyuma", href: PRODUCT_CATALOG.nyuma.href },
  { key: "nyumaX", href: PRODUCT_CATALOG.nyumaX.href },
  { key: "helyx", href: PRODUCT_CATALOG.helyx.href },
  {
    key: "opex",
    href: "/solar-panel-cleaning-system/solar-panel-cleaning-service",
  },
  {
    key: "nectyr",
    href: "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
  },
  { key: "technology", href: "/cleaning-technology" },
  {
    key: "calculator",
    href: "/solar-panel-cleaning-robot-price-calculator#calculator",
  },
  { key: "projects", href: "/projects" },
] as const;

const COMMERCIAL_MODEL_LINKS = [
  "/solar-panel-cleaning-system",
  "/contact",
  "/solar-panel-cleaning-system/solar-panel-cleaning-service",
  "/solar-panel-cleaning-system/solar-panel-cleaning-service",
  "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
] as const;

export default async function SolarPanelCleaningRobot({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SolarSystemPage" });

  const connectivitySummary = t("shared.connectivitySummary");
  const panIndiaCardBody = t("shared.panIndiaServiceCardBody");

  const breadcrumbs = [
    { name: t("breadcrumbs.home"), href: "/" },
    { name: t("breadcrumbs.solarPanelCleaningRobots"), href: "" },
  ];

  const marketComparisonRows = MARKET_COMPARISON_ROW_KEYS.map((rowKey) => {
    const prefix = `marketComparison.rows.${rowKey}` as const;
    const cells = Object.fromEntries(
      MARKET_COMPARISON_COL_KEYS.map((col) => [col, t(`${prefix}.${col}`)])
    ) as Record<(typeof MARKET_COMPARISON_COL_KEYS)[number], string>;
    return {
      criterion: t(`${prefix}.criterion`),
      ...cells,
    };
  });

  const tayproFitBullets = [0, 1, 2, 3].map((i) =>
    t(`marketComparison.tayproFit${i}`)
  );

  const comparisonRows = COMPARISON_ROW_KEYS.map((rowKey) => {
    const prefix = `comparison.rows.${rowKey}` as const;
    const cells = Object.fromEntries(
      COMPARISON_PRODUCT_KEYS.map((pk) => {
        if (rowKey === "row5" && (pk === "glyde" || pk === "glydeX" || pk === "nyuma" || pk === "nyumaX")) {
          return [pk, connectivitySummary];
        }
        return [pk, t(`${prefix}.${pk}`)];
      })
    ) as Record<(typeof COMPARISON_PRODUCT_KEYS)[number], string>;
    return {
      criterion: t(`${prefix}.criterion`),
      ...cells,
    };
  });

  const indianConditions = [0, 1, 2, 3].map((i) => {
    const icon = INDIAN_CONDITIONS_ICONS[i]!;
    const body =
      i === 3
        ? panIndiaCardBody
        : t(`indianConditions.cards.card${i}.body`);
    return {
      icon,
      title: t(`indianConditions.cards.card${i}.title`),
      body,
    };
  });

  const whyTaypro = [0, 1, 2, 3].map((i) => {
    const icon = WHY_TAYPRO_ICONS[i]!;
    const body =
      i === 3
        ? panIndiaCardBody
        : t(`whyTaypro.items.item${i}.body`);
    return {
      icon,
      title: t(`whyTaypro.items.item${i}.title`),
      body,
    };
  });

  /** Supplier FAQ (item10) placed after “best robot” (item1) for commercial-intent coverage. */
  const hubFaqOrder = [0, 1, 10, 2, 3, 4, 5, 6, 7, 8, 9] as const;
  const hubFaqs = hubFaqOrder.map((i) => ({
    question: t(`faq.items.item${i}.question`),
    answer: t(`faq.items.item${i}.answer`),
  }));

  const heroStats = [0, 1, 2, 3].map((i) => ({
    value: t(`heroStats.stat${i}.value`),
    label: t(`heroStats.stat${i}.label`),
  }));

  const robotFeatureRows = [0, 1, 2, 3, 4, 5].map((i) => ({
    title: t(`robotFeatures.feature${i}.title`),
    description: t(`robotFeatures.feature${i}.description`),
  }));

  const robotsAdvantagesRows = [0, 1, 2, 3, 4].map((i) => ({
    title: t(`robotsAdvantages.advantage${i}.title`),
    description: t(`robotsAdvantages.advantage${i}.description`),
  }));

  const toDoFeatureRows = [0, 1, 2, 3, 4].map((i) =>
    t(`toDoFeatures.item${i}.title`)
  );

  const allProductsForSchema = [
    ...robotProducts,
    ...robotSolutions,
    ...fleetAccessoryProducts,
    ...comingSoonRobotProducts,
  ] as const;

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />
      <CollectionPageSchema
        name={t("schema.collectionPage.name")}
        description={t("schema.collectionPage.description")}
        url={`${siteUrl}/solar-panel-cleaning-system`}
      />
      <ItemListSchema
        name={t("schema.itemList.name")}
        description={t("schema.itemList.description")}
        items={allProductsForSchema.map((r) => {
          const key = productToSchemaKey(r.model);
          return {
            name: `${r.model}${t("schema.itemList.itemNameSuffix")}`,
            url: r.href,
            description: t(`schema.itemList.items.${key}.description`),
            image: r.imgPath,
          };
        })}
      />
      <FAQPageSchema faqs={hubFaqs} />

      <div className="min-h-screen overflow-x-hidden">
        {/* HERO */}
        <section className="bg-white">
          <Container className="py-10 sm:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-stretch">
              <AnimateOnScroll
                animation="fadeInLeft"
                eager
                className="bg-[#052638] text-white px-6 sm:px-10 py-10 sm:py-14 flex flex-col justify-center rounded-lg"
              >
                <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                  {t("hero.eyebrow")}
                </div>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-5">
                  {t("hero.title")}
                </h1>
                <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-7 max-w-2xl">
                  {t("hero.leadHtmlSegments.beforeBold1")}
                  <strong>{t("hero.leadHtmlSegments.bold1")}</strong>
                  {t("hero.leadHtmlSegments.afterBold1")}
                  <strong>{t("hero.leadHtmlSegments.bold2")}</strong>
                  {t("hero.leadHtmlSegments.afterBold2")}
                  <strong>{t("hero.leadHtmlSegments.bold3")}</strong>
                  {t("hero.leadHtmlSegments.afterBold3")}
                  <strong>{t("hero.leadHtmlSegments.bold4")}</strong>
                  {t("hero.leadHtmlSegments.afterBold4")}
                  <Link
                    href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                    className="text-[#A8C117] hover:underline font-medium"
                  >
                    {t("hero.payPerPanelServiceLinkText")}
                  </Link>
                  {t("hero.leadAfterLink")}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <OpenLeadModalButton
                    topic={t("hero.primaryCta.topic")}
                    title={t("hero.primaryCta.title")}
                    subtitle={t("hero.primaryCta.subtitle")}
                    className="inline-flex items-center justify-center min-h-[48px] sm:min-w-[200px] bg-[#A8C117] text-[#052638] font-medium px-7 py-3.5 rounded-md hover:bg-[#b3cf3d] transition"
                  >
                    {t("hero.primaryCta.label")}
                  </OpenLeadModalButton>
                  <Link
                    href="/solar-panel-cleaning-robot-price-calculator#calculator"
                    className="inline-flex items-center justify-center min-h-[48px] sm:min-w-[200px] border-2 border-white/70 text-white font-medium px-7 py-3.5 rounded-md hover:bg-white/10 transition"
                  >
                    {t("hero.secondaryCta")}
                  </Link>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll
                animation="fadeInRight"
                eager
                className="relative min-h-[280px] sm:min-h-[360px] lg:min-h-[480px]"
              >
                <Image
                  src="/tayproasset/taypro-robotImage.png"
                  alt={t("hero.heroImageAlt")}
                  title={t("hero.heroImageTitle")}
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                />
              </AnimateOnScroll>
            </div>

            <div className="mt-8 sm:mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#f4f1e9] rounded-lg px-4 py-4 text-center"
                >
                  <div className="text-[#052638] font-semibold text-xl sm:text-2xl">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-xs sm:text-sm mt-1 leading-snug">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-white pt-2 pb-12 sm:pb-16">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("intro.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight mb-6">
                {t("intro.title")}
              </h2>
              <div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                <p>{t("intro.p1")}</p>
                <p>
                  {t("intro.p2BeforeLinks")}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("intro.p2LinkAutomatic")}
                  </Link>
                  {t("intro.p2BetweenGlydeNyuma")}
                  <Link
                    href="/solar-panel-cleaning-system/nyuma-automatic-cleaning-robot"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("intro.p2LinkNyuma")}
                  </Link>
                  {t("intro.p2BetweenNyumaHelyx")}
                  <Link
                    href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("intro.p2LinkModelB")}
                  </Link>
                  {t("intro.p2BetweenHelyxTracker")}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("intro.p2LinkModelT")}
                  </Link>
                  {t("intro.p2BetweenTrackers")}
                  <Link
                    href="/solar-panel-cleaning-system/nyuma-x-single-axis-tracker-cleaning-robot"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("intro.p2LinkNyumaX")}
                  </Link>
                  {t("intro.p2AfterTrackers")}
                  <Link
                    href="/cleaning-technology"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("intro.p2LinkTechnology")}
                  </Link>
                  {t("intro.p2BeforeConsole")}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("intro.p2LinkConsole")}
                  </Link>
                  {t("intro.p2AfterConsole")}
                  <Link
                    href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("intro.p2LinkOpex")}
                  </Link>
                  {t("intro.p2AfterOpex")}
                </p>
                <p>
                  {t("intro.p3Prefix")}
                  <Link
                    href="/blog/the-complete-guide-to-solar-panel-maintenance"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("intro.p3BlogMaintenance")}
                  </Link>
                  {t("intro.p3Between")}
                  <Link
                    href="/blog/what-is-a-solar-panel-cleaning-robot"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("intro.p3BlogRobotDef")}
                  </Link>
                  {t("intro.p3Suffix")}
                </p>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <section className="bg-[#f4f7f9] py-12 sm:py-14 border-y border-gray-100">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("hubQuickLinks.eyebrow")}
              </p>
              <h2 className="text-[#052638] font-semibold text-2xl sm:text-3xl">
                {t("hubQuickLinks.title")}
              </h2>
              <p className="text-gray-600 text-base max-w-2xl mx-auto mt-3">
                {t("hubQuickLinks.subtitle")}
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 max-w-6xl mx-auto">
              {HUB_QUICK_LINKS.map((item, idx) => (
                <AnimateOnScroll key={item.key} animation="fadeInUp" delay={idx * 40}>
                  <Link
                    href={item.href}
                    className="block h-full rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-[#A8C117]/60 hover:shadow-sm transition"
                  >
                    <span className="text-[#052638] font-semibold text-sm block">
                      {t(`hubQuickLinks.links.${item.key}.label`)}
                    </span>
                    <span className="text-gray-600 text-xs mt-1 block leading-snug">
                      {t(`hubQuickLinks.links.${item.key}.description`)}
                    </span>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        <section className="pt-4 pb-16 sm:pb-20 bg-white">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("productGrid.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("productGrid.title")}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-5">
                {t("productGrid.subtitle")}
              </p>
            </AnimateOnScroll>

            <div className={`${HARDWARE_ROBOTS_GRID_SOLAR} justify-items-center`}>
              {robotProducts.map((robot, idx) => {
                const schemaKey = productToSchemaKey(robot.model);
                const highlightPrefix = `productGrid.robotHighlights.${schemaKey}`;
                const bullets = [
                  t(`${highlightPrefix}.bullet0`),
                  t(`${highlightPrefix}.bullet1`),
                  t(`${highlightPrefix}.bullet2`),
                ];
                return (
                  <AnimateOnScroll
                    key={robot.model}
                    animation="scaleIn"
                    delay={idx * 100}
                    className={`${hardwareRobotsGridItemClass(idx, "solar")} flex justify-center`}
                  >
                    <div className="flex flex-col w-80 max-w-full">
                      <RobotCard
                        robot={{
                          ...robot,
                          description: t(
                            `schema.itemList.items.${schemaKey}.description`
                          ),
                        }}
                        priority={idx === 0}
                        preferGenericTitle
                      />
                      <div className="bg-white border border-gray-200 border-t-0 rounded-b-md px-5 pt-4 pb-5 -mt-1">
                        <div className="text-[#A8C117] text-xs font-semibold uppercase tracking-wide mb-2">
                          {t(`${highlightPrefix}.eyebrow`)}
                        </div>
                        <ul className="space-y-1.5">
                          {bullets.map((b) => (
                            <li
                              key={b}
                              className="flex items-start gap-2 text-gray-700 text-sm leading-snug"
                            >
                              <Check className="w-4 h-4 text-[#A8C117] mt-0.5 shrink-0" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AnimateOnScroll>
                );
              })}
            </div>

            <div className="mt-16">
              <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
                <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                  {t("productGrid.solutionsEyebrow")}
                </div>
                <h2 className="text-[#052638] font-semibold text-2xl sm:text-3xl md:text-4xl leading-tight">
                  {t("productGrid.solutionsTitle")}
                </h2>
              </AnimateOnScroll>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 justify-items-center">
                {robotSolutions.map((robot, idx) => {
                  const schemaKey = productToSchemaKey(robot.model);
                  const highlightPrefix = `productGrid.solutionHighlights.${schemaKey}`;
                  const bullets = [
                    t(`${highlightPrefix}.bullet0`),
                    t(`${highlightPrefix}.bullet1`),
                    t(`${highlightPrefix}.bullet2`),
                  ];
                  return (
                    <AnimateOnScroll
                      key={robot.model}
                      animation="scaleIn"
                      delay={idx * 100}
                      className="w-full flex justify-center"
                    >
                      <div className="flex flex-col w-80 max-w-full">
                        <RobotCard
                          robot={{
                            ...robot,
                            description: t(
                              `schema.itemList.items.${schemaKey}.description`
                            ),
                          }}
                          preferGenericTitle
                        />
                        <div className="bg-white border border-gray-200 border-t-0 rounded-b-md px-5 pt-4 pb-5 -mt-1">
                          <div className="text-[#A8C117] text-xs font-semibold uppercase tracking-wide mb-2">
                            {t(`${highlightPrefix}.eyebrow`)}
                          </div>
                          <ul className="space-y-1.5">
                            {bullets.map((b) => (
                              <li
                                key={b}
                                className="flex items-start gap-2 text-gray-700 text-sm leading-snug"
                              >
                                <Check className="w-4 h-4 text-[#A8C117] mt-0.5 shrink-0" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AnimateOnScroll>
                  );
                })}
              </div>
            </div>

            <div className="mt-20 pt-16 border-t border-gray-200">
              <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
                <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                  {t("productGrid.accessoryEyebrow")}
                </div>
                <h2 className="text-[#052638] font-semibold text-2xl sm:text-3xl md:text-4xl leading-tight">
                  {t("productGrid.accessoryTitle")}
                </h2>
                <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-5">
                  {t("productGrid.accessorySubtitle")}
                </p>
              </AnimateOnScroll>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 justify-items-center max-w-3xl mx-auto">
                {fleetAccessoryProducts.map((robot, idx) => {
                  const schemaKey = productToSchemaKey(robot.model);
                  const highlightPrefix = `productGrid.accessoryHighlights.${schemaKey}`;
                  const bullets = [
                    t(`${highlightPrefix}.bullet0`),
                    t(`${highlightPrefix}.bullet1`),
                    t(`${highlightPrefix}.bullet2`),
                  ];
                  return (
                    <AnimateOnScroll
                      key={robot.model}
                      animation="scaleIn"
                      delay={idx * 100}
                      className="w-full flex justify-center"
                    >
                      <div className="flex flex-col w-80 max-w-full">
                        <RobotCard
                          robot={{
                            ...robot,
                            description: t(
                              `schema.itemList.items.${schemaKey}.description`
                            ),
                          }}
                          preferGenericTitle
                        />
                        <div className="bg-white border border-gray-200 border-t-0 rounded-b-md px-5 pt-4 pb-5 -mt-1">
                          <div className="text-[#A8C117] text-xs font-semibold uppercase tracking-wide mb-2">
                            {t(`${highlightPrefix}.eyebrow`)}
                          </div>
                          <ul className="space-y-1.5">
                            {bullets.map((b) => (
                              <li
                                key={b}
                                className="flex items-start gap-2 text-gray-700 text-sm leading-snug"
                              >
                                <Check className="w-4 h-4 text-[#A8C117] mt-0.5 shrink-0" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AnimateOnScroll>
                  );
                })}
              </div>
            </div>

            <div className="mt-20 pt-16 border-t border-gray-200">
              <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
                <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                  {t("productGrid.comingSoonEyebrow")}
                </div>
                <h2 className="text-[#052638] font-semibold text-2xl sm:text-3xl md:text-4xl leading-tight">
                  {t("productGrid.comingSoonTitle")}
                </h2>
                <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-5">
                  {t("productGrid.comingSoonSubtitle")}
                </p>
              </AnimateOnScroll>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center max-w-5xl mx-auto">
                {comingSoonRobotProducts.map((robot, idx) => {
                  const schemaKey = productToSchemaKey(robot.model);
                  const highlightPrefix = `productGrid.comingSoonHighlights.${schemaKey}`;
                  const bullets = [
                    t(`${highlightPrefix}.bullet0`),
                    t(`${highlightPrefix}.bullet1`),
                    t(`${highlightPrefix}.bullet2`),
                  ];
                  return (
                    <AnimateOnScroll
                      key={robot.model}
                      animation="scaleIn"
                      delay={idx * 100}
                      className="w-full flex justify-center"
                    >
                      <div className="flex flex-col w-80 max-w-full">
                        <ComingSoonRobotCard
                          robot={{
                            ...robot,
                            description: t(
                              `schema.itemList.items.${schemaKey}.description`
                            ),
                            comingSoonLabel: t("productGrid.comingSoonBadge"),
                            ctaLabel: t("productGrid.comingSoonCta"),
                          }}
                        />
                        <div className="bg-white border border-gray-200 border-t-0 rounded-b-md px-5 pt-4 pb-5 -mt-1">
                          <div className="text-[#A8C117] text-xs font-semibold uppercase tracking-wide mb-2">
                            {t(`${highlightPrefix}.eyebrow`)}
                          </div>
                          <ul className="space-y-1.5">
                            {bullets.map((b) => (
                              <li
                                key={b}
                                className="flex items-start gap-2 text-gray-700 text-sm leading-snug"
                              >
                                <Check className="w-4 h-4 text-[#A8C117] mt-0.5 shrink-0" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AnimateOnScroll>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-[#f4f1e9] py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("decisionGuide.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("decisionGuide.title")}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-5">
                {t("decisionGuide.subtitle")}
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {DECISION_GUIDE.map((item) => {
                const Icon = item.icon;
                const cardPath = `decisionGuide.cards.${item.cardKey}`;
                return (
                  <AnimateOnScroll
                    key={item.cardKey}
                    animation="fadeInUp"
                    className="bg-white p-6 rounded-lg shadow-sm flex flex-col h-full"
                  >
                    <div className="w-11 h-11 flex items-center justify-center bg-[#A8C117]/15 rounded-md mb-4">
                      <Icon className="w-6 h-6 text-[#A8C117]" />
                    </div>
                    <h3 className="text-[#052638] font-semibold text-lg mb-2">
                      {t(`${cardPath}.title`)}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed flex-1">
                      {t(`${cardPath}.body`)}
                    </p>
                    <Link
                      href={item.href}
                      className="mt-4 inline-flex items-center gap-1 text-[#A8C117] font-medium text-sm hover:underline"
                    >
                      {t(`${cardPath}.cta`)}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("comparison.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("comparison.title")}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-5">
                {t("comparison.subtitle")}
              </p>
            </AnimateOnScroll>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left min-w-[960px]">
                <thead className="bg-[#052638] text-white">
                  <tr>
                    <th className="py-4 px-4 text-sm sm:text-base font-semibold">
                      {t("comparison.tableHeaders.criteria")}
                    </th>
                    {COMPARISON_PRODUCT_KEYS.map((pk) => (
                      <th
                        key={pk}
                        className="py-4 px-4 text-sm sm:text-base font-semibold"
                      >
                        {t(`comparison.tableHeaders.${pk}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, idx) => (
                    <tr
                      key={row.criterion}
                      className={idx % 2 === 0 ? "bg-white" : "bg-[#f4f1e9]/60"}
                    >
                      <td className="py-3 px-4 text-sm sm:text-base font-medium text-[#052638] align-top">
                        {row.criterion}
                      </td>
                      {COMPARISON_PRODUCT_KEYS.map((pk) => (
                        <td
                          key={pk}
                          className="py-3 px-4 text-sm sm:text-base text-gray-700 align-top"
                        >
                          {row[pk]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AnimateOnScroll animation="fadeInUp" className="text-center mt-10">
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
                {t("comparison.ctaLine")}
                <OpenLeadModalButton
                  topic={t("comparison.ctaLink.topic")}
                  className="text-[#A8C117] hover:underline font-medium"
                >
                  {t("comparison.ctaLink.label")}
                </OpenLeadModalButton>
                {t("comparison.ctaLineSuffix")}
              </p>
              <p className="text-gray-600 text-sm mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1">
                {COMPARISON_PAGE_LIST.map((page, idx) => (
                  <span key={page.id} className="inline-flex items-center gap-3">
                    {idx > 0 ? <span className="text-gray-300">·</span> : null}
                    <Link
                      href={page.path}
                      className="text-[#5a8f00] font-medium hover:underline"
                    >
                      {t(`compareGuides.${page.id}`)}
                    </Link>
                  </span>
                ))}
              </p>
            </AnimateOnScroll>
          </Container>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <Container>
            <VideoObjectSchema
              name={t("brushComparison.videoTitle")}
              description={t("brushComparison.videoCaption")}
              thumbnailUrl={`https://img.youtube.com/vi/${HUB_PRODUCT_VIDEO_ID}/maxresdefault.jpg`}
              uploadDate="2024-01-01"
              embedUrl={`https://www.youtube.com/embed/${HUB_PRODUCT_VIDEO_ID}`}
              contentUrl={`https://www.youtube.com/watch?v=${HUB_PRODUCT_VIDEO_ID}`}
            />
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("brushComparison.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight max-w-4xl mx-auto">
                {t("brushComparison.title")}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-5 leading-relaxed">
                {t("brushComparison.subtitle")}
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mb-12">
              <AnimateOnScroll animation="fadeInUp">
                <YouTubeEmbed
                  videoId={HUB_PRODUCT_VIDEO_ID}
                  title={t("brushComparison.videoTitle")}
                  className="w-full rounded-lg overflow-hidden shadow-lg"
                />
                <p className="text-gray-500 text-sm mt-3 text-center">
                  {t("brushComparison.videoCaption")}
                </p>
              </AnimateOnScroll>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <AnimateOnScroll animation="fadeInUp" className="bg-[#f4f1e9] p-6 rounded-lg">
                  <h3 className="text-[#052638] font-semibold text-lg mb-4">
                    {t("brushComparison.brushTitle")}
                  </h3>
                  <ul className="space-y-2 text-gray-600 text-sm sm:text-base list-disc pl-5">
                    {BRUSH_COMPARE_BRUSH_KEYS.map((i) => (
                      <li key={i}>{t(`brushComparison.brush${i}`)}</li>
                    ))}
                  </ul>
                </AnimateOnScroll>
                <AnimateOnScroll animation="fadeInUp" className="bg-[#052638] p-6 rounded-lg">
                  <h3 className="text-white font-semibold text-lg mb-4">
                    {t("brushComparison.robotTitle")}
                  </h3>
                  <ul className="space-y-2 text-white/85 text-sm sm:text-base list-disc pl-5">
                    {BRUSH_COMPARE_ROBOT_KEYS.map((i) => (
                      <li key={i}>{t(`brushComparison.robot${i}`)}</li>
                    ))}
                  </ul>
                </AnimateOnScroll>
              </div>
            </div>
            <AnimateOnScroll animation="fadeInUp" className="flex flex-wrap justify-center gap-4">
              <Link
                href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                className="inline-flex items-center justify-center min-h-[48px] bg-[#A8C117] text-[#052638] font-semibold px-7 py-3 rounded-lg hover:bg-[#b3cf3d] transition"
              >
                {t("brushComparison.ctaService")}
              </Link>
              <Link
                href="/solar-panel-cleaning-robot-price-calculator#calculator"
                className="inline-flex items-center justify-center min-h-[48px] border-2 border-[#052638] text-[#052638] font-medium px-7 py-3 rounded-lg hover:bg-[#052638]/5 transition"
              >
                {t("brushComparison.ctaCalculator")}
              </Link>
            </AnimateOnScroll>
          </Container>
        </section>

        <section className="bg-[#f4f1e9] py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("marketComparison.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight max-w-4xl mx-auto">
                {t("marketComparison.title")}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-5 leading-relaxed">
                {t("marketComparison.subtitle")}
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInUp" className="max-w-4xl mx-auto mb-10">
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed text-center">
                {t("marketComparison.intro")}
              </p>
            </AnimateOnScroll>

            <div className="overflow-x-auto rounded-lg border border-gray-200 mb-12">
              <table className="w-full text-left min-w-[720px]">
                <thead className="bg-[#052638] text-white">
                  <tr>
                    <th className="py-4 px-4 text-sm sm:text-base font-semibold">
                      {t("marketComparison.tableHeaders.criteria")}
                    </th>
                    {MARKET_COMPARISON_COL_KEYS.map((col) => (
                      <th
                        key={col}
                        className={`py-4 px-4 text-sm sm:text-base font-semibold ${
                          col === "taypro" ? "bg-[#0a3a52]" : ""
                        }`}
                      >
                        {t(`marketComparison.tableHeaders.${col}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {marketComparisonRows.map((row, idx) => (
                    <tr
                      key={row.criterion}
                      className={idx % 2 === 0 ? "bg-white" : "bg-white/70"}
                    >
                      <td className="py-3 px-4 text-sm sm:text-base font-medium text-[#052638] align-top">
                        {row.criterion}
                      </td>
                      {MARKET_COMPARISON_COL_KEYS.map((col) => (
                        <td
                          key={col}
                          className={`py-3 px-4 text-sm sm:text-base align-top ${
                            col === "taypro"
                              ? "text-[#052638] font-medium bg-[#A8C117]/10"
                              : "text-gray-700"
                          }`}
                        >
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto mb-12">
              <AnimateOnScroll animation="fadeInUp">
                <h3 className="text-[#052638] font-semibold text-xl mb-4">
                  {t("marketComparison.tayproFitTitle")}
                </h3>
                <ul className="space-y-2">
                  {tayproFitBullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2 text-gray-700 text-sm sm:text-base"
                    >
                      <Check className="w-4 h-4 text-[#A8C117] mt-1 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </AnimateOnScroll>

              <AnimateOnScroll animation="fadeInUp">
                <h3 className="text-[#052638] font-semibold text-xl mb-2">
                  {t("marketComparison.featuredTitle")}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {t("marketComparison.featuredSubtitle")}
                </p>
                <ul className="space-y-3">
                  {FEATURED_CASE_STUDIES.map((study) => {
                    const prefix = `marketComparison.featured.${study.cardKey}`;
                    return (
                      <li key={study.slug}>
                        <Link
                          href={`/projects/${study.slug}`}
                          className="block rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-[#A8C117]/60 transition"
                        >
                          <span className="text-[#052638] font-semibold text-sm block">
                            {t(`${prefix}.title`)}
                          </span>
                          <span className="text-gray-600 text-xs mt-1 block">
                            {t(`${prefix}.stat`)}
                          </span>
                          <span className="text-[#A8C117] text-xs font-medium mt-2 inline-flex items-center gap-1">
                            {t(`${prefix}.cta`)}
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </AnimateOnScroll>
            </div>

            <AnimateOnScroll
              animation="fadeInUp"
              className="flex flex-wrap justify-center gap-4"
            >
              <Link
                href="/projects"
                className="inline-flex items-center justify-center min-h-[44px] bg-[#052638] text-white font-medium px-6 py-2.5 rounded-lg hover:bg-[#0a3a52] transition"
              >
                {t("marketComparison.ctaProjects")}
              </Link>
              <Link
                href="/cleaning-technology"
                className="inline-flex items-center justify-center min-h-[44px] border-2 border-[#052638] text-[#052638] font-medium px-6 py-2.5 rounded-lg hover:bg-[#052638]/5 transition"
              >
                {t("marketComparison.ctaTechnology")}
              </Link>
              <Link
                href="/solar-panel-cleaning-robot-price-calculator#calculator"
                className="inline-flex items-center justify-center min-h-[44px] border-2 border-[#A8C117] text-[#052638] font-medium px-6 py-2.5 rounded-lg hover:bg-[#A8C117]/10 transition"
              >
                {t("marketComparison.ctaCalculator")}
              </Link>
            </AnimateOnScroll>
          </Container>
        </section>

        <section className="bg-[#f4f7f9] py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10 max-w-3xl mx-auto">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                {t("commercialModel.eyebrow")}
              </p>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl mb-4">
                {t("commercialModel.title")}
              </h2>
              <p className="text-[#27415c] text-base sm:text-lg leading-relaxed">
                {t("commercialModel.subtitle")}
              </p>
            </AnimateOnScroll>
            <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {([0, 1, 2, 3, 4] as const).map((i) => (
                <AnimateOnScroll key={i} animation="fadeInUp" delay={i * 60}>
                  <li className="list-none h-full rounded-xl border border-gray-200 bg-white p-6">
                    <span className="text-[#A8C117] text-sm font-semibold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-[#052638] font-semibold text-lg mt-2 mb-2">
                      <Link
                        href={COMMERCIAL_MODEL_LINKS[i]}
                        className="hover:text-[#A8C117] transition"
                      >
                        {t(`commercialModel.line${i}.title`)}
                      </Link>
                    </h3>
                    <p className="text-[#27415c] text-sm leading-relaxed">
                      {t(`commercialModel.line${i}.body`)}
                    </p>
                  </li>
                </AnimateOnScroll>
              ))}
            </ol>
          </Container>
        </section>

        <section className="bg-white py-14 sm:py-16 border-y border-gray-100">
          <Container className="max-w-3xl text-center">
            <AnimateOnScroll animation="fadeInUp">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                {t("ippPositioning.eyebrow")}
              </p>
              <h2 className="text-[#052638] font-semibold text-2xl sm:text-3xl mb-4">
                {t("ippPositioning.title")}
              </h2>
              <p className="text-[#27415c] text-base sm:text-lg leading-relaxed mb-6">
                {t("ippPositioning.body")}
              </p>
              <p className="text-sm text-[#5a7a8f]">
                <Link
                  href="/utility-scale-solar-operations"
                  className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
                >
                  {t("ippPositioning.linkOperations")}
                </Link>
                {" · "}
                <Link
                  href="/performance-and-test-methodology"
                  className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
                >
                  {t("ippPositioning.linkMethodology")}
                </Link>
              </p>
            </AnimateOnScroll>
          </Container>
        </section>

        <section className="w-full bg-[#052638] py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("indianConditions.eyebrow")}
              </div>
              <h2 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("indianConditions.title")}
              </h2>
              <p className="text-white/80 text-base sm:text-lg max-w-3xl mx-auto mt-5">
                {t("indianConditions.subtitle")}
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {indianConditions.map((card) => {
                const Icon = card.icon;
                return (
                  <AnimateOnScroll
                    key={card.title}
                    animation="fadeInUp"
                    className="bg-white/5 border border-white/10 p-6 sm:p-7 rounded-lg"
                  >
                    <Icon className="w-8 h-8 text-[#A8C117] mb-3" />
                    <h3 className="text-white font-semibold text-xl mb-2">
                      {card.title}
                    </h3>
                    <p className="text-white/80 text-base leading-relaxed">
                      {card.body}
                    </p>
                  </AnimateOnScroll>
                );
              })}
            </div>

            <div
              id="state-guides"
              className="mt-10 pt-8 border-t border-white/10 text-center scroll-mt-24"
            >
              <h3 className="text-white font-semibold text-lg mb-2">
                {t("indianConditions.stateGuides.heading")}
              </h3>
              <p className="text-white/70 text-sm mb-4 max-w-2xl mx-auto">
                {t("indianConditions.stateGuides.intro")}
              </p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
                <Link
                  href="/solar-panel-cleaning-robot-rajasthan"
                  className="text-[#A8C117] font-medium hover:underline underline-offset-4"
                >
                  {t("indianConditions.stateGuides.rajasthan")}
                </Link>
                <Link
                  href="/solar-panel-cleaning-robot-gujarat"
                  className="text-[#A8C117] font-medium hover:underline underline-offset-4"
                >
                  {t("indianConditions.stateGuides.gujarat")}
                </Link>
                <Link
                  href="/solar-panel-cleaning-robot-madhya-pradesh"
                  className="text-[#A8C117] font-medium hover:underline underline-offset-4"
                >
                  {t("indianConditions.stateGuides.madhyaPradesh")}
                </Link>
                <Link
                  href="/solar-panel-cleaning-robot-karnataka"
                  className="text-[#A8C117] font-medium hover:underline underline-offset-4"
                >
                  {t("indianConditions.stateGuides.karnataka")}
                </Link>
                <Link
                  href="/solar-panel-cleaning-robot-andhra-pradesh"
                  className="text-[#A8C117] font-medium hover:underline underline-offset-4"
                >
                  {t("indianConditions.stateGuides.andhraPradesh")}
                </Link>
                <Link
                  href="/solar-panel-cleaning-robot-maharashtra"
                  className="text-[#A8C117] font-medium hover:underline underline-offset-4"
                >
                  {t("indianConditions.stateGuides.maharashtra")}
                </Link>
                <Link
                  href="/solar-panel-cleaning-robot-uttar-pradesh"
                  className="text-[#A8C117] font-medium hover:underline underline-offset-4"
                >
                  {t("indianConditions.stateGuides.uttarPradesh")}
                </Link>
                <Link
                  href="/solar-panel-cleaning-robot-tamil-nadu"
                  className="text-[#A8C117] font-medium hover:underline underline-offset-4"
                >
                  {t("indianConditions.stateGuides.tamilNadu")}
                </Link>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("whyTaypro.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("whyTaypro.title")}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-5">
                {t("whyTaypro.subtitle")}
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyTaypro.map((item) => {
                const Icon = item.icon;
                return (
                  <AnimateOnScroll
                    key={item.title}
                    animation="fadeInUp"
                    className="bg-[#f4f1e9] p-6 rounded-lg flex flex-col h-full"
                  >
                    <Icon className="w-9 h-9 text-[#A8C117] mb-3" />
                    <h3 className="text-[#052638] font-semibold text-lg mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {item.body}
                    </p>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        <DynamicProjectsRollup
          locale={locale}
          eyebrow={t("dynamicProjectsRollup.eyebrow")}
          heading={t("dynamicProjectsRollup.heading")}
          subheading={t("dynamicProjectsRollup.subheading")}
          limit={4}
          background="cream"
        />

        <section
          className="py-14 md:py-20 bg-[#f4f7f9]"
          aria-labelledby="hub-roi-heading"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="text-center max-w-3xl mx-auto mb-8"
            >
              <h2
                id="hub-roi-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("roiBand.title")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("roiBand.body")}
              </p>
              <Link
                href="/solar-panel-cleaning-robot-price-calculator#calculator"
                className="inline-flex items-center gap-2 mt-4 text-[#5a8f00] font-semibold hover:underline"
              >
                {t("roiBand.linkFullCalculator")}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeInUp" delay={100}>
              <ROICalculatorEmbed />
            </AnimateOnScroll>
          </Container>
        </section>

        <CallbackCard headerText="" />

        <ModuleManufacturerTrust />

        <ClientsCard />

        <section className="py-16 sm:py-24 bg-white">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-6 sm:space-y-8">
                <AnimateOnScroll animation="fadeInUp">
                  <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-2">
                    {t("featuresSection.eyebrow")}
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-semibold text-[#052638]">
                    {t("featuresSection.title")}
                  </h2>
                </AnimateOnScroll>
                {robotFeatureRows.map((feature, idx) => (
                  <AnimateOnScroll
                    key={feature.title}
                    animation="fadeInLeft"
                    delay={idx * 80}
                    className="flex items-start space-x-3 sm:space-x-4"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Check className="text-[#39D600]" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-semibold text-[#052638]">
                        {feature.title}
                      </div>
                      <span className="leading-relaxed text-[#27415c] text-sm sm:text-base">
                        {feature.description}
                      </span>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
              <AnimateOnScroll animation="fadeInRight" delay={100}>
                <Image
                  src="/tayproasset/taypro-robotFeature.jpg"
                  alt={t("featuresSection.imageAlt")}
                  title={t("featuresSection.imageTitle")}
                  width={800}
                  height={1067}
                  className="w-full h-auto rounded-lg"
                />
              </AnimateOnScroll>
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="text-center mb-10 sm:mb-16"
            >
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("advantagesSection.eyebrow")}
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#052638] mb-3 sm:mb-4">
                {t("advantagesSection.title")}
              </h2>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <AnimateOnScroll animation="fadeInLeft" delay={100}>
                <Image
                  src="/tayprosolarpanel/taypro-solar-panel.jpg"
                  alt={t("advantagesSection.imageAlt")}
                  title={t("advantagesSection.imageTitle")}
                  width={800}
                  height={1063}
                  className="w-full h-auto rounded-lg"
                />
              </AnimateOnScroll>

              <div className="space-y-5 sm:space-y-8">
                {robotsAdvantagesRows.map((feature, idx) => (
                  <AnimateOnScroll
                    key={feature.title}
                    animation="fadeInRight"
                    delay={idx * 80}
                    className="flex items-start space-x-3 sm:space-x-4"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Check className="text-[#39D600]" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-semibold text-[#052638]">
                        {feature.title}
                      </div>
                      <span className="leading-relaxed text-gray-600 text-sm sm:text-base">
                        {feature.description}
                      </span>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </Container>

          <div className="hidden sm:block absolute top-0 left-0 w-64 h-64 bg-[#39D600]/5 rounded-full blur-3xl -translate-x-32 -translate-y-32 pointer-events-none"></div>
          <div className="hidden sm:block absolute bottom-0 right-0 w-96 h-96 bg-[#052638]/5 rounded-full blur-3xl translate-x-32 translate-y-32 pointer-events-none"></div>
        </section>

        <section className="w-full bg-[#052638] py-14 sm:py-16">
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-8 lg:gap-12 items-center"
            >
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-2 justify-center lg:justify-start text-[#A8C117] text-sm font-medium mb-3">
                  <LayoutDashboard className="w-4 h-4" />
                  {t("consoleBand.eyebrow")}
                </div>
                <h2 className="text-white font-semibold text-2xl sm:text-3xl md:text-4xl leading-tight mb-3">
                  {t("consoleBand.title")}
                </h2>
                <p className="text-white/80 text-base sm:text-lg max-w-2xl">
                  {t("consoleBand.body")}
                </p>
              </div>
              <Link
                href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                className="inline-flex items-center justify-center min-h-[48px] sm:min-w-[200px] bg-[#A8C117] text-[#052638] font-medium px-7 py-3.5 rounded-md hover:bg-[#b3cf3d] transition shrink-0"
              >
                {t("consoleBand.cta")}
              </Link>
            </AnimateOnScroll>
          </Container>
        </section>

        <section className="w-full bg-white py-16 sm:py-20">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("thingsToMind.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-2xl sm:text-4xl md:text-5xl leading-tight mb-6">
                {t("thingsToMind.title")}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg mb-8">
                {t("thingsToMind.intro")}
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {toDoFeatureRows.map((title, idx) => (
                <AnimateOnScroll
                  key={title}
                  animation="fadeInUp"
                  delay={idx * 60}
                  className="flex items-start space-x-3 bg-[#f4f1e9] p-4 sm:p-5 rounded-lg"
                >
                  <Sparkles className="w-5 h-5 text-[#A8C117] mt-0.5 shrink-0" />
                  <p className="text-[#052638] text-sm sm:text-base leading-relaxed">
                    {title}
                  </p>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        <FaqSection
          id="solar-hub-faq-heading"
          title={t("faq.title")}
          subtitle={
            <>
              {t("faq.subtitleLead")}
              <OpenLeadModalButton
                topic={t("faq.subtitleCta.topic")}
                className="text-[#A8C117] hover:underline font-medium"
              >
                {t("faq.subtitleCta.label")}
              </OpenLeadModalButton>
              {t("faq.subtitleSuffix")}
            </>
          }
          faqs={hubFaqs}
        />

        <section className="w-full py-16 sm:py-20 bg-[#052638] border-t border-[#0c3c57]">
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-8 lg:gap-12 lg:items-center"
            >
              <div className="text-center lg:text-left">
                <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                  {t("finalCta.eyebrow")}
                </div>
                <h2 className="text-white font-semibold text-2xl sm:text-3xl md:text-4xl mb-3 leading-tight">
                  {t("finalCta.title")}
                </h2>
                <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0">
                  {t("finalCta.body")}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0 justify-center">
                <OpenLeadModalButton
                  topic={t("finalCta.primaryCta.topic")}
                  title={t("finalCta.primaryCta.title")}
                  subtitle={t("finalCta.primaryCta.subtitle")}
                  className="inline-flex items-center justify-center min-h-[48px] sm:min-w-[200px] bg-[#A8C117] text-[#052638] font-medium px-7 py-3.5 rounded-md hover:bg-[#b3cf3d] transition"
                >
                  {t("finalCta.primaryCta.label")}
                </OpenLeadModalButton>
                <Link
                  href="/solar-panel-cleaning-robot-price-calculator#calculator"
                  className="inline-flex items-center justify-center min-h-[48px] sm:min-w-[200px] border-2 border-white text-white font-medium px-7 py-3.5 rounded-md hover:bg-white/10 transition"
                >
                  {t("finalCta.secondaryCta")}
                </Link>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <RequestEstimateForm />
      </div>
    </div>
  );
}
