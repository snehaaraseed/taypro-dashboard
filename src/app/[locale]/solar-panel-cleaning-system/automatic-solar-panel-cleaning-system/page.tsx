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
  Wrench,
} from "lucide-react";
import { modelCards, tayproTrustedByStatsStrip } from "@/app/data";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import CallbackCard from "@/app/components/CallbackCard";
import ProjectsCardServer from "@/app/components/ProjectsCardServer";
import ModelCards from "@/app/components/ModelCards";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import ROICalculatorEmbed from "@/app/components/ROICalculatorEmbed";
import FAQAccordion from "@/app/components/FAQAccordion";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";
import { PerformanceMethodologyFootnote } from "@/app/components/PerformanceMethodologyLink";
import { PerformanceMethodologyNotice } from "@/app/components/PerformanceMethodologyNotice";
import {
  ProductSchema,
  FAQPageSchema,
  HowToSchema,
} from "@/app/components/StructuredData";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import Product360Viewer from "@/app/components/Product360Viewer";
import { Container } from "@/app/components/Container";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

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

export default async function AutomaticSolarPanelCleaningRobot({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ModelAPage" });

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
    question: t(`faq.modelASpecific.item${i}.question`),
    answer: t(`faq.modelASpecific.item${i}.answer`),
  }));

  const allFaqEntries = [...sharedFaqEntries, ...modelSpecificFaqEntries];

  const crossSellParagraph = (
    <p className="text-white/80 text-base sm:text-lg max-w-3xl mx-auto">
      {t("indianConditions.crossSellLead")}
      <Link
        href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
        className="text-[#A8C117] hover:underline"
      >
        {t("indianConditions.linkModelB")}
      </Link>
      {t("indianConditions.linkBetweenBAndT")}
      <Link
        href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
        className="text-[#A8C117] hover:underline"
      >
        {t("indianConditions.linkModelT")}
      </Link>
      {t("indianConditions.linkBetweenTAndOpex")}
      <Link
        href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
        className="text-[#A8C117] hover:underline"
      >
        {t("indianConditions.linkOpex")}
      </Link>
      {t("indianConditions.linkBetweenOpexAndConsole")}
      <Link
        href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
        className="text-[#A8C117] hover:underline"
      >
        {t("indianConditions.linkConsole")}
      </Link>
      {t("indianConditions.crossSellSuffix")}
    </p>
  );

  return (
    <div className="min-h-screen">
      <Breadcrumbs items={breadcrumbs} />
      <ProductSchema
        name={t("schema.product.name")}
        description={t("schema.product.description")}
        image={`${siteUrl}/tayproasset/taypro-robotImage.png`}
        brand={t("schema.product.brand")}
        sku={t("schema.product.sku")}
        offers={{
          price: t("schema.product.offers.price"),
          priceCurrency: t("schema.product.offers.priceCurrency"),
          availability: t("schema.product.offers.availabilitySchemaUrl"),
        }}
      />
      <FAQPageSchema faqs={allFaqEntries} />
      <HowToSchema
        name={t("schema.howTo.name")}
        description={t("schema.howTo.description")}
        steps={howToSteps}
        totalTime={t("schema.howTo.totalTime")}
        image={t("schema.howTo.imagePath")}
      />

      <section className="bg-white">
        <Container className="py-12 sm:py-16">
          <div className="min-h-[600px] flex flex-col lg:flex-row relative overflow-hidden">
            <AnimateOnScroll
              animation="fadeInLeft"
              className="bg-[#052638] w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 py-12 sm:py-16"
            >
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold text-white mb-6 leading-tight">
                {t("hero.h1Line1")}
                <br />
                {t("hero.h1Line2")}
              </h1>
              <div className="text-base sm:text-xl text-white leading-relaxed max-w-xl mb-8 sm:mb-9">
                {t("hero.leadBeforeStrong")}
                <strong>{t("hero.leadStrong")}</strong>
                {t("hero.leadAfterStrong")}
                {connectivity}
                {t("hero.leadAfterConnectivity")}
              </div>
              <OpenLeadModalButton
                topic={t("hero.primaryCta.topic")}
                title={t("hero.primaryCta.title")}
                subtitle={t("hero.primaryCta.subtitle")}
                className="bg-[#A8C117] inline-block w-full sm:w-auto sm:min-w-[240px] px-8 sm:px-12 py-4 sm:py-5 text-[#052638] font-medium text-base sm:text-xl text-center transition hover:bg-[#b3cf3d]"
              >
                {t("hero.primaryCta.label")}
              </OpenLeadModalButton>
            </AnimateOnScroll>
            <AnimateOnScroll
              animation="fadeInRight"
              delay={100}
              className="relative w-full lg:w-1/2 min-h-[240px] sm:min-h-[360px] mt-10 lg:mt-0"
            >
              <Image
                alt={t("hero.heroImageAlt")}
                src="/tayprosolarpanel/solar-panel.jpg"
                title={t("hero.heroImageTitle")}
                fill
                className="object-contain"
                priority
              />
            </AnimateOnScroll>
          </div>
        </Container>
      </section>

      <section className="bg-white pt-12 sm:pt-20 pb-4">
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
                  className="text-[#A8C117] hover:underline"
                >
                  {t("overview.p4Blog1")}
                </Link>
                {t("overview.p4Middle")}
                <Link
                  href="/blog/benefits-of-using-solar-panel-cleaning-robot-in-a-solar-plant"
                  className="text-[#A8C117] hover:underline"
                >
                  {t("overview.p4Blog2")}
                </Link>
                {t("overview.p4Suffix")}
              </p>
            </div>
          </AnimateOnScroll>
        </Container>
      </section>

      <section className="bg-[#f4f1e9] py-16 sm:py-20">
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
                className="flex gap-5 bg-white p-6 rounded-lg shadow-sm"
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

      <section className="bg-gradient-to-b from-white to-gray-50 py-20">
        <Container>
          <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
            <div className="text-[#A8C117] text-xl sm:text-2xl font-medium mb-2">
              {t("product360.eyebrow")}
            </div>
            <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-4">
              {t("product360.title")}
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              {t("product360.subtitle")}
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll
            animation="fadeInUp"
            delay={100}
            className="flex justify-center"
          >
            <div className="w-full max-w-4xl">
              <Product360Viewer
                imagePath="/360-degree-images/Model-A/MODEL-A-"
                imageCount={61}
                imagePrefix=""
                imageSuffix=".png"
                startIndex={100}
                width={800}
                height={600}
                className="mx-auto"
                productLabel={t("product360.productLabel")}
              />
            </div>
          </AnimateOnScroll>
        </Container>
      </section>

      <section className="bg-white py-20 sm:pt-32">
        <Container>
          <AnimateOnScroll
            animation="fadeInUp"
            className="text-center text-[#A8C117] text-2xl font-medium mb-2"
          >
            <div>{t("usps.eyebrow")}</div>
          </AnimateOnScroll>
          <AnimateOnScroll
            animation="fadeInUp"
            delay={100}
            className="text-center text-[#052638] font-semibold text-5xl sm:text-6xl mb-14"
          >
            <h2>{t("usps.title")}</h2>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6 justify-items-center sm:justify-items-start">
            {USP_ICONS.map((Icon, idx) => (
              <AnimateOnScroll
                key={idx}
                animation="fadeInUp"
                delay={150 + idx * 50}
                className="flex items-center gap-4 w-full max-w-xs sm:max-w-none"
              >
                <span className="flex items-center justify-center w-15 h-15 shrink-0 border-2 border-[#6ad10b] rounded-xl">
                  <Icon size={40} className="text-[#052638]" />
                </span>
                <span className="text-[#052638] text-xl font-semibold">
                  {t(`usps.items.item${idx}`)}
                </span>
              </AnimateOnScroll>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20 bg-[#f4f7f9]" aria-labelledby="model-a-roi-heading">
        <Container>
          <AnimateOnScroll animation="fadeInUp" className="text-center max-w-3xl mx-auto mb-8">
            <h2
              id="model-a-roi-heading"
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
            <h2 className="text-2xl sm:text-3xl lg:text-6xl font-semibold">
              {t("projects.headingLine1")}
              <br />
              {t("projects.headingLine2")}
              <br />
              {t("projects.headingLine3")}
              <br />
              {t("projects.headingLine4")}
            </h2>
            <div className="text-gray-600 my-6 text-base sm:text-xl italic">
              {t("projects.tagline")}
            </div>
          </AnimateOnScroll>
        </Container>
      </section>

      <ProjectsCardServer useFileProjects showHeader headerText={t("projects.recentProjectsHeader")} />

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

      <section className="pt-24 pb-5 bg-white">
        <Container>
          <AnimateOnScroll animation="fadeInUp">
            <h2 className="text-2xl sm:text-3xl lg:text-6xl font-semibold">
              {t("featuresLongForm.mainHeading")}
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fadeInUp" delay={100}>
            <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              {t("featuresLongForm.aiCleaning.title")}
            </h3>
          </AnimateOnScroll>
          <div className="text-gray-600 my-6 text-base sm:text-xl">
            {t("featuresLongForm.aiCleaning.body")}
          </div>

          <AnimateOnScroll animation="fadeInUp" delay={150}>
            <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              {t("featuresLongForm.microfiber.title")}
            </h3>
          </AnimateOnScroll>
          <div className="text-gray-600 my-6 text-base sm:text-xl">
            {t("featuresLongForm.microfiber.body")}
          </div>

          <AnimateOnScroll animation="fadeInUp" delay={200}>
            <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              {t("featuresLongForm.range.title")}
            </h3>
          </AnimateOnScroll>
          <div className="text-gray-600 my-6 text-base sm:text-xl">
            {t("featuresLongForm.range.body")}
          </div>

          <AnimateOnScroll animation="fadeInUp" delay={250}>
            <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              {t("featuresLongForm.battery.title")}
            </h3>
          </AnimateOnScroll>
          <div className="text-gray-600 my-6 text-base sm:text-xl">
            {t("featuresLongForm.battery.body")}
          </div>

          <AnimateOnScroll animation="fadeInUp" delay={300}>
            <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              {t("featuresLongForm.weather.title")}
            </h3>
          </AnimateOnScroll>
          <div className="text-gray-600 my-6 text-base sm:text-xl">
            {t("featuresLongForm.weather.body")}
          </div>

          <AnimateOnScroll animation="fadeInUp" delay={350}>
            <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              {t("featuresLongForm.connectivity.title")}
            </h3>
          </AnimateOnScroll>
          <div className="text-gray-600 my-6 text-base sm:text-xl">
            {t("featuresLongForm.connectivity.bodyBeforeStrong")}
            <strong>{connectivity}</strong>
            {t("featuresLongForm.connectivity.bodyAfterConnectivityStrong")}
            <strong>{t("featuresLongForm.connectivity.bodyBoldMesh")}</strong>
            {t("featuresLongForm.connectivity.bodyAfterMesh")}
            <strong>{t("featuresLongForm.connectivity.bodyBoldLoRa")}</strong>
            {t("featuresLongForm.connectivity.bodyAfterLoRa")}
          </div>

          <AnimateOnScroll animation="fadeInUp" delay={400}>
            <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              {t("featuresLongForm.edge.title")}
            </h3>
          </AnimateOnScroll>
          <div className="text-gray-600 my-6 text-base sm:text-xl">
            {t("featuresLongForm.edge.body")}
          </div>

          <AnimateOnScroll animation="fadeInUp" delay={450}>
            <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              {t("featuresLongForm.build.title")}
            </h3>
          </AnimateOnScroll>
          <div className="text-gray-600 my-6 text-base sm:text-xl">
            {t("featuresLongForm.build.body")}
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

          <div className="overflow-x-auto">
            <table className="w-full text-left border border-gray-200 text-sm sm:text-base">
              <thead>
                <tr className="bg-[#f4f1e9]">
                  <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                    {t("manualVsAutomatic.tableHeaders.criterion")}
                  </th>
                  <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                    {t("manualVsAutomatic.tableHeaders.manual")}
                  </th>
                  <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#A8C117]">
                    {t("manualVsAutomatic.tableHeaders.modelA")}
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
                        ? `${t(`manualVsAutomatic.rows.row${rowIdx}.modelAPrefix`)}${connectivity}${t(`manualVsAutomatic.rows.row${rowIdx}.modelASuffix`)}`
                        : t(`manualVsAutomatic.rows.row${rowIdx}.modelA`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            <h2>
              {t("specifications.titleLine1")}
              <br />
              {t("specifications.titleLine2")}
            </h2>
          </AnimateOnScroll>
          <div className="w-full bg-white shadow-md overflow-x-auto">
            <table className="w-full text-left border border-gray-300 text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-4 px-6 font-semibold text-base md:text-xl text-[#052638]">
                    {t("specifications.tableHeaders.spec")}
                  </th>
                  <th className="py-4 px-6 font-semibold text-base md:text-xl text-[#052638]">
                    {t("specifications.tableHeaders.details")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {SPEC_ROW_KEYS.map((rowKey) => (
                  <tr key={rowKey}>
                    <td className="py-3 px-6 border-t text-base md:text-lg">
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
        </Container>
      </section>

      <section className="pt-24 pb-5 bg-white">
        <Container>
          <AnimateOnScroll animation="fadeInUp">
            <h2 className="text-2xl sm:text-3xl lg:text-6xl font-semibold">
              {t("advantagesSection.heading")}
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fadeInUp" delay={100}>
            <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              {t("advantagesSection.energy.title")}
            </h3>
          </AnimateOnScroll>
          <div className="text-gray-600 my-6 text-base sm:text-xl">
            {t("advantagesSection.energy.body")}
          </div>

          <AnimateOnScroll animation="fadeInUp" delay={200}>
            <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              {t("advantagesSection.waterless.title")}
            </h3>
          </AnimateOnScroll>
          <div className="text-gray-600 my-6 text-base sm:text-xl">
            {t("advantagesSection.waterless.body")}
          </div>

          <AnimateOnScroll animation="fadeInUp" delay={300}>
            <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              {t("advantagesSection.autonomous.title")}
            </h3>
          </AnimateOnScroll>
          <div className="text-gray-600 my-6 text-base sm:text-xl">
            {t("advantagesSection.autonomous.body")}
          </div>

          <AnimateOnScroll animation="fadeInUp" delay={400}>
            <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              {t("advantagesSection.cost.title")}
            </h3>
          </AnimateOnScroll>
          <div className="text-gray-600 my-6 text-base sm:text-xl">
            {t("advantagesSection.cost.body")}
          </div>

          <AnimateOnScroll animation="fadeInUp" delay={500}>
            <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              {t("advantagesSection.safe.title")}
            </h3>
          </AnimateOnScroll>
          <div className="text-gray-600 my-6 text-base sm:text-xl">
            {t("advantagesSection.safe.body")}
          </div>
        </Container>
      </section>

      <section className="w-full py-24 bg-[#052638]">
        <Container size="narrow">
          <AnimateOnScroll
            animation="fadeInUp"
            className="text-white font-semibold text-3xl sm:text-5xl text-start mb-16"
          >
            <h2>{t("installSection.title")}</h2>
          </AnimateOnScroll>
          <p className="text-white/90 mb-7 text-start text-base sm:text-lg">
            {t("installSection.p1")}
          </p>
          <p className="text-white/90 mb-7 text-start text-base sm:text-lg">
            {t("installSection.p2")}
          </p>
          <p className="text-white/90 mb-7 text-start text-base sm:text-lg">
            {t("installSection.p3")}
          </p>
          <p className="text-white/90 text-start text-base sm:text-lg">
            {t("installSection.p4")}
          </p>
        </Container>
      </section>

      <section className="w-full pt-24 pb-2 bg-white bg-center">
        <Container size="narrow">
          <AnimateOnScroll
            animation="fadeInUp"
            className="font-semibold text-3xl sm:text-5xl md:text-5xl text-start mb-16"
          >
            <h2>{t("roiSection.title")}</h2>
          </AnimateOnScroll>
          <p className="mb-7 text-start text-base sm:text-lg">{t("roiSection.p1")}</p>
          <p className="mb-7 text-start text-base sm:text-lg">
            {t("roiSection.p2BeforeLink")}
            <Link
              href="/solar-panel-cleaning-robot-price-calculator"
              className="text-[#A8C117] underline hover:no-underline"
            >
              {t("roiSection.roiCalculatorLink")}
            </Link>
            {t("roiSection.p2AfterLink")}
          </p>
        </Container>
      </section>

      <section className="w-full pt-24 pb-5 bg-white bg-center">
        <Container size="narrow">
          <AnimateOnScroll
            animation="fadeInUp"
            className="font-semibold text-3xl sm:text-5xl md:text-5xl text-start mb-16"
          >
            <h2>{t("cycleNarrative.title")}</h2>
          </AnimateOnScroll>
          {[...Array(9)].map((_, i) => (
            <p key={i} className="mb-7 text-start text-base sm:text-lg">
              {t(`cycleNarrative.steps.s${i}`)}
            </p>
          ))}
        </Container>
      </section>

      <section className="w-full py-16 bg-white">
        <Container size="narrow">
          <AnimateOnScroll
            animation="fadeInUp"
            className="font-semibold text-center text-[#052638] text-3xl sm:text-5xl md:text-5xl mb-8"
          >
            <h2>{t("faq.title")}</h2>
          </AnimateOnScroll>
          <FAQAccordion faqs={allFaqEntries} variant="classic" />
        </Container>
      </section>

      <ModelCards title={t("modelCards.title")} cards={modelCards} />

      <RequestEstimateForm />
    </div>
  );
}
