import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  Droplet,
  Dumbbell,
  LineChart,
  Hand,
  Brush,
  Move,
  ShieldCheck,
  Wrench,
  Headset,
  Wifi,
  BatteryCharging,
  Sun,
  Settings,
} from "lucide-react";
import { helyxCards, tayproTrustedByStatsStrip } from "@/app/data";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import ProjectsCardServer from "@/app/components/ProjectsCardServer";
import { projectFilterForPage } from "@/lib/cms/project-page-filters";
import { FaqSection } from "@/app/components/FaqSection";
import ProductCards from "@/app/components/ProductCards";
import ResourcesCard from "@/app/components/ResourcesCard";
import CallbackCard from "@/app/components/CallbackCard";
import HeroSection from "@/app/components/Herosection";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import Product360Viewer from "@/app/components/Product360Viewer";
import {
  ProductSchema,
  FAQPageSchema,
  HowToSchema,
} from "@/app/components/StructuredData";
import { Container } from "@/app/components/Container";
import ROICalculatorEmbed from "@/app/components/ROICalculatorEmbed";
import { PerformanceMethodologyFootnote } from "@/app/components/PerformanceMethodologyLink";
import { PerformanceMethodologyNotice } from "@/app/components/PerformanceMethodologyNotice";

import {
  getProductHeroLayout,
  getProductImageUrl,
  productPageImages,
} from "@/lib/products/product-page-images";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const helyxImages = productPageImages("helyx");
const helyxHeroLayout = getProductHeroLayout("helyx");

const HELYX_GALLERY = {
  topView: "/tayprorobots/helyx/top-view.png",
  sideView: "/tayprorobots/helyx/side-view.png",
  front: "/tayprorobots/helyx/front.png",
  zoomedLeft: "/tayprorobots/helyx/zoomed-left.png",
  fieldOperation: "/tayprorobots/helyx/field-operation.jpg",
} as const;

const USP_ICONS = [
  Hand,
  Droplet,
  Brush,
  Dumbbell,
  Move,
  BatteryCharging,
  Settings,
  ShieldCheck,
] as const;

const FEATURE_ICONS = [
  Brush,
  LineChart,
  BatteryCharging,
  Hand,
  ShieldCheck,
  Wrench,
  Dumbbell,
  Sun,
] as const;

