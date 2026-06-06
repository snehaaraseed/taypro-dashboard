"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  founders,
  metrics,
  robots,
  tayproMarketingImpactStats,
  tayproTrustedByStatsStrip,
} from "@/app/data";
import { Linkedin } from "lucide-react";
import CallbackCard from "@/app/components/CallbackCard";
import ModuleManufacturerTrust from "@/app/components/ModuleManufacturerTrust";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import { FaqSection } from "@/app/components/FaqSection";
import { FAQPageSchema } from "@/app/components/StructuredData";
import { getProduct, getProductHeroAspectRatio } from "@/lib/products/catalog";

const STAT_STRIP_LABEL_KEYS = [
  "statsStrip.robotCapacityDeployed",
  "statsStrip.co2ReducedAnnually",
  "statsStrip.waterSavedAnnually",
  "statsStrip.robotsManufacturedPerMonth",
] as const;

const STORY_KEYS = ["whoWeAre", "vision", "mission"] as const;

const METRIC_LABEL_KEYS = [
  "scale.cleaningEfficiency",
  "scale.manufacturingCapacity",
  "scale.warehouses",
] as const;

const FOUNDER_ROLE_KEYS = [
  "leadership.roleCeo",
  "leadership.roleCoo",
  "leadership.roleCto",
  "leadership.roleCmo",
] as const;

const ROBOT_DESC_KEY: Record<string, string> = {
  GLYDE: "glyde",
  HELYX: "helyx",
  "GLYDE-X": "glydeX",
  "Taypro Opex": "tayproOpex",
  "NECTYR": "nectyr",
};

const PARTNER_STEP_KEYS = ["step0", "step1", "step2", "step3"] as const;

const FAQ_KEYS = ["0", "1", "2", "3", "4", "5", "6"] as const;

const BRAND_VALUE_KEYS = [
  "brandValues.value0",
  "brandValues.value1",
  "brandValues.value2",
  "brandValues.value3",
  "brandValues.value4",
  "brandValues.value5",
  "brandValues.value6",
] as const;

const RESOURCE_ITEMS = [
  {
    key: "item0",
    imgSrc: "/tayproenergyresource/taypro-energy-resource1.webp",
    href: "/blog/the-complete-guide-to-solar-panel-maintenance",
  },
  {
    key: "item1",
    imgSrc: "/tayproenergyresource/taypro-energy-resource2.webp",
    href: "/blog/new-solar-panel-technologies-2025",
  },
] as const;

const EXPLORE_LINKS = [
  { labelKey: "explore.link0", href: "/projects" },
  { labelKey: "explore.link1", href: "/utility-scale-solar-operations" },
  { labelKey: "explore.link2", href: "/cleaning-technology" },
  { labelKey: "explore.link3", href: "/solar-panel-cleaning-system" },
  { labelKey: "explore.link4", href: "/contact" },
] as const;

