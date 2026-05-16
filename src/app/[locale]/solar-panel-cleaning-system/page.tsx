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
import { RobotCard } from "@/app/components/RobotCard";
import { robotProducts, robotSolutions } from "@/app/data";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import ROICalculatorEmbed from "@/app/components/ROICalculatorEmbed";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import FAQAccordion from "@/app/components/FAQAccordion";
import DynamicProjectsRollup from "@/app/components/DynamicProjectsRollup";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";
import {
  CollectionPageSchema,
  FAQPageSchema,
  ItemListSchema,
} from "@/app/components/StructuredData";
import { Link } from "@/i18n/navigation";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

type SchemaItemKey =
  | "modelA"
  | "modelB"
  | "modelT"
  | "tayproOpex"
  | "tayproConsole";

function modelToSchemaKey(model: string): SchemaItemKey {
  const map: Record<string, SchemaItemKey> = {
    "Model-A": "modelA",
    "Model-B": "modelB",
    "Model-T": "modelT",
    "Taypro Opex": "tayproOpex",
    "Taypro Console": "tayproConsole",
  };
  const key = map[model];
  if (!key) {
    throw new Error(`Unknown robot model for schema i18n key: ${model}`);
  }
  return key;
}

const DECISION_GUIDE = [
  {
    icon: Sun,
    cardKey: "card0" as const,
    href: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
  },
  {
    icon: Factory,
    cardKey: "card1" as const,
    href: "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
  },
  {
    icon: Cog,
    cardKey: "card2" as const,
    href: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers",
  },
  {
    icon: BatteryCharging,
    cardKey: "card3" as const,
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

  const comparisonRows = COMPARISON_ROW_KEYS.map((rowKey) => {
    const prefix = `comparison.rows.${rowKey}` as const;
    return {
      criterion: t(`${prefix}.criterion`),
      modelA:
        rowKey === "row5"
          ? connectivitySummary
          : t(`${prefix}.modelA`),
      modelB: t(`${prefix}.modelB`),
      modelT:
        rowKey === "row5"
          ? connectivitySummary
          : t(`${prefix}.modelT`),
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

  const hubFaqs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ({
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

  const allProductsForSchema = [...robotProducts, ...robotSolutions];

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
          const key = modelToSchemaKey(r.model);
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
                    href="/solar-panel-cleaning-robot-price-calculator"
                    className="inline-flex items-center justify-center min-h-[48px] sm:min-w-[200px] border-2 border-white/70 text-white font-medium px-7 py-3.5 rounded-md hover:bg-white/10 transition"
                  >
                    {t("hero.secondaryCta")}
                  </Link>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll
                animation="fadeInRight"
                className="relative min-h-[280px] sm:min-h-[360px] lg:min-h-[480px]"
              >
                <Image
                  src="/tayproasset/taypro-robotImage.png"
                  alt={t("hero.heroImageAlt")}
                  title={t("hero.heroImageTitle")}
                  fill
                  priority
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
                  {t("intro.p2BetweenAB")}
                  <Link
                    href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("intro.p2LinkModelB")}
                  </Link>
                  {t("intro.p2BetweenBT")}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("intro.p2LinkModelT")}
                  </Link>
                  {t("intro.p2AfterT")}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
              {robotProducts.map((robot, idx) => {
                const schemaKey = modelToSchemaKey(robot.model);
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
                  const schemaKey = modelToSchemaKey(robot.model);
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
              <table className="w-full text-left min-w-[760px]">
                <thead className="bg-[#052638] text-white">
                  <tr>
                    <th className="py-4 px-5 text-sm sm:text-base font-semibold w-1/4">
                      {t("comparison.tableHeaders.criteria")}
                    </th>
                    <th className="py-4 px-5 text-sm sm:text-base font-semibold">
                      {t("comparison.tableHeaders.modelA")}
                    </th>
                    <th className="py-4 px-5 text-sm sm:text-base font-semibold">
                      {t("comparison.tableHeaders.modelB")}
                    </th>
                    <th className="py-4 px-5 text-sm sm:text-base font-semibold">
                      {t("comparison.tableHeaders.modelT")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, idx) => (
                    <tr
                      key={row.criterion}
                      className={idx % 2 === 0 ? "bg-white" : "bg-[#f4f1e9]/60"}
                    >
                      <td className="py-3 px-5 text-sm sm:text-base font-medium text-[#052638] align-top">
                        {row.criterion}
                      </td>
                      <td className="py-3 px-5 text-sm sm:text-base text-gray-700 align-top">
                        {row.modelA}
                      </td>
                      <td className="py-3 px-5 text-sm sm:text-base text-gray-700 align-top">
                        {row.modelB}
                      </td>
                      <td className="py-3 px-5 text-sm sm:text-base text-gray-700 align-top">
                        {row.modelT}
                      </td>
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
                href="/solar-panel-cleaning-robot-price-calculator"
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

        <section className="w-full py-16 sm:py-20 bg-white">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-4">
                {t("faq.title")}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                {t("faq.subtitleLead")}
                <OpenLeadModalButton
                  topic={t("faq.subtitleCta.topic")}
                  className="text-[#A8C117] hover:underline font-medium"
                >
                  {t("faq.subtitleCta.label")}
                </OpenLeadModalButton>
                {t("faq.subtitleSuffix")}
              </p>
            </AnimateOnScroll>

            <FAQAccordion faqs={hubFaqs} variant="modern" />
          </Container>
        </section>

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
                  href="/solar-panel-cleaning-robot-price-calculator"
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
