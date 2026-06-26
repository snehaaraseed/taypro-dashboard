import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowRightLeft,
  BatteryCharging,
  Check,
  Cloud,
  Gauge,
  Headset,
  MapPin,
  MoveHorizontal,
  RailSymbol,
  ShieldCheck,
  Sun,
  Wifi,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import HeroSection from "@/app/components/Herosection";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import {
  ProductSchema,
  FAQPageSchema,
  HowToSchema,
} from "@/app/components/StructuredData";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import ProductCards from "@/app/components/ProductCards";
import ProjectsCardServer from "@/app/components/ProjectsCardServer";
import { projectFilterForPage } from "@/lib/cms/project-page-filters";
import { FaqSection } from "@/app/components/FaqSection";
import ResourcesCard from "@/app/components/ResourcesCard";
import CallbackCard from "@/app/components/CallbackCard";
import { helyxCards, tayproTrustedByStatsStrip } from "@/app/data";
import { cradylProductConfig } from "@/lib/product-cradyl";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const siteUrl = SITE_URL;

const USP_ICONS: LucideIcon[] = [
  ArrowRightLeft,
  MoveHorizontal,
  RailSymbol,
  Sun,
  MapPin,
  ShieldCheck,
  Cloud,
  ShieldCheck,
];

const FEATURE_ICONS: LucideIcon[] = [
  RailSymbol,
  Check,
  Wifi,
  Wrench,
  ShieldCheck,
  Wrench,
  MoveHorizontal,
  Gauge,
];

const USE_CASE_ICONS: LucideIcon[] = [MapPin, MoveHorizontal, Gauge, Wrench];

const USP_COUNT = 8;
const FEATURE_COUNT = 8;
const SPEC_COUNT = 16;
const STEP_COUNT = 6;
const FAQ_COUNT = 10;
const USE_CASE_COUNT = 4;
const INSTALL_COUNT = 4;

const MANUAL_VS_ROW_KEYS = [
  "row0",
  "row1",
  "row2",
  "row3",
  "row4",
  "row5",
  "row6",
  "row7",
] as const;

const CRADYL_VS_ROW_KEYS = [
  "row0",
  "row1",
  "row2",
  "row3",
  "row4",
  "row5",
  "row6",
  "row7",
] as const;

const INDIAN_CARD_KEYS = ["card0", "card1", "card2", "card3"] as const;
const SERVICE_CARD_KEYS = ["card0", "card1", "card2"] as const;

type CradylProductPageProps = {
  locale: string;
};

