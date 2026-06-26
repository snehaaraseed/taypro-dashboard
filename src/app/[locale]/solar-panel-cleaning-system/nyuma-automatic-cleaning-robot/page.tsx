import Image from "next/image";
import {
  BatteryCharging,
  Brain,
  CheckCheck,
  Cloud,
  Droplet,
  Dumbbell,
  Hand,
  Headset,
  LineChart,
  RotateCcw,
  ShieldCheck,
  Sun,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import { nyumaCards, tayproTrustedByStatsStrip } from "@/app/data";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import CallbackCard from "@/app/components/CallbackCard";
import ProjectsCardServer from "@/app/components/ProjectsCardServer";
import { projectFilterForPage } from "@/lib/cms/project-page-filters";
import ProductCards from "@/app/components/ProductCards";
import HeroSection from "@/app/components/Herosection";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import ROICalculatorEmbed from "@/app/components/ROICalculatorEmbed";
import { FaqSection } from "@/app/components/FaqSection";
import { PerformanceMethodologyFootnote } from "@/app/components/PerformanceMethodologyLink";
import { PerformanceMethodologyNotice } from "@/app/components/PerformanceMethodologyNotice";
import {
  ProductSchema,
  FAQPageSchema,
  HowToSchema,
} from "@/app/components/StructuredData";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import ProductStaticShowcase from "@/app/components/ProductStaticShowcase";
import { Container } from "@/app/components/Container";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getProductHeroLayout,
  getProductImageUrl,
  productPageImages,
} from "@/lib/products/product-page-images";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const nyumaImages = productPageImages("nyuma");
const nyumaHeroLayout = getProductHeroLayout("nyuma");

/** White-background PNGs for gallery and showcase; catalog/OG use WebP heroes. */
const NYUMA_GALLERY = {
  zoomed: "/tayprorobots/nyuma/brush-detail.png",
  productRender: "/tayprorobots/nyuma/product-render.png",
  topView: "/tayprorobots/nyuma/top-view.png",
  brushDetail: "/tayprorobots/nyuma/brush-detail.png",
  fieldOperation: "/tayprorobots/nyuma/field-operation.jpg",
  heroDark: "/tayprorobots/nyuma/hero-dark.png",
  topViewDark: "/tayprorobots/nyuma/top-view-dark.png",
} as const;

const HOW_TO_STEP_KEYS = [
  "step0",
  "step1",
  "step2",
  "step3",
  "step4",
  "step5",
] as const;

const USP_ICONS = [
  Droplet,
  Dumbbell,
  LineChart,
  RotateCcw,
  Hand,
  Cloud,
  Brain,
  CheckCheck,
] as const;

const SERVICE_CARD_ICONS = [Wrench, Headset, BatteryCharging] as const;

const CERT_CARD_ICONS = [ShieldCheck, Sun, CheckCheck] as const;

const SPEC_ROW_KEYS = [
  "dimensions",
  "cleaningMethod",
  "cleaningType",
  "cleaningMaterial",
  "cleaningSpeed",
  "maxRunningLength",
  "recommendedRunningLength",
  "windDocking",
  "windOperation",
  "maxTilt",
  "maxTemp",
  "maxSlope",
  "maxUndulation",
  "ipRating",
  "corrosion",
  "battery",
  "connectivity",
  "designLife",
  "weight",
] as const;

const FEATURE_KEYS = [
  "aiCleaning",
  "microfiber",
  "range",
  "battery",
  "weather",
  "connectivity",
  "edge",
  "build",
] as const;

const ADVANTAGE_KEYS = [
  "energy",
  "waterless",
  "autonomous",
  "cost",
  "safe",
] as const;

const ADVANTAGE_ICONS = [Zap, Droplet, Brain, TrendingUp, ShieldCheck] as const;

const GLYDE_VS_NYUMA_ROW_KEYS = [
  "row0",
  "row1",
  "row2",
  "row3",
  "row4",
  "row5",
  "row6",
  "row7",
] as const;

const CYCLE_STEP_COUNT = 9;

export default async function NyumaAutomaticCleaningRobotPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "NyumaPage" });

  const connectivity = t("shared.connectivitySummary");

  const breadcrumbs = [
    { name: t("breadcrumbs.home"), href: "/" },
    {
      name: t("breadcrumbs.solarPanelCleaningRobots"),
      href: "/solar-panel-cleaning-system",
    },
    { name: t("breadcrumbs.automaticRobot"), href: "" },
  ];

  const howToSteps = HOW_TO_STEP_KEYS.map((stepKey) => {
    const base = `howToSection.steps.${stepKey}` as const;
    const name = t(`${base}.name`);
    const text =
      stepKey === "step5"
        ? `${t(`${base}.textBeforeConnectivity`)}${connectivity}${t(`${base}.textAfterConnectivity`)}`
        : t(`${base}.text`);
    return { name, text };
  });

  const sharedFaqEntries = [...Array(7)].map((_, i) => ({
    question: t(`faq.sharedFromData.item${i}.question`),
    answer: t(`faq.sharedFromData.item${i}.answer`),
  }));

  const modelSpecificFaqEntries = [...Array(7)].map((_, i) => ({
    question: t(`faq.productSpecific.item${i}.question`),
    answer: t(`faq.productSpecific.item${i}.answer`),
  }));

  const allFaqEntries = [...sharedFaqEntries, ...modelSpecificFaqEntries];

  const crossSellParagraph = (
    <p className="text-white/80 text-base sm:text-lg max-w-3xl mx-auto">
      {t("indianConditions.crossSellLead")}
      <Link
        href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
        className="brand-inline-link"
      >
        {t("indianConditions.linkHelyx")}
      </Link>
      {t("indianConditions.linkBetweenBAndT")}
      <Link
        href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
        className="brand-inline-link"
      >
        {t("indianConditions.linkGlyde")}
      </Link>
      {t("indianConditions.linkBetweenBAndT")}
      <Link
        href="/solar-panel-cleaning-system/nyuma-x-single-axis-tracker-cleaning-robot"
        className="brand-inline-link"
      >
        {t("indianConditions.linkNyumaX")}
      </Link>
      {t("indianConditions.linkBetweenTAndOpex")}
      <Link
        href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
        className="brand-inline-link"
      >
        {t("indianConditions.linkOpex")}
      </Link>
      {t("indianConditions.linkBetweenOpexAndNectyr")}
      <Link
        href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
        className="brand-inline-link"
      >
        {t("indianConditions.linkNectyr")}
      </Link>
      {t("indianConditions.crossSellSuffix")}
    </p>
  );

  const productFeatures = FEATURE_KEYS.map((key, i) => ({
    icon: USP_ICONS[i],
    title: t(`featuresLongForm.${key}.title`),
    body:
      key === "connectivity"
        ? `${t("featuresLongForm.connectivity.bodyBeforeStrong")}${connectivity}${t("featuresLongForm.connectivity.bodyAfterConnectivityStrong")}${t("featuresLongForm.connectivity.bodyBoldMesh")}${t("featuresLongForm.connectivity.bodyAfterMesh")}${t("featuresLongForm.connectivity.bodyBoldLoRa")}${t("featuresLongForm.connectivity.bodyAfterLoRa")}`
        : t(`featuresLongForm.${key}.body`),
  }));

  const productAdvantages = ADVANTAGE_KEYS.map((key, i) => ({
    icon: ADVANTAGE_ICONS[i],
    title: t(`advantagesSection.${key}.title`),
    body: t(`advantagesSection.${key}.body`),
  }));

  const cycleSteps = Array.from({ length: CYCLE_STEP_COUNT }, (_, i) =>
    t(`cycleNarrative.steps.s${i}`).replace(/^⦿\s*/, ""),
  );

  const glydeVsNyumaRows = GLYDE_VS_NYUMA_ROW_KEYS.map((key) => ({
    criterion: t(`glydeVsNyuma.${key}.criterion`),
    glyde: t(`glydeVsNyuma.${key}.glyde`),
    nyuma: t(`glydeVsNyuma.${key}.nyuma`),
  }));

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <ProductSchema
        name={t("schema.product.name")}
        description={t("schema.product.description")}
        image={getProductImageUrl("nyuma", siteUrl)}
        brand={t("schema.product.brand")}
        sku={t("schema.product.sku")}
        offerPriceKey="nyuma"
      />
      <FAQPageSchema faqs={allFaqEntries} />
      <HowToSchema
        name={t("schema.howTo.name")}
        description={t("schema.howTo.description")}
        steps={howToSteps}
        totalTime={t("schema.howTo.totalTime")}
        image={t("schema.howTo.imagePath")}
      />

      <div className="min-h-screen overflow-x-hidden">
        <HeroSection
          title={t("hero.title")}
          subtitle={
            <>
              {t("hero.leadBeforeStrong")}
              <strong>{t("hero.leadStrong")}</strong>
              {t("hero.leadAfterStrong")}
              {connectivity}
              {t("hero.leadAfterConnectivity")}
            </>
          }
          imgSrc={nyumaImages.hero}
          imgAlt={t("hero.heroImageAlt")}
          imageAspectRatio={nyumaHeroLayout.aspectRatio}
          imagePresentation={nyumaHeroLayout.presentation}
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
                {t("overview.p1BeforeStrong")}
                <strong>{t("overview.p1StrongCategory")}</strong>
                {t("overview.p1AfterCategory")}
                <strong>
                  {t("overview.p1DustClaimStrong")}
                  <PerformanceMethodologyFootnote />
                </strong>
                {t("overview.p1AfterDustClaim")}
              </p>
              <PerformanceMethodologyNotice className="mt-4" />
              <p>
                {t("overview.p2BeforeStrong")}
                <strong>{t("overview.p2Strong")}</strong>
                {t("overview.p2AfterStrong")}
              </p>
              <p>{t("overview.p3")}</p>
              <p>
                {t("overview.p4Prefix")}
                <Link
                  href="/blog/what-is-a-solar-panel-cleaning-robot"
                  className="brand-inline-link"
                >
                  {t("overview.p4Blog1")}
                </Link>
                {t("overview.p4Middle")}
                <Link
                  href="/blog/benefits-of-using-solar-panel-cleaning-robot-in-a-solar-plant"
                  className="brand-inline-link"
                >
                  {t("overview.p4Blog2")}
                </Link>
                {t("overview.p4Suffix")}
              </p>
            </div>
          </AnimateOnScroll>
        </Container>
      </section>

      <section className="w-full bg-white py-20">
        <Container size="narrow">
          <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
            <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
              {t("howToSection.eyebrow")}
            </div>
            <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
              {t("howToSection.title")}
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
              {t("howToSection.subtitle")}
            </p>
          </AnimateOnScroll>

          <ol className="space-y-6">
            {howToSteps.map((step, idx) => (
              <AnimateOnScroll
                key={step.name}
                animation="fadeInUp"
                className="flex gap-5 bg-[#f4f1e9] p-6 rounded-xl"
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

      <ProductStaticShowcase
        imageSrc={NYUMA_GALLERY.topView}
        detailImages={[NYUMA_GALLERY.brushDetail, NYUMA_GALLERY.productRender]}
        imageAlt={t("product360.productLabel")}
        imageAspectRatio="1024 / 768"
        eyebrow={t("product360.eyebrow")}
        title={t("product360.title")}
        subtitle={t("product360.subtitle")}
      />

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
          <AnimateOnScroll animation="fadeInUp" delay={30} className="max-w-5xl mx-auto mb-8 sm:mb-10">
            <div className="relative aspect-[1024/748] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <Image
                src={NYUMA_GALLERY.fieldOperation}
                alt={t("gallery.fieldAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1024px"
                priority
              />
            </div>
            <p className="text-center text-gray-500 text-sm mt-3">
              {t("gallery.fieldCaption")}
            </p>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <AnimateOnScroll animation="fadeInUp" delay={60}>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <Image
                  src={NYUMA_GALLERY.topView}
                  alt={t("gallery.primaryAlt")}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 480px"
                />
              </div>
              <p className="text-center text-gray-500 text-sm mt-3">
                {t("gallery.primaryCaption")}
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeInUp" delay={120}>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <Image
                  src={NYUMA_GALLERY.brushDetail}
                  alt={t("gallery.detailAlt")}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 480px"
                />
              </div>
              <p className="text-center text-gray-500 text-sm mt-3">
                {t("gallery.detailCaption")}
              </p>
            </AnimateOnScroll>
          </div>
          <AnimateOnScroll animation="fadeInUp" delay={180} className="max-w-3xl mx-auto mt-8 sm:mt-10">
            <div className="relative aspect-[1024/723] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <Image
                src={NYUMA_GALLERY.productRender}
                alt={t("gallery.heroAlt")}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 640px"
              />
            </div>
            <p className="text-center text-gray-500 text-sm mt-3">
              {t("gallery.heroCaption")}
            </p>
          </AnimateOnScroll>
        </Container>
      </section>

      <section className="w-full py-20 bg-[#f4f1e9]">
        <Container>
          <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
            <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
              {t("usps.eyebrow")}
            </div>
            <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
              {t("usps.title")}
            </h2>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {USP_ICONS.map((Icon, idx) => (
              <AnimateOnScroll
                key={idx}
                animation="fadeInUp"
                delay={100 + idx * 40}
                className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-start h-full"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-[#A8C117]/10 rounded-lg mb-4">
                  <Icon className="text-[#A8C117] w-7 h-7" />
                </div>
                <h3 className="text-[#052638] font-semibold text-lg leading-snug">
                  {t(`usps.items.item${idx}`)}
                </h3>
              </AnimateOnScroll>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20 bg-[#f4f7f9]" aria-labelledby="nyuma-roi-heading">
        <Container>
          <AnimateOnScroll animation="fadeInUp" className="text-center max-w-3xl mx-auto mb-8">
            <h2
              id="nyuma-roi-heading"
              className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
            >
              {t("roiBand.title")}
            </h2>
            <p className="text-[#27415c] text-lg leading-relaxed">
              {t("roiBand.bodyBeforeSpan")}
              <span className="text-[#5a8f00] font-medium">
                {t("roiBand.bodySpan")}
              </span>
              {t("roiBand.bodyAfterSpan")}
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeInUp" delay={100}>
            <ROICalculatorEmbed />
          </AnimateOnScroll>
        </Container>
      </section>

      <section className="pt-10 pb-1 bg-white">
        <Container>
          <AnimateOnScroll animation="fadeInUp" className="text-center">
            <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight max-w-4xl mx-auto">
              {t("projects.headingLine1")}
              {t("projects.headingLine2")}{" "}
              {t("projects.headingLine3")}{" "}
              {t("projects.headingLine4")}
            </h2>
            <div className="text-gray-600 my-6 text-base sm:text-xl italic">
              {t("projects.tagline")}
            </div>
          </AnimateOnScroll>
        </Container>
      </section>

      <ProjectsCardServer
        useFileProjects
        showHeader
        headerText={t("projects.recentProjectsHeader")}
        filter={projectFilterForPage("nyuma")}
        locale={locale}
      />

      <section className="w-full bg-[#052638] py-16 sm:py-20">
        <Container>
          <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
            <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
              {t("trustStats.eyebrow")}
            </div>
            <h2 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
              {t("trustStats.title")}
            </h2>
            <p className="text-white/80 text-base sm:text-lg max-w-3xl mx-auto mt-6">
              {t("trustStats.subtitle")}
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {tayproTrustedByStatsStrip.map((stat, idx) => (
              <AnimateOnScroll
                key={idx}
                animation="fadeInUp"
                delay={100 + idx * 80}
                className="text-center"
              >
                <div className="text-[#A8C117] font-semibold text-3xl sm:text-4xl md:text-5xl mb-2">
                  {stat.value}
                </div>
                <div className="text-white/90 text-sm sm:text-base">
                  {t(`trustStats.stats.stat${idx}.label`)}
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </Container>
      </section>

      <section className="w-full bg-white py-16 sm:py-24">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICE_CARD_ICONS.map((Icon, idx) => (
              <AnimateOnScroll
                key={idx}
                animation="fadeInUp"
                delay={150 + idx * 100}
                className="bg-[#f4f1e9] p-6 sm:p-8 rounded-lg h-full"
              >
                <span className="flex items-center justify-center w-12 h-12 bg-white rounded-lg mb-4">
                  <Icon size={28} className="text-[#052638]" />
                </span>
                <h3 className="text-[#052638] font-semibold text-xl mb-2">
                  {t(`servicePromise.cards.card${idx}.title`)}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  {t(`servicePromise.cards.card${idx}.body`)}
                </p>
              </AnimateOnScroll>
            ))}
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

      <section className="w-full bg-white py-20">
        <Container>
          <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
            <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
              {t("usps.eyebrow")}
            </div>
            <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight max-w-4xl mx-auto">
              {t("featuresLongForm.mainHeading")}
            </h2>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            {productFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <AnimateOnScroll
                  key={feature.title}
                  animation="fadeInUp"
                  className="flex gap-5"
                >
                  <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-[#A8C117]/10 rounded-lg">
                    <Icon className="text-[#A8C117] w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[#052638] font-semibold text-xl mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {feature.body}
                    </p>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="w-full bg-[#f4f1e9] py-20">
        <Container>
          <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
            <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
              {t("certifications.eyebrow")}
            </div>
            <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
              {t("certifications.title")}
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
              {t("certifications.subtitle")}
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CERT_CARD_ICONS.map((Icon, idx) => (
              <AnimateOnScroll
                key={idx}
                animation="fadeInUp"
                delay={150 + idx * 100}
                className="bg-white p-6 sm:p-8 rounded-lg shadow-sm h-full"
              >
                <span className="flex items-center justify-center w-12 h-12 bg-[#A8C117]/15 rounded-lg mb-4">
                  <Icon size={28} className="text-[#052638]" />
                </span>
                <h3 className="text-[#052638] font-semibold text-xl mb-2">
                  {t(`certifications.cards.card${idx}.title`)}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  {t(`certifications.cards.card${idx}.body`)}
                </p>
              </AnimateOnScroll>
            ))}
          </div>
        </Container>
      </section>

      <section className="w-full bg-white pt-24 pb-10">
        <Container>
          <AnimateOnScroll animation="fadeInUp" className="text-center mb-10 sm:mb-14">
            <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
              {t("manualVsAutomatic.eyebrow")}
            </div>
            <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
              {t("manualVsAutomatic.title")}
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
              {t("manualVsAutomatic.subtitle")}
            </p>
          </AnimateOnScroll>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-left text-sm sm:text-base">
              <thead>
                <tr className="bg-[#f4f1e9]">
                  <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                    {t("manualVsAutomatic.tableHeaders.criterion")}
                  </th>
                  <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                    {t("manualVsAutomatic.tableHeaders.manual")}
                  </th>
                  <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#A8C117]">
                    {t("manualVsAutomatic.tableHeaders.robot")}
                  </th>
                </tr>
              </thead>
              <tbody className="text-[#052638]">
                {[...Array(8)].map((_, rowIdx) => (
                  <tr key={rowIdx}>
                    <td className="py-3 px-4 sm:px-6 border-t text-base font-medium align-top">
                      {t(`manualVsAutomatic.rows.row${rowIdx}.criterion`)}
                    </td>
                    <td className="py-3 px-4 sm:px-6 border-t text-base text-gray-600 align-top">
                      {t(`manualVsAutomatic.rows.row${rowIdx}.manual`)}
                    </td>
                    <td className="py-3 px-4 sm:px-6 border-t text-base align-top">
                      {rowIdx === 6
                        ? `${t(`manualVsAutomatic.rows.row${rowIdx}.nectyrPrefix`)}${connectivity}${t(`manualVsAutomatic.rows.row${rowIdx}.nectyrSuffix`)}`
                        : t(`manualVsAutomatic.rows.row${rowIdx}.robot`)}
                    </td>
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
              {t("glydeVsNyuma.eyebrow")}
            </div>
            <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
              {t("glydeVsNyuma.title")}
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
              {t("glydeVsNyuma.subtitle")}
            </p>
          </AnimateOnScroll>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-left text-sm sm:text-base">
              <thead>
                <tr className="bg-[#f4f1e9]">
                  <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                    {t("glydeVsNyuma.criterion")}
                  </th>
                  <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                    {t("glydeVsNyuma.glydeHeader")}
                  </th>
                  <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#A8C117]">
                    {t("glydeVsNyuma.nyumaHeader")}
                  </th>
                </tr>
              </thead>
              <tbody className="text-[#052638]">
                {glydeVsNyumaRows.map((row) => (
                  <tr key={row.criterion}>
                    <td className="py-3 px-4 sm:px-6 border-t text-base font-medium align-top">
                      {row.criterion}
                    </td>
                    <td className="py-3 px-4 sm:px-6 border-t text-base text-gray-600 align-top">
                      {row.glyde}
                    </td>
                    <td className="py-3 px-4 sm:px-6 border-t text-base align-top">
                      {row.nyuma}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AnimateOnScroll animation="fadeInUp" className="text-center mt-10">
            <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
              {t("glydeVsNyuma.crossSellLead")}
              <Link
                href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                className="brand-inline-link"
              >
                {t("glydeVsNyuma.linkHelyx")}
              </Link>
              {t("glydeVsNyuma.crossSellMid")}
              <Link
                href="/compare/glyde-x-vs-nyuma-x"
                className="brand-inline-link"
              >
                {t("glydeVsNyuma.linkTracker")}
              </Link>
              {t("glydeVsNyuma.crossSellSuffix")}
            </p>
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

          <AnimateOnScroll animation="fadeInUp" delay={80} className="max-w-4xl mx-auto mb-12">
            <div className="relative aspect-[1024/723] w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
              <Image
                src={NYUMA_GALLERY.heroDark}
                alt={t("gallery.heroAlt")}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {[...Array(4)].map((_, idx) => (
              <AnimateOnScroll
                key={idx}
                animation="fadeInUp"
                className="bg-white/5 border border-white/10 p-6 sm:p-7 rounded-lg"
              >
                <h3 className="text-white font-semibold text-xl mb-3">
                  {t(`indianConditions.cards.card${idx}.title`)}
                </h3>
                <p className="text-white/80 text-base leading-relaxed">
                  {t(`indianConditions.cards.card${idx}.body`)}
                </p>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll animation="fadeInUp" className="text-center mt-12">
            {crossSellParagraph}
          </AnimateOnScroll>
        </Container>
      </section>

      <section className="w-full bg-white pt-24 pb-10">
        <Container>
          <AnimateOnScroll
            animation="fadeInUp"
            className="font-semibold text-[#052638] text-center text-3xl sm:text-5xl md:text-6xl mb-12 sm:mb-15"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl leading-tight max-w-3xl mx-auto">
              {t("specifications.titleLine1")}
              <br />
              {t("specifications.titleLine2")}
            </h2>
          </AnimateOnScroll>
          <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-left border border-gray-300 text-sm sm:text-base">
              <thead>
                <tr className="bg-[#052638] text-white">
                  <th className="py-4 px-6 font-semibold text-base md:text-lg text-white">
                    {t("specifications.tableHeaders.spec")}
                  </th>
                  <th className="py-4 px-6 font-semibold text-base md:text-lg text-white">
                    {t("specifications.tableHeaders.details")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {SPEC_ROW_KEYS.map((rowKey, rowIdx) => (
                  <tr
                    key={rowKey}
                    className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="py-3 px-6 border-t text-base md:text-lg font-medium text-[#052638]">
                      {t(`specifications.rows.${rowKey}.spec`)}
                    </td>
                    <td className="py-3 px-6 border-t text-base md:text-lg">
                      {rowKey === "connectivity"
                        ? connectivity
                        : t(`specifications.rows.${rowKey}.details`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AnimateOnScroll animation="fadeInUp" className="text-center mt-8">
            <OpenLeadModalButton
              topic={t("specifications.datasheetCtaTopic")}
              title={t("specifications.datasheetCtaTitle")}
              subtitle={t("specifications.datasheetCtaSubtitle")}
              leadIntent={t("specifications.datasheetCtaTopic")}
              submitLabel={t("specifications.datasheetCta")}
              source="product_datasheet"
              analyticsFormType="datasheet_request"
              className="inline-flex items-center justify-center min-h-[48px] px-7 py-3 rounded-lg bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
            >
              {t("specifications.datasheetCta")}
            </OpenLeadModalButton>
          </AnimateOnScroll>
        </Container>
      </section>

      <section className="w-full py-20 bg-[#f4f1e9]">
        <Container>
          <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
            <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight max-w-3xl mx-auto">
              {t("advantagesSection.heading")}
            </h2>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {productAdvantages.map((item) => {
              const Icon = item.icon;
              return (
                <AnimateOnScroll
                  key={item.title}
                  animation="fadeInUp"
                  className="bg-white p-6 sm:p-8 rounded-xl shadow-sm h-full"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-[#A8C117]/10 rounded-lg mb-4">
                    <Icon className="text-[#A8C117] w-6 h-6" />
                  </div>
                  <h3 className="text-[#052638] font-semibold text-xl mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-base leading-relaxed">{item.body}</p>
                </AnimateOnScroll>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="w-full py-20 sm:py-24 bg-[#052638]">
        <Container size="narrow">
          <AnimateOnScroll animation="fadeInUp" className="mb-10">
            <div className="text-[#A8C117] text-base font-medium mb-3">
              {t("servicePromise.eyebrow")}
            </div>
            <h2 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">{t("installSection.title")}</h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeInUp" delay={80} className="mb-10">
            <div className="relative aspect-[1024/594] w-full max-w-4xl mx-auto overflow-hidden rounded-2xl ring-1 ring-white/10">
              <Image
                src={NYUMA_GALLERY.topViewDark}
                alt={t("gallery.primaryAlt")}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            </div>
          </AnimateOnScroll>
          <div className="space-y-4">
          <p className="text-white/90 text-base sm:text-lg bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6">
            {t("installSection.p1")}
          </p>
          <p className="text-white/90 text-base sm:text-lg bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6">
            {t("installSection.p2")}
          </p>
          <p className="text-white/90 text-base sm:text-lg bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6">
            {t("installSection.p3")}
          </p>
          <p className="text-white/90 text-base sm:text-lg bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6">
            {t("installSection.p4")}
          </p>
          </div>
        </Container>
      </section>

      <section className="w-full py-16 bg-white">
        <Container size="narrow">
          <AnimateOnScroll animation="fadeInUp" className="bg-[#f4f1e9] rounded-2xl p-6 sm:p-10">
            <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl mb-6">{t("roiSection.title")}</h2>
            <p className="mb-5 text-base sm:text-lg text-gray-600 leading-relaxed">{t("roiSection.p1")}</p>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            {t("roiSection.p2BeforeLink")}
            <Link
              href="/solar-panel-cleaning-robot-price-calculator#calculator"
              className="text-[#A8C117] underline hover:no-underline"
            >
              {t("roiSection.roiCalculatorLink")}
            </Link>
            {t("roiSection.p2AfterLink")}
          </p>
          </AnimateOnScroll>
        </Container>
      </section>

      <section className="w-full py-20 bg-[#f4f1e9]">
        <Container size="narrow">
          <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
            <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
              {t("cycleNarrative.title")}
            </h2>
          </AnimateOnScroll>
          <ol className="space-y-4">
            {cycleSteps.map((step, idx) => (
              <AnimateOnScroll
                key={idx}
                animation="fadeInUp"
                delay={idx * 40}
                className="flex gap-4 bg-white p-5 sm:p-6 rounded-xl shadow-sm"
              >
                <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-[#A8C117] text-white font-semibold rounded-full">
                  {idx + 1}
                </div>
                <p className="text-gray-600 text-base leading-relaxed pt-1.5">{step}</p>
              </AnimateOnScroll>
            ))}
          </ol>
        </Container>
      </section>

      <FaqSection id="nyuma-faq-heading" title={t("faq.title")} faqs={allFaqEntries} />

        <ProductCards title={t("productCards.title")} cards={nyumaCards} />

      <RequestEstimateForm />
      </div>
    </>
  );
}