export default function AboutUsPage() {
  const t = useTranslations("CompanyPage");
  const tCommon = useTranslations("Common");

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.aboutUs"), href: "" },
  ];

  const companyFaqs = FAQ_KEYS.map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  const partnerSteps = PARTNER_STEP_KEYS.map((key, idx) => ({
    step: String(idx + 1).padStart(2, "0"),
    title: t(`partnerJourney.${key}.title`),
    description: t(`partnerJourney.${key}.description`),
  }));

  return (
    <>
      <FAQPageSchema faqs={companyFaqs} />
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen overflow-x-hidden">
        <div className="relative min-h-[50vh] flex flex-col items-center justify-start overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/tayprobglayout/taypro-project.png')",
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-white/90 sm:bg-white/85"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/75"
            aria-hidden
          />

          <AnimateOnScroll
            animation="fadeInUp"
            eager
            className="relative z-10 pt-10 px-4 max-w-4xl mx-auto pb-28"
          >
            <div className="text-[#A8C117] text-center text-[16px] mb-4 uppercase tracking-wide">
              {t("hero.eyebrow")}
            </div>
            <h1 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-4 text-center leading-tight">
              {t("hero.title")}
            </h1>
            <p className="text-[#5a8f00] text-center text-lg md:text-xl font-medium mb-6">
              {t("hero.subtitle")}
            </p>
            <div className="text-[#22405a] text-center text-lg md:text-xl leading-relaxed">
              {t("hero.bodyBeforeLink")}{" "}
              <Link
                href="/solar-panel-cleaning-system"
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                {t("hero.bodyLink")}
              </Link>{" "}
              {t("hero.bodyAfterLink")}
            </div>
          </AnimateOnScroll>

          <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden pointer-events-none">
            <svg
              className="w-full h-24 md:h-40"
              viewBox="0 0 1440 320"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path fill="#052638" d="M0,224L1440,96L1440,320L0,320Z" />
            </svg>
          </div>
        </div>

        <div className="w-full py-14 md:py-16 bg-[#052638]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("statsStrip.eyebrow")}
              </div>
              <h2 className="text-white font-semibold text-2xl md:text-3xl">
                {t("statsStrip.heading")}
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 text-center">
              {[...tayproTrustedByStatsStrip].map((stat, idx) => (
                <AnimateOnScroll
                  key={stat.label}
                  animation="fadeInUp"
                  delay={idx * 80}
                  className="px-2"
                >
                  <div className="text-[#A8C117] font-semibold text-3xl sm:text-4xl mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/80 text-sm sm:text-base">
                    {t(STAT_STRIP_LABEL_KEYS[idx])}
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </div>

        <div className="w-full py-16 bg-[#073448] flex justify-center">
          <div className="max-w-6xl w-full mx-4 md:mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimateOnScroll
              animation="fadeInLeft"
              delay={0}
              className="bg-white px-10 py-10 flex flex-col justify-between shadow-lg min-h-[600px]"
            >
              <div>
                <h3 className="text-[#073448] font-semibold text-2xl mb-8">
                  {t("brandValues.heading")}
                </h3>
                <div
                  className="space-y-5 text-lg text-[#245165] mb-10"
                  role="list"
                >
                  {BRAND_VALUE_KEYS.map((key) => (
                    <div
                      className="flex items-center gap-2"
                      key={key}
                      role="listitem"
                    >
                      <svg width="24" height="24" fill="none" aria-hidden="true">
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke="#7be117"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {t(key)}
                    </div>
                  ))}
                </div>
              </div>
              <Link
                href="/solar-panel-cleaning-system"
                title={t("brandValues.ctaTitle")}
              >
                <div className="bg-[#96DB00] text-[#073448] text-lg font-medium p-4 rounded-md hover:bg-[#91bc00] hover:text-white transition mt-4 cursor-pointer text-center">
                  {t("brandValues.cta")}
                </div>
              </Link>
            </AnimateOnScroll>

            <AnimateOnScroll
              animation="fadeInUp"
              delay={100}
              className="bg-[#75AA00] px-8 py-10 flex flex-col justify-center text-white min-h-[600px]"
            >
              <div className="mb-12">
                <h3 className="mb-3 text-2xl flex leading-relaxed">
                  {t("sustainability.titleLine1")}
                  <br />
                  {t("sustainability.titleLine2")}
                  <br />
                  {t("sustainability.titleLine3")}
                </h3>
                <div className="text-white/95 text-base leading-relaxed mb-4">
                  {t("sustainability.body")}
                </div>
                <Link href="/projects" title={t("sustainability.exploreProjectsTitle")}>
                  <div className="hover:text-[#caed7f] text-lg underline underline-offset-4 mb-2 cursor-pointer">
                    {t("sustainability.exploreProjects")}
                  </div>
                </Link>
              </div>
              <div className="mt-4 mb-6">
                <div className="text-6xl font-semibold mb-2">
                  {tayproMarketingImpactStats.waterSavedAnnually.value}
                </div>
                <div className="text-lg">
                  {t("sustainability.waterSavedLabel")}
                </div>
              </div>
              <div className="mb-6">
                <div className="text-5xl font-semibold mb-2">
                  {tayproMarketingImpactStats.extraCleanEnergyAnnually.value}
                </div>
                <div className="text-lg">
                  {t("sustainability.extraGenerationLabel")}
                </div>
              </div>
              <div>
                <div className="text-5xl font-semibold mb-2">
                  {tayproMarketingImpactStats.co2ReducedAnnually.value}
                </div>
                <div className="text-lg">
                  {t("sustainability.co2ReducedLabel")}
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll
              animation="fadeInRight"
              delay={200}
              className="bg-white flex flex-col shadow-lg min-h-[600px] overflow-hidden"
            >
              <div
                className="relative w-full bg-[#0a2a38] px-6 py-8"
                style={{ aspectRatio: getProductHeroAspectRatio("glydeX") }}
              >
                <Image
                  src={getProduct("glydeX").imagePath}
                  alt={t("sustainability.glydeXImageAlt")}
                  title={t("sustainability.glydeXImageTitle")}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="px-10 py-10 flex flex-col justify-start flex-grow">
                <div className="text-[#75AA00] font-semibold text-lg mb-2">
                  {t("sustainability.communityEyebrow")}
                </div>
                <h3 className="text-[#073448] text-xl font-medium leading-relaxed">
                  {t("sustainability.communityHeading")}
                </h3>
                <div className="mt-4 text-[#245165] text-base leading-relaxed">
                  {t("sustainability.communityBody")}
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>

        <div
          id="investors"
          className="w-full py-16 md:py-20 bg-[#052638] px-4 sm:px-6 lg:px-8 scroll-mt-24"
          aria-labelledby="company-investors-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                {t("investors.eyebrow")}
              </p>
              <h2
                id="company-investors-heading"
                className="text-white font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("investors.heading")}
              </h2>
              <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                {t("investors.body")}
              </p>
            </AnimateOnScroll>
            <ul className="max-w-2xl mx-auto space-y-4 mb-10 text-gray-300 text-sm md:text-base leading-relaxed">
              {(["bullet0", "bullet1", "bullet2"] as const).map((key) => (
                <li key={key} className="flex gap-3">
                  <span className="text-[#A8C117] font-bold shrink-0" aria-hidden>
                    ✓
                  </span>
                  {t(`investors.${key}`)}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex justify-center px-6 py-3 rounded-lg bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
              >
                {t("investors.ctaContact")}
              </Link>
              <Link
                href="/solar-panel-cleaning-system/orion-plant-intelligence-platform"
                className="inline-flex justify-center px-6 py-3 rounded-lg border border-white/30 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
              >
                {t("investors.ctaOrion")}
              </Link>
            </div>
          </Container>
        </div>

        <div
          className="w-full py-12 md:py-16 bg-[#f4f7f9] border-y border-gray-200 px-4 sm:px-6 lg:px-8"
          aria-labelledby="company-credibility-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-8">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                {t("credibility.eyebrow")}
              </p>
              <h2
                id="company-credibility-heading"
                className="text-[#052638] font-semibold text-2xl md:text-3xl"
              >
                {t("credibility.heading")}
              </h2>
            </AnimateOnScroll>
            <ul className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-[#27415c] text-sm md:text-base">
              {(["item0", "item1", "item2", "item3"] as const).map((key) => (
                <li key={key} className="flex gap-3 rounded-xl bg-white border border-gray-100 px-4 py-3 shadow-sm">
                  <span className="text-[#A8C117] font-bold shrink-0" aria-hidden>
                    ✓
                  </span>
                  {t(`credibility.${key}`)}
                </li>
              ))}
            </ul>
            <AnimateOnScroll animation="fadeInUp" className="max-w-xl mx-auto text-center">
              <p className="text-[#052638] font-semibold text-lg mb-1">
                {t("credibility.awardTitle")}
              </p>
              <p className="text-[#27415c] text-sm md:text-base mb-3">
                {t("credibility.awardBody")}
              </p>
              <Link
                href="/blog/mint-tech4good-awards-2024-taypros-green-ai-solutions-win-big-in-mumbai-india"
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                {t("credibility.awardLink")}
              </Link>
            </AnimateOnScroll>
          </Container>
        </div>

        <div
          className="w-full py-16 md:py-24 bg-white px-4 sm:px-6 lg:px-0 overflow-x-hidden"
          aria-labelledby="company-story-heading"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            <AnimateOnScroll animation="fadeInUp" className="mb-12 md:mb-16">
              <h2
                id="company-story-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3"
              >
                {t("story.heading")}
              </h2>
              <div className="text-[#27415c] text-lg max-w-3xl leading-relaxed">
                {t("story.intro")}
              </div>
            </AnimateOnScroll>
            {STORY_KEYS.map((key, idx) => (
              <AnimateOnScroll
                key={key}
                animation="fadeInUp"
                delay={idx * 100}
                className={`grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 items-start mb-10 ${
                  idx !== STORY_KEYS.length - 1
                    ? "border-b border-gray-200 pb-10"
                    : ""
                }`}
              >
                <div className="md:col-span-1 text-[#b2cb19] text-xl font-medium pt-1 md:pt-3">
                  {t(`story.${key}.label`)}
                </div>
                <div className="md:col-span-4">
                  <h3 className="text-[#052638] font-semibold text-2xl sm:text-3xl md:text-4xl leading-tight">
                    {t(`story.${key}.heading`)}
                  </h3>
                  <div className="mt-4 text-[#27415c] text-base md:text-lg leading-relaxed">
                    {t(`story.${key}.body`)}
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>

        <div
          className="w-full py-16 md:py-20 bg-[#f4f7f9] px-4 sm:px-6"
          aria-labelledby="company-solutions-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mb-10">
              <h2
                id="company-solutions-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("solutions.heading")}
              </h2>
              <div className="text-[#27415c] text-lg leading-relaxed">
                {t("solutions.bodyBeforeLink")}{" "}
                <Link
                  href="/cleaning-technology"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  {t("solutions.bodyLink")}
                </Link>
                {t("solutions.bodyAfterLink")}
              </div>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {robots.map((robot, idx) => {
                const descKey = ROBOT_DESC_KEY[robot.model];
                return (
                  <AnimateOnScroll
                    key={robot.model}
                    animation="fadeInUp"
                    delay={idx * 80}
                  >
                    <Link
                      href={robot.href}
                      className="group flex flex-col h-full rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm hover:border-[#A8C117] hover:shadow-md transition"
                    >
                      <div className="relative h-44 w-full bg-[#f0f4f6]">
                        <Image
                          src={robot.imgPath}
                          alt={t("solutions.robotImageAlt", { model: robot.model })}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-[#052638] font-semibold text-lg mb-2 group-hover:text-[#5a8f00] transition-colors">
                          {robot.model}
                        </h3>
                        <div className="text-[#27415c] text-sm leading-relaxed flex-1">
                          {descKey
                            ? t(`solutions.robots.${descKey}`)
                            : robot.description}
                        </div>
                        <span className="mt-4 text-[#5a8f00] font-medium text-sm group-hover:underline">
                          {t("solutions.viewRobot", { model: robot.model })}
                        </span>
                      </div>
                    </Link>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </div>

        <div className="w-full py-30 bg-white px-4 sm:px-6 lg:px-0 overflow-x-hidden">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <AnimateOnScroll
              animation="fadeInLeft"
              delay={100}
              className="flex justify-center items-center"
            >
              <div className="w-[520px] h-[460px] relative overflow-hidden shadow-md">
                <Image
                  src="/tayprosolarpanel/taypro-about1.jpg"
                  alt={t("builtForSites.aboutImageAlt")}
                  title={t("builtForSites.aboutImageTitle")}
                  fill
                  sizes="(max-width: 768px) 100vw, 520px"
                  className="object-cover"
                  priority
                />
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll
              animation="fadeInRight"
              delay={100}
              className="flex flex-col justify-center items-center md:items-start text-center md:text-left"
            >
              <h2 className="text-[#b2cb19] text-2xl font-medium mb-4">
                {t("builtForSites.heading")}
              </h2>
              <div className="text-[#27415c] text-lg max-w-xl leading-relaxed mb-4">
                {t("builtForSites.paragraph1")}
              </div>
              <div className="text-[#27415c] text-lg max-w-xl leading-relaxed">
                {t("builtForSites.paragraph2BeforeGlyde")}{" "}
                <Link
                  href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  {t("builtForSites.glydeLink")}
                </Link>{" "}
                {t("builtForSites.paragraph2Middle")}{" "}
                <Link
                  href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  {t("builtForSites.glydeXLink")}
                </Link>
                {t("builtForSites.paragraph2After")}
              </div>
            </AnimateOnScroll>
          </div>
        </div>

        <ModuleManufacturerTrust />

        <div className="w-full py-30 bg-white px-4 sm:px-6 lg:px-0 overflow-x-hidden">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <AnimateOnScroll
              animation="fadeInLeft"
              delay={100}
              className="flex flex-col justify-center items-center md:items-start text-center md:text-left order-2 md:order-1"
            >
              <h2 className="text-[#b2cb19] text-2xl font-medium mb-4">
                {t("collaboration.heading")}
              </h2>
              <div className="text-[#27415c] text-lg max-w-xl leading-relaxed mb-4">
                {t("collaboration.paragraph1")}
              </div>
              <div className="text-[#27415c] text-lg max-w-xl leading-relaxed">
                {t("collaboration.paragraph2Before")}{" "}
                <span className="whitespace-nowrap">{metrics[1].value}</span>{" "}
                {t("collaboration.paragraph2Middle")}{" "}
                <span className="whitespace-nowrap">{metrics[2].value}</span>{" "}
                {t("collaboration.paragraph2AfterWarehouses")}{" "}
                <Link
                  href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  {t("collaboration.nectyrLink")}
                </Link>
                {t("collaboration.paragraph2End")}
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll
              animation="fadeInRight"
              delay={100}
              className="flex justify-center items-center order-1 md:order-2"
            >
              <div className="w-[520px] h-[460px] relative overflow-hidden shadow-md">
                <Image
                  src="/tayprosolarpanel/taypro-about2.webp"
                  alt={t("collaboration.about2ImageAlt")}
                  title={t("collaboration.about2ImageTitle")}
                  fill
                  sizes="(max-width: 768px) 100vw, 520px"
                  className="object-cover"
                  priority
                />
              </div>
            </AnimateOnScroll>
          </div>
        </div>

        <div
          className="w-full py-16 md:py-20 bg-[#052638] px-4 sm:px-6"
          aria-labelledby="partner-journey-heading"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="max-w-3xl mx-auto text-center mb-12"
            >
              <div className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("partnerJourney.eyebrow")}
              </div>
              <h2
                id="partner-journey-heading"
                className="text-white font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("partnerJourney.heading")}
              </h2>
              <div className="text-white/85 text-lg leading-relaxed">
                {t("partnerJourney.intro")}
              </div>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {partnerSteps.map((step, idx) => (
                <AnimateOnScroll
                  key={step.step}
                  animation="fadeInUp"
                  delay={idx * 100}
                >
                  <div className="rounded-lg border border-white/15 bg-white/5 p-6 md:p-8 h-full">
                    <span className="text-[#A8C117] font-semibold text-2xl mb-3 block">
                      {step.step}
                    </span>
                    <h3 className="text-white font-semibold text-xl mb-3">
                      {step.title}
                    </h3>
                    <div className="text-white/80 leading-relaxed">
                      {step.description}
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
            <AnimateOnScroll
              animation="fadeInUp"
              delay={400}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              <Link
                href="/projects"
                className="inline-flex items-center justify-center min-h-[48px] border border-white/60 text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition"
              >
                {t("partnerJourney.viewProjects")}
              </Link>
              <Link
                href="/solar-panel-cleaning-robot-price-calculator#calculator"
                className="inline-flex items-center justify-center min-h-[48px] bg-[#b2cb19] text-[#22405a] font-medium px-6 py-3 rounded-lg hover:bg-lime-500 transition"
              >
                {t("partnerJourney.roiCalculator")}
              </Link>
            </AnimateOnScroll>
          </Container>
        </div>

        <div className="w-full py-16 md:py-24 bg-white px-4 sm:px-6 lg:px-0 overflow-x-hidden">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3">
              {t("scale.heading")}
            </h2>
            <div className="text-[#27415c] text-lg leading-relaxed">
              {t("scale.body")}
            </div>
          </div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 text-center">
            {metrics.map((stat, idx) => (
              <AnimateOnScroll
                key={stat.label}
                animation="scaleIn"
                delay={idx * 150}
                className="flex flex-col items-center"
              >
                <span className="text-[#b2cb19] font-semibold text-6xl mb-2">
                  {stat.value}
                </span>
                <span className="text-[#b2cb19] text-lg">
                  {t(METRIC_LABEL_KEYS[idx])}
                </span>
              </AnimateOnScroll>
            ))}
          </div>
        </div>

        <div className="w-full py-30 px-4 sm:px-6 lg:px-0 overflow-x-hidden bg-[#073448]">
          <div className="max-w-7xl mx-auto">
            <AnimateOnScroll animation="fadeInUp" className="text-white mb-8">
              <h2 className="font-semibold text-4xl mb-3">
                {t("leadership.heading")}
              </h2>
              <div className="text-white/90 text-lg max-w-3xl font-normal leading-relaxed">
                {t("leadership.body")}
              </div>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 team-cards-container">
              {founders.map((f, idx) => {
                const role = t(FOUNDER_ROLE_KEYS[idx]);
                return (
                  <AnimateOnScroll
                    key={f.name}
                    animation="scaleIn"
                    delay={idx * 150}
                  >
                    <div
                      className="team-card relative group overflow-hidden shadow-2xl flex flex-col bg-white items-center rounded-lg hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
                      style={{ willChange: "transform, opacity" }}
                    >
                      <div
                        className="absolute inset-0 z-10 pointer-events-none rounded-lg transition-opacity group-hover:opacity-90"
                        style={{
                          background:
                            "radial-gradient(circle at center, transparent 0%, transparent 50%, rgba(0,0,0,0.12) 100%)",
                          transitionDuration: "600ms",
                          transitionTimingFunction:
                            "cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                      <div
                        className="absolute inset-0 z-10 border-4 border-white/40 rounded-lg pointer-events-none transition-all group-hover:border-white/60"
                        style={{
                          transitionDuration: "600ms",
                          transitionTimingFunction:
                            "cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                      <div className="relative h-[280px] w-full flex justify-center items-center overflow-hidden bg-gradient-to-b from-gray-50 to-white">
                        <Image
                          src={f.img}
                          alt={t("leadership.founderImageAlt", {
                            name: f.name,
                            role,
                          })}
                          title={t("leadership.founderImageTitle", {
                            name: f.name,
                            role,
                          })}
                          height={280}
                          width={220}
                          className="object-cover object-center transition-transform group-hover:scale-110 relative z-0"
                          style={{
                            willChange: "transform",
                            transitionDuration: "600ms",
                            transitionTimingFunction:
                              "cubic-bezier(0.34, 1.56, 0.64, 1)",
                          }}
                        />
                        <div
                          className="absolute inset-0 z-10 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none opacity-70 group-hover:opacity-50 transition-opacity"
                          style={{
                            transitionDuration: "600ms",
                            transitionTimingFunction:
                              "cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        />
                        <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/10 via-transparent to-transparent pointer-events-none opacity-50" />
                        <div className="absolute inset-0 z-10 bg-gradient-to-tl from-black/10 via-transparent to-transparent pointer-events-none opacity-50" />
                      </div>
                      <div
                        className="relative z-20 w-full flex flex-col items-center px-4 pb-4 pt-4 transition-transform group-hover:-translate-y-2"
                        style={{
                          transitionDuration: "600ms",
                          transitionTimingFunction:
                            "cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                      >
                        <div
                          className="font-semibold text-xl mb-1 text-center text-[#052638] transition-all group-hover:text-2xl group-hover:mb-2"
                          style={{
                            transitionDuration: "600ms",
                            transitionTimingFunction:
                              "cubic-bezier(0.34, 1.56, 0.64, 1)",
                          }}
                        >
                          {f.name}
                        </div>
                        <div
                          className="text-[#7be117] text-base mb-3 text-center transition-all group-hover:text-lg group-hover:mb-4"
                          style={{
                            transitionDuration: "600ms",
                            transitionTimingFunction:
                              "cubic-bezier(0.34, 1.56, 0.64, 1)",
                          }}
                        >
                          {role}
                        </div>
                        <a
                          href={f.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-100 pointer-events-auto translate-y-0 md:opacity-0 md:pointer-events-none md:translate-y-4 md:group-hover:opacity-100 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 transition-all flex items-center gap-2 text-[#7be117] hover:text-[#a8ef17]"
                          style={{
                            transitionDuration: "600ms",
                            transitionTimingFunction:
                              "cubic-bezier(0.34, 1.56, 0.64, 1)",
                          }}
                          aria-label={t("leadership.linkedinAria", {
                            name: f.name,
                          })}
                        >
                          <Linkedin
                            size={20}
                            className="transition-transform group-hover:scale-[1.8] md:group-hover:scale-[1.8]"
                            style={{
                              transitionDuration: "600ms",
                              transitionTimingFunction:
                                "cubic-bezier(0.34, 1.56, 0.64, 1)",
                            }}
                          />
                        </a>
                      </div>
                      <div
                        className="absolute inset-0 z-10 bg-gradient-to-br from-black/8 via-transparent to-transparent pointer-events-none opacity-60 rounded-lg transition-opacity group-hover:opacity-40"
                        style={{
                          transitionDuration: "600ms",
                          transitionTimingFunction:
                            "cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                      <div
                        className="absolute inset-0 z-10 bg-gradient-to-tl from-black/8 via-transparent to-transparent pointer-events-none opacity-60 rounded-lg transition-opacity group-hover:opacity-40"
                        style={{
                          transitionDuration: "600ms",
                          transitionTimingFunction:
                            "cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                    </div>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full py-16 bg-white overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row justify-between items-start gap-10">
            <AnimateOnScroll
              animation="fadeInLeft"
              delay={0}
              className="flex flex-col w-full lg:w-2/5"
            >
              <h2 className="text-[#052638] font-semibold text-4xl sm:text-5xl mb-5">
                {t("resources.heading")}
              </h2>
              <div className="text-[#22405a] text-lg sm:text-xl mt-4 leading-relaxed">
                {t("resources.body")}
              </div>
              <Link href="/blog" title={t("resources.viewAllTitle")}>
                <div className="mt-6 inline-block w-full sm:w-auto bg-[#b2cb19] text-[#22405a] text-xl text-center py-2 px-4 rounded-lg hover:bg-lime-500 transition cursor-pointer">
                  {t("resources.viewAll")}
                </div>
              </Link>
            </AnimateOnScroll>
            <div className="w-full lg:w-3/5">
              <div className="flex flex-col md:flex-row gap-8">
                {RESOURCE_ITEMS.map((r, idx) => {
                  const title = t(`resources.${r.key}.title`);
                  const date = t(`resources.${r.key}.date`);
                  return (
                    <AnimateOnScroll
                      key={r.key}
                      animation="fadeInRight"
                      delay={idx * 200}
                    >
                      <div className="flex-1 border-2 border-gray-300 bg-white rounded-sm overflow-hidden shadow-sm min-w-[320px] max-w-[400px] transition hover:shadow-xl">
                        <Link
                          title={t("resources.cardLinkTitle")}
                          href={r.href}
                          className="block w-full h-full p-0 overflow-hidden group relative"
                        >
                          <div className="relative w-full h-[360px]">
                            <Image
                              src={r.imgSrc}
                              alt={t("resources.resourceImageAlt", { title })}
                              title={t("resources.resourceImageTitle", {
                                title,
                              })}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-105"
                              priority
                            />
                            <h3 className="absolute bottom-4 left-4 text-white text-sm font-semibold bg-opacity-30 px-3 py-1 transition-transform duration-300 transform translate-y-4 group-hover:translate-y-0">
                              {title}
                            </h3>
                          </div>
                          <div className="absolute bottom-4 right-4 text-white text-xs bg-black bg-opacity-30 px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {date}
                          </div>
                        </Link>
                      </div>
                    </AnimateOnScroll>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full py-12 bg-white px-4 sm:px-6 border-t border-gray-100">
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-4">
                {t("explore.heading")}
              </h2>
              <div className="text-[#27415c] text-lg leading-relaxed mb-8">
                {t("explore.body")}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {EXPLORE_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg border border-[#052638] text-[#052638] font-medium hover:bg-[#052638] hover:text-white transition"
                  >
                    {t(link.labelKey)}
                  </Link>
                ))}
              </div>
            </AnimateOnScroll>
          </Container>
        </div>

        <FaqSection
          id="company-faq-heading"
          title={t("faq.heading")}
          subtitle={t("faq.subheading")}
          faqs={companyFaqs}
          tone="muted"
          footer={
            <Link
              href="/contact"
              className="inline-flex items-center justify-center min-h-[48px] bg-[#b2cb19] text-[#22405a] font-medium px-8 py-3 rounded-lg hover:bg-lime-500 transition"
            >
              {t("faq.talkToTeam")}
            </Link>
          }
        />

        <CallbackCard headerText="" />
      </div>
    </>
  );
}