export async function CradylProductPage({ locale }: CradylProductPageProps) {
  const product = cradylProductConfig;
  const t = await getTranslations({ locale, namespace: product.namespace });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.robots"), href: "/solar-panel-cleaning-system" },
    { name: t("breadcrumbs.current"), href: "" },
  ];

  const usps = Array.from({ length: USP_COUNT }, (_, i) => ({
    icon: USP_ICONS[i] ?? Check,
    title: t(`usps.${i}.title`),
    description: t(`usps.${i}.description`),
  }));

  const features = Array.from({ length: FEATURE_COUNT }, (_, i) => ({
    icon: FEATURE_ICONS[i] ?? Check,
    title: t(`features.${i}.title`),
    body: t(`features.${i}.body`),
  }));

  const specs = Array.from({ length: SPEC_COUNT }, (_, i) => ({
    label: t(`specs.${i}.label`),
    value: t(`specs.${i}.value`),
  }));

  const steps = Array.from({ length: STEP_COUNT }, (_, i) => ({
    name: t(`steps.${i}.name`),
    text: t(`steps.${i}.text`),
  }));

  const faqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    question: t(`faqs.${i}.question`),
    answer: t(`faqs.${i}.answer`),
  }));

  const useCases = Array.from({ length: USE_CASE_COUNT }, (_, i) => ({
    icon: USE_CASE_ICONS[i] ?? Check,
    title: t(`useCases.${i}.title`),
    body: t(`useCases.${i}.body`),
  }));

  const manualVsRows = MANUAL_VS_ROW_KEYS.map((key) => ({
    criterion: t(`manualVsCradyl.${key}.criterion`),
    manual: t(`manualVsCradyl.${key}.manual`),
    cradyl: t(`manualVsCradyl.${key}.cradyl`),
  }));

  const cradylVsRows = CRADYL_VS_ROW_KEYS.map((key) => ({
    criterion: t(`cradylVsExtraRobot.${key}.criterion`),
    cradyl: t(`cradylVsExtraRobot.${key}.cradyl`),
    extraRobot: t(`cradylVsExtraRobot.${key}.extraRobot`),
  }));

  const serviceCards = SERVICE_CARD_KEYS.map((key, i) => ({
    icon: [Wrench, Wifi, Headset][i],
    title: t(`servicePromise.${key}Title`),
    body: t(`servicePromise.${key}Body`),
  }));

  const indianCards = INDIAN_CARD_KEYS.map((key) => ({
    title: t(`indianConditions.${key}Title`),
    body: t(`indianConditions.${key}Body`),
  }));

  const installItems = Array.from({ length: INSTALL_COUNT }, (_, i) =>
    t(`installation.item${i}`)
  );

  const pageUrl = `${siteUrl}${product.path}`;

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <ProductSchema
        name={t("schema.productName")}
        description={t("schema.productDescription")}
        image={`${siteUrl}${product.heroImagePath}`}
        brand="Taypro"
        sku={product.model}
        offerPriceKey="cradyl"
      />
      <FAQPageSchema faqs={faqs} />
      <HowToSchema
        name={t("schema.howToName")}
        description={t("schema.howToDescription")}
        steps={steps}
        totalTime="PT30M"
        image={product.heroImagePath}
      />

      <div className="min-h-screen overflow-x-hidden">
        <span className="sr-only">{t("hero.launchedBadge")}</span>
        <HeroSection
          title={t("hero.title")}
          subtitle={
            <>
              {t("hero.subtitleBefore")}
              <strong>{t("hero.subtitleStrong")}</strong>
              {t("hero.subtitleAfter")}
              <strong>{t("hero.subtitleStrong2")}</strong>
              {t("hero.subtitleAfter2")}
            </>
          }
          imgSrc={product.heroImagePath}
          imgAlt={t("hero.imgAlt")}
          ctaHref="/contact"
          ctaText={t("hero.primaryCta.label")}
          ctaTopic={t("hero.primaryCta.topic")}
          ctaTitle={t("hero.primaryCta.title")}
          ctaSubtitle={t("hero.primaryCta.subtitle")}
        />

        <section className="bg-white pt-8 sm:pt-14 pb-4">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("overview.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight">
                {t("overview.title")}
              </h2>
              <div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                <p>
                  {t("overview.p1Before")}
                  <strong>{t("overview.p1Strong")}</strong>
                  {t("overview.p1AfterStrong")}
                </p>
                <p>
                  {t("overview.p2Before")}
                  <strong>{t("overview.p2RailStrong")}</strong>
                  {t("overview.p2Mid")}
                  <strong>{t("overview.p2SolarStrong")}</strong>
                  {t("overview.p2After")}
                  <strong>{t("overview.p2SensorStrong")}</strong>
                  {t("overview.p2AfterSensor")}
                </p>
                <p>
                  {t("overview.p3Before")}
                  <strong>{t("overview.p3LaunchedStrong")}</strong>
                  {t("overview.p3Mid")}
                  <Link
                    href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                    className="brand-inline-link"
                  >
                    {t("overview.linkHelyx")}
                  </Link>
                  {t("overview.p3Between")}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                    className="brand-inline-link"
                  >
                    {t("overview.linkGlyde")}
                  </Link>
                  {t("overview.p3After")}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                    className="brand-inline-link"
                  >
                    {t("overview.linkNectyr")}
                  </Link>
                  {t("overview.p3Suffix")}
                </p>
                <p>
                  {t("overview.p4Prefix")}
                  <Link
                    href="/solar-panel-cleaning-system"
                    className="brand-inline-link"
                  >
                    {t("overview.linkHub")}
                  </Link>
                  {t("overview.p4Mid")}
                  <Link
                    href="/blog/what-are-the-different-methods-used-for-solar-panel-cleaning"
                    className="brand-inline-link"
                  >
                    {t("overview.linkBlogMethods")}
                  </Link>
                  {t("overview.p4Suffix")}
                </p>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <section className="bg-gradient-to-b from-white to-gray-50 py-12 sm:py-16">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("gallery.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl mb-4">
                {t("gallery.title")}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
                {t("gallery.subtitle")}
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeInUp" delay={80} className="max-w-4xl mx-auto">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                <Image
                  src={product.aerialImagePath}
                  alt={t("gallery.aerialAlt")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
              </div>
              <p className="text-center text-gray-500 text-sm mt-4">
                {t("gallery.caption")}
              </p>
            </AnimateOnScroll>
          </Container>
        </section>

        <section className="w-full bg-white py-20">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("howItWorks.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("howItWorks.title")}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                {t("howItWorks.subtitle")}
              </p>
            </AnimateOnScroll>
            <ol className="space-y-6">
              {steps.map((step, idx) => (
                <AnimateOnScroll
                  key={step.name}
                  animation="fadeInUp"
                  className="flex gap-5 bg-[#f4f1e9] p-6 rounded-lg"
                >
                  <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-[#A8C117] text-white font-semibold text-lg rounded-full">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-[#052638] font-semibold text-xl mb-2">
                      {step.name}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </AnimateOnScroll>
              ))}
            </ol>
          </Container>
        </section>

        <section className="w-full py-20 bg-[#f4f1e9]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("uspSection.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("uspSection.title")}
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {usps.map((usp) => {
                const Icon = usp.icon;
                return (
                  <AnimateOnScroll
                    key={usp.title}
                    animation="fadeInUp"
                    className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-start"
                  >
                    <div className="w-15 h-15 flex items-center justify-center bg-[#A8C117]/10 rounded-md mb-4">
                      <Icon className="text-[#A8C117] w-7 h-7" aria-hidden />
                    </div>
                    <h3 className="text-[#052638] font-semibold text-lg mb-2">
                      {usp.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {usp.description}
                    </p>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="w-full bg-white py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("featuresSection.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("featuresSection.title")}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                {t("featuresSection.subtitle")}
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <AnimateOnScroll
                    key={f.title}
                    animation="fadeInUp"
                    className="flex gap-5"
                  >
                    <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-[#A8C117]/10 rounded-md">
                      <Icon className="text-[#A8C117] w-6 h-6" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-[#052638] font-semibold text-xl mb-2">
                        {f.title}
                      </h3>
                      <p className="text-gray-600 text-base leading-relaxed">
                        {f.body}
                      </p>
                    </div>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="w-full bg-[#f4f1e9] py-20">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("installation.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight mb-4">
                {t("installation.title")}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                {t("installation.subtitle")}
              </p>
            </AnimateOnScroll>
            <ul className="space-y-4 max-w-3xl">
              {installItems.map((item, idx) => (
                <AnimateOnScroll key={idx} animation="fadeInUp" delay={idx * 50}>
                  <li className="flex gap-3 rounded-xl border border-gray-200 bg-white p-5">
                    <Check
                      className="h-6 w-6 text-[#A8C117] shrink-0 mt-0.5"
                      aria-hidden
                    />
                    <span className="text-gray-600 text-base leading-relaxed">
                      {item}
                    </span>
                  </li>
                </AnimateOnScroll>
              ))}
            </ul>
          </Container>
        </section>

        <section className="w-full bg-[#052638] py-16">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("trustStats.eyebrow")}
              </div>
              <h2 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("trustStats.title")}
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 text-center">
              {[...tayproTrustedByStatsStrip].map((stat, idx) => (
                <AnimateOnScroll key={idx} animation="fadeInUp" className="px-4">
                  <div className="text-[#A8C117] font-semibold text-3xl sm:text-4xl mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/80 text-sm sm:text-base">
                    {t(`trustStats.stat${idx}.label`)}
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        <section className="w-full bg-white py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("servicePromise.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("servicePromise.title")}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                {t("servicePromise.subtitle")}
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {serviceCards.map((card) => {
                const Icon = card.icon;
                return (
                  <AnimateOnScroll
                    key={card.title}
                    animation="fadeInUp"
                    className="bg-[#f4f1e9] p-6 rounded-lg"
                  >
                    <Icon className="text-[#A8C117] w-9 h-9 mb-3" aria-hidden />
                    <h3 className="text-[#052638] font-semibold text-xl mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {card.body}
                    </p>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        <CallbackCard
          headerText={
            <>
              {t("callbackCard.line1")}
              <br />
              {t("callbackCard.line2")}
            </>
          }
        />

        <section
          id="cradyl-specs"
          className="w-full bg-white pt-20 pb-10 scroll-mt-24"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="font-semibold text-[#052638] text-center text-3xl sm:text-5xl md:text-6xl mb-12 sm:mb-15"
            >
              <h2>
                {t("specifications.titleLine1")} <br />
                {t("specifications.titleLine2")}
              </h2>
            </AnimateOnScroll>
            <div className="w-full bg-white shadow-md overflow-x-auto">
              <table className="w-full text-left border border-gray-300 text-sm sm:text-base">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-4 px-6 font-semibold text-base md:text-xl text-[#052638]">
                      {t("specifications.specHeader")}
                    </th>
                    <th className="py-4 px-6 font-semibold text-base md:text-xl text-[#052638]">
                      {t("specifications.valueHeader")}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#052638]">
                  {specs.map((row) => (
                    <tr key={row.label}>
                      <td className="py-3 px-6 border-t text-base font-medium">
                        {row.label}
                      </td>
                      <td className="py-3 px-6 border-t text-base">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>

        <section className="w-full bg-[#f4f1e9] py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10 sm:mb-14">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("manualVsCradyl.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("manualVsCradyl.title")}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                {t("manualVsCradyl.subtitle")}
              </p>
            </AnimateOnScroll>
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-gray-200 text-sm sm:text-base bg-white">
                <thead>
                  <tr className="bg-white">
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                      {t("manualVsCradyl.criterion")}
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                      {t("manualVsCradyl.manual")}
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#A8C117]">
                      {t("manualVsCradyl.cradyl")}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#052638]">
                  {manualVsRows.map((row) => (
                    <tr key={row.criterion}>
                      <td className="py-3 px-4 sm:px-6 border-t text-base font-medium align-top">
                        {row.criterion}
                      </td>
                      <td className="py-3 px-4 sm:px-6 border-t text-base text-gray-600 align-top">
                        {row.manual}
                      </td>
                      <td className="py-3 px-4 sm:px-6 border-t text-base align-top">
                        {row.cradyl}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>

        <section className="w-full bg-white py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10 sm:mb-14">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("cradylVsExtraRobot.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("cradylVsExtraRobot.title")}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                {t("cradylVsExtraRobot.subtitle")}
              </p>
            </AnimateOnScroll>
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-gray-200 text-sm sm:text-base">
                <thead>
                  <tr className="bg-[#f4f1e9]">
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                      {t("cradylVsExtraRobot.criterion")}
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#A8C117]">
                      {t("cradylVsExtraRobot.cradylHeader")}
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                      {t("cradylVsExtraRobot.extraRobotHeader")}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#052638]">
                  {cradylVsRows.map((row) => (
                    <tr key={row.criterion}>
                      <td className="py-3 px-4 sm:px-6 border-t text-base font-medium align-top">
                        {row.criterion}
                      </td>
                      <td className="py-3 px-4 sm:px-6 border-t text-base align-top">
                        {row.cradyl}
                      </td>
                      <td className="py-3 px-4 sm:px-6 border-t text-base text-gray-600 align-top">
                        {row.extraRobot}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AnimateOnScroll animation="fadeInUp" className="text-center mt-10">
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
                {t("cradylVsExtraRobot.crossSellLead")}
                <Link
                  href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                  className="brand-inline-link"
                >
                  {t("cradylVsExtraRobot.linkGlyde")}
                </Link>
                {t("cradylVsExtraRobot.crossSellMid")}
                <Link
                  href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                  className="brand-inline-link"
                >
                  {t("cradylVsExtraRobot.linkHelyx")}
                </Link>
                {t("cradylVsExtraRobot.crossSellSuffix")}
              </p>
            </AnimateOnScroll>
          </Container>
        </section>

        <section className="bg-white py-14 sm:py-20">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("useCasesSection.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl mb-6 leading-tight">
                {t("useCasesSection.title")}
              </h2>
              <ul className="space-y-6">
                {useCases.map((item) => (
                  <li
                    key={item.title}
                    className="flex gap-4 rounded-xl border border-gray-100 bg-[#f8fafb] p-5"
                  >
                    <item.icon
                      className="h-6 w-6 text-[#A8C117] shrink-0 mt-0.5"
                      aria-hidden
                    />
                    <div>
                      <h3 className="text-[#052638] font-semibold text-lg mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>
          </Container>
        </section>

        <section className="w-full bg-[#052638] py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("indianConditions.eyebrow")}
              </div>
              <h2 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("indianConditions.title")}
              </h2>
              <p className="text-white/80 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                {t("indianConditions.subtitle")}
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {indianCards.map((card) => (
                <AnimateOnScroll
                  key={card.title}
                  animation="fadeInUp"
                  className="bg-white/5 border border-white/10 p-6 sm:p-7 rounded-lg"
                >
                  <h3 className="text-white font-semibold text-xl mb-3">
                    {card.title}
                  </h3>
                  <p className="text-white/80 text-base leading-relaxed">
                    {card.body}
                  </p>
                </AnimateOnScroll>
              ))}
            </div>
            <AnimateOnScroll animation="fadeInUp" className="text-center mt-12">
              <p className="text-white/80 text-base sm:text-lg max-w-3xl mx-auto">
                {t("indianConditions.crossSellLead")}
                <Link
                  href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                  className="brand-inline-link"
                >
                  {t("indianConditions.linkHelyx")}
                </Link>
                {t("indianConditions.linkBetween")}
                <Link
                  href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                  className="brand-inline-link"
                >
                  {t("indianConditions.linkGlyde")}
                </Link>
                {t("indianConditions.linkMid")}
                <Link
                  href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                  className="brand-inline-link"
                >
                  {t("indianConditions.linkNectyr")}
                </Link>
                {t("indianConditions.crossSellSuffix")}
              </p>
            </AnimateOnScroll>
          </Container>
        </section>

        <ProjectsCardServer
          useFileProjects
          showHeader
          headerText=""
          filter={projectFilterForPage("cradyl")}
          locale={locale}
        />

        <FaqSection
          id="cradyl-faq-heading"
          title={t("faqSection.title")}
          subtitle={t("faqSection.subtitle")}
          faqs={faqs}
        />

        <section className="bg-[#052638] py-14 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <h2 className="text-white font-semibold text-3xl sm:text-4xl mb-4">
                {t("cta.title")}
              </h2>
              <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto">
                {t("cta.subtitle")}
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeInUp" delay={100}>
              <RequestEstimateForm
                variant="embedded"
                eyebrow={t("cta.formEyebrow")}
                title={t("cta.formTitle")}
                submitLabel={t("cta.submitLabel")}
                leadIntent={t("cta.formTitle")}
                className="max-w-xl mx-auto"
              />
            </AnimateOnScroll>
          </Container>
        </section>

        <ResourcesCard />

        <ProductCards title={t("productCardsTitle")} cards={helyxCards} />

        <RequestEstimateForm />

        <section className="bg-[#f4f1e9] py-10 text-center">
          <Container size="narrow">
            <p className="text-gray-600 text-sm">{t("footerNote")}</p>
            <p className="text-gray-500 text-xs mt-2">
              <a href={pageUrl} className="underline hover:text-[#052638]">
                {pageUrl.replace(/^https?:\/\//, "")}
              </a>
            </p>
          </Container>
        </section>
      </div>
    </>
  );
}