const USP_COUNT = 8;
const FEATURE_COUNT = 8;
const SPEC_COUNT = 18;
const STEP_COUNT = 6;
const FAQ_COUNT = 10;
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
const HELYX_VS_GLYDE_ROW_KEYS = [
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
const CERT_CARD_KEYS = ["card0", "card1", "card2"] as const;
const SERVICE_CARD_KEYS = ["card0", "card1", "card2"] as const;

export default async function SemiAutomaticSolarPanelCleaningRobot({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HelyxPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.robots"), href: "/solar-panel-cleaning-system" },
    { name: t("breadcrumbs.current"), href: "" },
  ];

  const helyxUsps = Array.from({ length: USP_COUNT }, (_, i) => ({
    icon: USP_ICONS[i],
    title: t(`usps.${i}.title`),
    description: t(`usps.${i}.description`),
  }));

  const helyxFeatures = Array.from({ length: FEATURE_COUNT }, (_, i) => ({
    icon: FEATURE_ICONS[i],
    title: t(`features.${i}.title`),
    body: t(`features.${i}.body`),
  }));

  const helyxSpecs = Array.from({ length: SPEC_COUNT }, (_, i) => ({
    label: t(`specs.${i}.label`),
    value: t(`specs.${i}.value`),
  }));

  const helyxSteps = Array.from({ length: STEP_COUNT }, (_, i) => ({
    name: t(`steps.${i}.name`),
    text: t(`steps.${i}.text`),
  }));

  const helyxFaqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    question: t(`faqs.${i}.question`),
    answer: t(`faqs.${i}.answer`),
  }));

  const manualVsRows = MANUAL_VS_ROW_KEYS.map((key) => ({
    criterion: t(`manualVsRobotic.${key}.criterion`),
    manual: t(`manualVsRobotic.${key}.manual`),
    robot: t(`manualVsRobotic.${key}.robot`),
  }));

  const helyxVsGlydeRows = HELYX_VS_GLYDE_ROW_KEYS.map((key) => ({
    criterion: t(`helyxVsGlyde.${key}.criterion`),
    helyx: t(`helyxVsGlyde.${key}.helyx`),
    glyde: t(`helyxVsGlyde.${key}.glyde`),
  }));

  const certificationCards = CERT_CARD_KEYS.map((key) => ({
    title: t(`certifications.${key}Title`),
    body: t(`certifications.${key}Body`),
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

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <ProductSchema
        name={t("schema.productName")}
        description={t("schema.productDescription")}
        image={getProductImageUrl("helyx", siteUrl)}
        brand="Taypro"
        sku="HELYX"
        offerPriceKey="helyx"
      />
      <FAQPageSchema faqs={helyxFaqs} />
      <HowToSchema
        name={t("schema.howToName")}
        description={t("schema.howToDescription")}
        steps={helyxSteps}
        totalTime="PT2H"
        image={helyxImages.schema}
      />

      <div className="min-h-screen overflow-x-hidden">
        <HeroSection
          title={t("hero.title")}
          subtitle={
            <>
              {t("hero.subtitleBefore")}{" "}
              <strong>{t("hero.subtitleStrong")}</strong>
              {t("hero.subtitleAfter")}
            </>
          }
          imgSrc={helyxImages.hero}
          imgAlt={t("hero.imgAlt")}
          imageAspectRatio={helyxHeroLayout.aspectRatio}
          imagePresentation={helyxHeroLayout.presentation}
          ctaHref="/contact"
          ctaText={t("hero.primaryCta.label")}
          ctaTopic={t("hero.primaryCta.topic")}
          ctaTitle={t("hero.primaryCta.title")}
          ctaSubtitle={t("hero.primaryCta.subtitle")}
        />

        {/* PRODUCT OVERVIEW / SEO INTRO */}
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
                  {t("overview.p1After")}
                  <strong>{t("overview.p1HoursStrong")}</strong>
                  {t("overview.p1AfterHours")}
                </p>
                <div>
                  {t("overview.p2Before")}
                  <strong>{t("overview.p2BrushesStrong")}</strong>
                  {t("overview.p2Mid")}
                  <strong>
                    {t("overview.p2DustStrong")}
                    <PerformanceMethodologyFootnote />
                  </strong>
                  {t("overview.p2AfterDust")}
                  <strong>{t("overview.p2RangeStrong")}</strong>
                  {t("overview.p2AfterRange")}
                </div>
                <PerformanceMethodologyNotice className="mt-4" />
                <div>
                  {t("overview.p3Before")}
                  <strong>{t("overview.p3EdgeStrong")}</strong>
                  {t("overview.p3Mid")}
                  <strong>{t("overview.p3BridgeStrong")}</strong>
                  {t("overview.p3AfterBridge")}
                </div>
                <div>
                  {t("overview.p4Before")}
                  <strong>{t("overview.p4TiltStrong")}</strong>
                  {t("overview.p4Mid")}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                    className="brand-inline-link"
                  >
                    {t("overview.linkGlyde")}
                  </Link>
                  {t("overview.p4BetweenAT")}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                    className="brand-inline-link"
                  >
                    {t("overview.linkGlydeX")}
                  </Link>
                  {t("overview.p4Suffix")}
                </div>
                <div>
                  {t("overview.p5Prefix")}
                  <Link
                    href="/blog/what-are-the-different-methods-used-for-solar-panel-cleaning"
                    className="brand-inline-link"
                  >
                    {t("overview.linkBlogMethods")}
                  </Link>
                  {t("overview.p5Mid")}
                  <Link href="/blog" className="brand-inline-link">
                    {t("overview.linkBlog")}
                  </Link>
                  {t("overview.p5Suffix")}
                </div>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* 360 Viewer */}
        <section className="bg-gradient-to-b from-white to-gray-50 py-16">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
              <div className="text-[#A8C117] text-xl sm:text-2xl font-medium mb-2">
                {t("product360.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-4">
                {t("product360.title")}
              </h2>
              <div className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                {t("product360.subtitle")}
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll
              animation="fadeInUp"
              delay={100}
              className="flex justify-center"
            >
              <div className="w-full max-w-4xl">
                <Product360Viewer
                  imagePath="/360-degree-images/helyx/0001-MB-2000-1224-"
                  imageCount={51}
                  imagePrefix=""
                  imageSuffix=".png"
                  startIndex={100}
                  className="mx-auto"
                  productLabel={t("product360.productLabel")}
                />
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Product gallery */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
              {(
                [
                  {
                    src: HELYX_GALLERY.topView,
                    alt: t("gallery.topAlt"),
                    caption: t("gallery.topCaption"),
                    delay: 60,
                  },
                  {
                    src: HELYX_GALLERY.sideView,
                    alt: t("gallery.sideAlt"),
                    caption: t("gallery.sideCaption"),
                    delay: 120,
                  },
                  {
                    src: HELYX_GALLERY.front,
                    alt: t("gallery.frontAlt"),
                    caption: t("gallery.frontCaption"),
                    delay: 150,
                  },
                  {
                    src: HELYX_GALLERY.zoomedLeft,
                    alt: t("gallery.zoomedLeftAlt"),
                    caption: t("gallery.zoomedLeftCaption"),
                    delay: 180,
                  },
                ] as const
              ).map((item) => (
                <AnimateOnScroll
                  key={item.alt}
                  animation="fadeInUp"
                  delay={item.delay}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 768px) 100vw, 480px"
                    />
                  </div>
                  <p className="text-center text-gray-500 text-sm mt-3">
                    {item.caption}
                  </p>
                </AnimateOnScroll>
              ))}
            </div>
            <AnimateOnScroll
              animation="fadeInUp"
              delay={210}
              className="max-w-5xl mx-auto mt-8 sm:mt-10"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <Image
                  src={HELYX_GALLERY.fieldOperation}
                  alt={t("gallery.fieldAlt")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 960px"
                />
              </div>
              <p className="text-center text-gray-500 text-sm mt-3">
                {t("gallery.fieldCaption")}
              </p>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* HOW HELYX WORKS */}
        <section className="w-full bg-white py-20">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("howItWorks.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("howItWorks.title")}
              </h2>
              <div className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                {t("howItWorks.subtitle")}
              </div>
            </AnimateOnScroll>

            <ol className="space-y-6">
              {helyxSteps.map((step, idx) => (
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
                    <div className="text-gray-600 text-base leading-relaxed">
                      {step.text}
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </ol>
          </Container>
        </section>

        {/* USP GRID */}
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
              {helyxUsps.map((usp) => {
                const Icon = usp.icon;
                return (
                  <AnimateOnScroll
                    key={usp.title}
                    animation="fadeInUp"
                    className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-start"
                  >
                    <div className="w-15 h-15 flex items-center justify-center bg-[#A8C117]/10 rounded-md mb-4">
                      <Icon className="text-[#A8C117] w-7 h-7" />
                    </div>
                    <h3 className="text-[#052638] font-semibold text-lg mb-2">
                      {usp.title}
                    </h3>
                    <div className="text-gray-600 text-sm leading-relaxed">
                      {usp.description}
                    </div>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        {/* DETAILED FEATURES */}
        <section className="w-full bg-white py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("featuresSection.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("featuresSection.title")}
              </h2>
              <div className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                {t("featuresSection.subtitle")}
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
              {helyxFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <AnimateOnScroll
                    key={f.title}
                    animation="fadeInUp"
                    className="flex gap-5"
                  >
                    <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-[#A8C117]/10 rounded-md">
                      <Icon className="text-[#A8C117] w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[#052638] font-semibold text-xl mb-2">
                        {f.title}
                      </h3>
                      <div className="text-gray-600 text-base leading-relaxed">
                        {f.body}
                      </div>
                    </div>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        {/* CERTIFICATIONS */}
        <section className="w-full bg-[#f4f1e9] py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("certifications.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("certifications.title")}
              </h2>
              <div className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                {t("certifications.subtitle")}
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-8">
              {certificationCards.map((c) => (
                <AnimateOnScroll
                  key={c.title}
                  animation="fadeInUp"
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <ShieldCheck className="text-[#A8C117] w-9 h-9 mb-3" />
                  <h3 className="text-[#052638] font-semibold text-xl mb-2">
                    {c.title}
                  </h3>
                  <div className="text-gray-600 text-base leading-relaxed">
                    {c.body}
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* TRUST STATS STRIP */}
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
                <AnimateOnScroll
                  key={idx}
                  animation="fadeInUp"
                  className="px-4"
                >
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

        {/* SERVICE & MAINTENANCE PROMISE */}
        <section className="w-full bg-white py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("servicePromise.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("servicePromise.title")}
              </h2>
              <div className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                {t("servicePromise.subtitle")}
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {serviceCards.map((p) => {
                const Icon = p.icon;
                return (
                  <AnimateOnScroll
                    key={p.title}
                    animation="fadeInUp"
                    className="bg-[#f4f1e9] p-6 rounded-lg"
                  >
                    <Icon className="text-[#A8C117] w-9 h-9 mb-3" />
                    <h3 className="text-[#052638] font-semibold text-xl mb-2">
                      {p.title}
                    </h3>
                    <div className="text-gray-600 text-base leading-relaxed">
                      {p.body}
                    </div>
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

        {/* SPECIFICATIONS */}
        <section
          id="helyx-specs"
          className="w-full bg-white pt-20 pb-10 scroll-mt-24"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="font-semibold text-[#052638] text-center text-3xl sm:text-5xl md:text-6xl mb-12 sm:mb-15"
            >
              <h2>
                {t("specifications.titleLine1")} <br /> {t("specifications.titleLine2")}
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
                  {helyxSpecs.map((row) => (
                    <tr key={row.label}>
                      <td className="py-3 px-6 border-t text-base font-medium">
                        {row.label}
                      </td>
                      <td className="py-3 px-6 border-t text-base">
                        {row.value}
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

        {/* ROBOTIC vs MANUAL CLEANING */}
        <section className="w-full bg-[#f4f1e9] py-20">
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="text-center mb-10 sm:mb-14"
            >
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("manualVsRobotic.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("manualVsRobotic.title")}
              </h2>
              <div className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                {t("manualVsRobotic.subtitle")}
              </div>
            </AnimateOnScroll>

            <div className="overflow-x-auto">
              <table className="w-full text-left border border-gray-200 text-sm sm:text-base bg-white">
                <thead>
                  <tr className="bg-white">
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                      {t("manualVsRobotic.criterion")}
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                      {t("manualVsRobotic.manual")}
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#A8C117]">
                      {t("manualVsRobotic.robot")}
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
                        {row.robot}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>

        {/* HELYX vs GLYDE COMPARISON */}
        <section className="w-full bg-white py-20">
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="text-center mb-10 sm:mb-14"
            >
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("helyxVsGlyde.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("helyxVsGlyde.title")}
              </h2>
              <div className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                {t("helyxVsGlyde.subtitle")}
              </div>
            </AnimateOnScroll>

            <div className="overflow-x-auto">
              <table className="w-full text-left border border-gray-200 text-sm sm:text-base">
                <thead>
                  <tr className="bg-[#f4f1e9]">
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                      {t("helyxVsGlyde.criterion")}
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#A8C117]">
                      {t("helyxVsGlyde.helyxHeader")}
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                      {t("helyxVsGlyde.glydeHeader")}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#052638]">
                  {helyxVsGlydeRows.map((row) => (
                    <tr key={row.criterion}>
                      <td className="py-3 px-4 sm:px-6 border-t text-base font-medium align-top">
                        {row.criterion}
                      </td>
                      <td className="py-3 px-4 sm:px-6 border-t text-base align-top">
                        {row.helyx}
                      </td>
                      <td className="py-3 px-4 sm:px-6 border-t text-base text-gray-600 align-top">
                        {row.glyde}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AnimateOnScroll animation="fadeInUp" className="text-center mt-10">
              <div className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
                {t("helyxVsGlyde.crossSellLead")}
                <Link
                  href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                  className="brand-inline-link"
                >
                  {t("helyxVsGlyde.linkGlydeX")}
                </Link>
                {t("helyxVsGlyde.crossSellMid")}
                <Link
                  href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                  className="brand-inline-link"
                >
                  {t("helyxVsGlyde.linkOpex")}
                </Link>
                {t("helyxVsGlyde.crossSellSuffix")}
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <section className="bg-[#f4f1e9] py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight max-w-4xl mx-auto">
                {t("roiBand.title")}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-5">
                {t("roiBand.bodyBeforeSpan")}
                <strong>{t("roiBand.bodySpan")}</strong>
                {t("roiBand.bodyAfterSpan")}
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeInUp" delay={100}>
              <ROICalculatorEmbed />
            </AnimateOnScroll>
          </Container>
        </section>

        {/* BUILT FOR INDIAN CONDITIONS */}
        <section className="w-full bg-[#052638] py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("indianConditions.eyebrow")}
              </div>
              <h2 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("indianConditions.title")}
              </h2>
              <div className="text-white/80 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                {t("indianConditions.subtitle")}
              </div>
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
                  <div className="text-white/80 text-base leading-relaxed">
                    {card.body}
                  </div>
                </AnimateOnScroll>
              ))}
            </div>

            <AnimateOnScroll animation="fadeInUp" className="text-center mt-12">
              <div className="text-white/80 text-base sm:text-lg max-w-3xl mx-auto">
                {t("indianConditions.crossSellLead")}
                <Link
                  href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                  className="brand-inline-link"
                >
                  {t("indianConditions.linkGlyde")}
                </Link>
                {t("indianConditions.linkBetweenAT")}
                <Link
                  href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                  className="brand-inline-link"
                >
                  {t("indianConditions.linkGlydeX")}
                </Link>
                {t("indianConditions.linkBetweenTOpex")}
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
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* PROJECTS, dynamic */}
        <ProjectsCardServer
          useFileProjects
          showHeader
          headerText=""
          filter={projectFilterForPage("helyx")}
          locale={locale}
        />

        <FaqSection
          id="helyx-faq-heading"
          title={t("faqSection.title")}
          subtitle={t("faqSection.subtitle")}
          faqs={helyxFaqs}
        />

        <ResourcesCard />

        <ProductCards title={t("misc.productCardsTitle")} cards={helyxCards} />

        <RequestEstimateForm />
      </div>
    </>
  );
}
