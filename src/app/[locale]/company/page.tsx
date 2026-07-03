"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CompanyInvestorLeadButton } from "@/app/components/CompanyInvestorLeadButton";
import { GenericContactLeadButton } from "@/app/components/GenericContactLeadButton";
import {
  founders,
  metrics,
  tayproMarketingImpactStats,
  tayproTrustedByStatsStrip,
} from "@/app/data";
import { CompanySolutionsLineup } from "@/app/components/CompanySolutionsLineup";
import { ArrowRight, Check, Linkedin } from "lucide-react";
import CallbackCard from "@/app/components/CallbackCard";
import { CompanyPageHero } from "@/app/components/CompanyPageHero";
import ModuleManufacturerTrust from "@/app/components/ModuleManufacturerTrust";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import { FaqSection } from "@/app/components/FaqSection";
import { FAQPageSchema } from "@/app/components/StructuredData";
import { getProduct } from "@/lib/products/catalog";

const STAT_STRIP_LABEL_KEYS = [
  "statsStrip.robotCapacityDeployed",
  "statsStrip.panelsCleanedAnnually",
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
  { labelKey: "explore.link5", href: "/press" },
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
        <CompanyPageHero
          eyebrow={t("hero.eyebrow")}
          title={t("hero.title")}
          subtitle={t("hero.subtitle")}
          bodyBeforeLink={t("hero.bodyBeforeLink")}
          bodyLink={t("hero.bodyLink")}
          bodyAfterLink={t("hero.bodyAfterLink")}
        />

        <section className="w-full py-14 md:py-20 bg-[#f4f7f9]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <p className="mb-3 inline-flex items-center rounded-full border border-[#A8C117]/25 bg-[#A8C117]/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#5a8f00]">
                {t("statsStrip.eyebrow")}
              </p>
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl">
                {t("statsStrip.heading")}
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...tayproTrustedByStatsStrip].map((stat, idx) => (
                <AnimateOnScroll
                  key={stat.label}
                  animation="fadeInUp"
                  delay={idx * 80}
                >
                  <div className="rounded-2xl border border-gray-100 bg-white px-4 py-6 text-center shadow-sm transition hover:border-[#A8C117]/40 hover:shadow-md">
                    <p className="text-[#5a8f00] font-semibold text-2xl sm:text-3xl md:text-4xl mb-2 tabular-nums">
                      {stat.value}
                    </p>
                    <p className="text-[#27415c] text-xs sm:text-sm leading-snug">
                      {t(STAT_STRIP_LABEL_KEYS[idx])}
                    </p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        <section className="relative w-full py-16 md:py-24 bg-gradient-to-b from-[#052638] via-[#073448] to-[#052638] overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(168,193,23,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(168,193,23,0.06) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
            aria-hidden
          />
          <Container className="relative">
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
                <AnimateOnScroll animation="fadeInLeft" delay={0}>
                  <div className="rounded-2xl border border-white/10 bg-white p-6 md:p-8 shadow-xl shadow-black/10">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#A8C117]">
                      {t("brandValues.heading")}
                    </p>
                    <div className="space-y-3" role="list">
                      {BRAND_VALUE_KEYS.map((key) => (
                        <div
                          className="flex items-center gap-3 text-[#245165]"
                          key={key}
                          role="listitem"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#A8C117]/15">
                            <Check className="h-4 w-4 text-[#5a8f00]" strokeWidth={3} />
                          </span>
                          <span className="text-base">{t(key)}</span>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/solar-panel-cleaning-system"
                      title={t("brandValues.ctaTitle")}
                      className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#A8C117] px-5 py-3 text-sm font-semibold text-[#052638] transition hover:bg-[#b3cf3d]"
                    >
                      {t("brandValues.cta")}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </AnimateOnScroll>

                <AnimateOnScroll animation="fadeInRight" delay={100}>
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-xl shadow-black/10">
                    <div className="relative h-48 w-full bg-[#0a2a38] sm:h-52">
                      <Image
                        src={getProduct("glydeX").imagePath}
                        alt={t("sustainability.glydeXImageAlt")}
                        title={t("sustainability.glydeXImageTitle")}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                    <div className="p-6 md:p-8">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#5a8f00]">
                        {t("sustainability.communityEyebrow")}
                      </p>
                      <h3 className="text-[#052638] text-lg font-semibold leading-snug">
                        {t("sustainability.communityHeading")}
                      </h3>
                      <p className="mt-3 text-[#27415c] text-sm md:text-base leading-relaxed">
                        {t("sustainability.communityBody")}
                      </p>
                    </div>
                  </div>
                </AnimateOnScroll>
              </div>

              <AnimateOnScroll animation="fadeInUp" delay={150}>
                <div className="rounded-2xl border border-[#A8C117]/25 bg-gradient-to-br from-[#5a8f00] via-[#75AA00] to-[#4a7a00] p-6 md:p-8 text-white shadow-xl shadow-black/20 lg:grid lg:grid-cols-2 lg:gap-10 lg:items-center">
                  <div>
                    <h3 className="mb-3 text-xl md:text-2xl font-semibold leading-snug">
                      {t("sustainability.titleLine1")}{" "}
                      {t("sustainability.titleLine2")}{" "}
                      {t("sustainability.titleLine3")}
                    </h3>
                    <p className="mb-4 text-sm md:text-base leading-relaxed text-white/90">
                      {t("sustainability.body")}
                    </p>
                    <Link
                      href="/projects"
                      title={t("sustainability.exploreProjectsTitle")}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-white underline underline-offset-4 hover:no-underline"
                    >
                      {t("sustainability.exploreProjects")}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:mt-0">
                    {[
                      {
                        value: tayproMarketingImpactStats.waterSavedAnnually.value,
                        label: t("sustainability.waterSavedLabel"),
                      },
                      {
                        value:
                          tayproMarketingImpactStats.extraCleanEnergyAnnually.value,
                        label: t("sustainability.extraGenerationLabel"),
                      },
                      {
                        value: tayproMarketingImpactStats.co2ReducedAnnually.value,
                        label: t("sustainability.co2ReducedLabel"),
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm"
                      >
                        <p className="text-2xl font-semibold tabular-nums">
                          {item.value}
                        </p>
                        <p className="mt-1.5 text-xs text-white/85 leading-snug">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </Container>
        </section>

        <section
          id="investors"
          className="w-full py-14 md:py-20 bg-white scroll-mt-24 border-y border-gray-200/80"
          aria-labelledby="company-investors-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp">
              <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-gray-200/90 bg-[#f8fafb] shadow-sm">
                <div className="p-8 md:p-10 lg:p-12">
                  <p className="mb-3 inline-flex items-center rounded-full border border-[#A8C117]/25 bg-[#A8C117]/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#5a8f00]">
                    {t("investors.eyebrow")}
                  </p>
                  <h2
                    id="company-investors-heading"
                    className="text-[#052638] font-semibold text-2xl md:text-3xl lg:text-4xl mb-6 leading-tight max-w-3xl"
                  >
                    {t("investors.heading")}
                  </h2>
                  <div className="space-y-4 text-[#27415c] text-base md:text-lg leading-relaxed max-w-4xl">
                    <p>{t("investors.bodyLead")}</p>
                    <p>{t("investors.bodyMoat")}</p>
                    <p>{t("investors.bodyOrion")}</p>
                  </div>
                  <p className="mt-6 rounded-xl border border-[#A8C117]/20 bg-white px-5 py-4 text-sm md:text-base text-[#27415c] leading-relaxed">
                    {t("investors.statFootnote")}
                  </p>
                </div>

                <div className="border-t border-gray-200/80 px-8 md:px-10 lg:px-12 py-8 md:py-10">
                  <ul className="grid gap-4 md:grid-cols-3">
                    {(["bullet0", "bullet1", "bullet2"] as const).map((key) => (
                      <li
                        key={key}
                        className="flex gap-3 rounded-xl border border-gray-100 bg-white px-5 py-4 text-sm md:text-base leading-relaxed text-[#27415c] shadow-sm"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A8C117]/15">
                          <Check
                            className="h-3.5 w-3.5 text-[#5a8f00]"
                            strokeWidth={3}
                            aria-hidden
                          />
                        </span>
                        {t(`investors.${key}`)}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
                    <CompanyInvestorLeadButton />
                    <Link
                      href="/technology/ai-intelligence"
                      className="inline-flex justify-center px-6 py-3 rounded-xl border border-gray-200 bg-white text-[#052638] font-medium hover:border-[#A8C117] hover:text-[#5a8f00] transition-colors"
                    >
                      {t("investors.ctaAi")}
                    </Link>
                    <Link
                      href="/solar-panel-cleaning-system/orion-plant-intelligence-platform"
                      className="inline-flex justify-center px-6 py-3 rounded-xl border border-gray-200 bg-white text-[#052638] font-medium hover:border-[#A8C117] hover:text-[#5a8f00] transition-colors"
                    >
                      {t("investors.ctaOrion")}
                    </Link>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <section
          className="w-full py-14 md:py-20 bg-[#f4f7f9] border-y border-gray-200/80"
          aria-labelledby="company-credibility-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-10">
              <p className="mb-3 inline-flex items-center rounded-full border border-[#A8C117]/25 bg-[#A8C117]/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#5a8f00]">
                {t("credibility.eyebrow")}
              </p>
              <h2
                id="company-credibility-heading"
                className="text-[#052638] font-semibold text-2xl md:text-3xl"
              >
                {t("credibility.heading")}
              </h2>
            </AnimateOnScroll>
            <ul className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {(["item0", "item1", "item2", "item3", "item4", "item5"] as const).map((key) => (
                <li
                  key={key}
                  className="flex gap-3 rounded-2xl bg-white border border-gray-100 px-5 py-4 shadow-sm text-[#27415c] text-sm md:text-base transition hover:border-[#A8C117]/40 hover:shadow-md"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A8C117]/15">
                    <Check className="h-3.5 w-3.5 text-[#5a8f00]" strokeWidth={3} aria-hidden />
                  </span>
                  {t(`credibility.${key}`)}
                </li>
              ))}
            </ul>
            <AnimateOnScroll animation="fadeInUp" className="max-w-2xl mx-auto">
              <div className="rounded-2xl border border-[#A8C117]/30 bg-gradient-to-br from-white to-[#f8fbe8] px-6 py-6 text-center shadow-sm md:px-8 md:py-8">
                <p className="text-[#052638] font-semibold text-xl md:text-2xl mb-2">
                  {t("credibility.awardTitle")}
                </p>
                <p className="text-[#27415c] text-sm md:text-base mb-4">
                  {t("credibility.awardBody")}
                </p>
                <Link
                  href="/blog/mint-tech4good-awards-2024-taypros-green-ai-solutions-win-big-in-mumbai-india"
                  className="inline-flex items-center gap-1.5 text-[#5a8f00] font-semibold underline underline-offset-4 hover:no-underline"
                >
                  {t("credibility.awardLink")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <section
          className="w-full py-16 md:py-24 bg-white overflow-x-hidden"
          aria-labelledby="company-story-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="mb-12 md:mb-16 max-w-3xl">
              <div
                className="mb-5 h-1 w-14 rounded-full bg-gradient-to-r from-[#A8C117] to-[#7be117]/60"
                aria-hidden
              />
              <h2
                id="company-story-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("story.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("story.intro")}
              </p>
            </AnimateOnScroll>
            <div className="relative max-w-4xl">
              <div
                className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-[#A8C117] via-[#A8C117]/40 to-transparent md:left-[15px]"
                aria-hidden
              />
              {STORY_KEYS.map((key, idx) => (
                <AnimateOnScroll
                  key={key}
                  animation="fadeInUp"
                  delay={idx * 100}
                  className="relative pl-10 md:pl-12 pb-12 last:pb-0"
                >
                  <span
                    className="absolute left-0 top-1.5 flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full border-2 border-[#A8C117] bg-white text-[10px] md:text-xs font-bold text-[#5a8f00]"
                    aria-hidden
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#5a8f00]">
                    {t(`story.${key}.label`)}
                  </p>
                  <h3 className="text-[#052638] font-semibold text-xl sm:text-2xl md:text-3xl leading-tight">
                    {t(`story.${key}.heading`)}
                  </h3>
                  <p className="mt-4 text-[#27415c] text-base md:text-lg leading-relaxed">
                    {t(`story.${key}.body`)}
                  </p>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        <CompanySolutionsLineup />

        <section className="w-full py-16 md:py-24 bg-white overflow-x-hidden">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
              <AnimateOnScroll
                animation="fadeInLeft"
                delay={100}
                className="flex justify-center"
              >
                <div className="relative w-full max-w-[520px] aspect-[5/4] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-[#052638]/10">
                  <Image
                    src="/tayprosolarpanel/taypro-about1.jpg"
                    alt={t("builtForSites.aboutImageAlt")}
                    title={t("builtForSites.aboutImageTitle")}
                    fill
                    sizes="(max-width: 768px) 100vw, 520px"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#052638]/25 via-transparent to-transparent" />
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll
                animation="fadeInRight"
                delay={100}
                className="flex flex-col justify-center text-center md:text-left"
              >
                <h2 className="text-[#052638] text-2xl md:text-3xl font-semibold mb-4">
                  {t("builtForSites.heading")}
                </h2>
                <p className="text-[#27415c] text-lg max-w-xl leading-relaxed mb-4">
                  {t("builtForSites.paragraph1")}
                </p>
                <p className="text-[#27415c] text-lg max-w-xl leading-relaxed">
                  {t("builtForSites.paragraph2BeforeGlyde")}{" "}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                    className="brand-inline-link font-medium"
                  >
                    {t("builtForSites.glydeLink")}
                  </Link>{" "}
                  {t("builtForSites.paragraph2Middle")}{" "}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                    className="brand-inline-link font-medium"
                  >
                    {t("builtForSites.glydeXLink")}
                  </Link>
                  {t("builtForSites.paragraph2After")}
                </p>
              </AnimateOnScroll>
            </div>
          </Container>
        </section>

        <ModuleManufacturerTrust />

        <section className="w-full py-16 md:py-24 bg-[#f4f7f9] overflow-x-hidden">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
              <AnimateOnScroll
                animation="fadeInLeft"
                delay={100}
                className="flex flex-col justify-center text-center md:text-left order-2 md:order-1"
              >
                <h2 className="text-[#052638] text-2xl md:text-3xl font-semibold mb-4">
                  {t("collaboration.heading")}
                </h2>
                <p className="text-[#27415c] text-lg max-w-xl leading-relaxed mb-4">
                  {t("collaboration.paragraph1")}
                </p>
                <p className="text-[#27415c] text-lg max-w-xl leading-relaxed">
                  {t("collaboration.paragraph2Before")}{" "}
                  <span className="font-semibold text-[#052638] whitespace-nowrap">
                    {metrics[1].value}
                  </span>{" "}
                  {t("collaboration.paragraph2Middle")}{" "}
                  <span className="font-semibold text-[#052638] whitespace-nowrap">
                    {metrics[2].value}
                  </span>{" "}
                  {t("collaboration.paragraph2AfterWarehouses")}{" "}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                    className="brand-inline-link font-medium"
                  >
                    {t("collaboration.nectyrLink")}
                  </Link>
                  {t("collaboration.paragraph2End")}
                </p>
              </AnimateOnScroll>
              <AnimateOnScroll
                animation="fadeInRight"
                delay={100}
                className="flex justify-center order-1 md:order-2"
              >
                <div className="relative w-full max-w-[520px] aspect-[5/4] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-[#052638]/10">
                  <Image
                    src="/tayprosolarpanel/taypro-about2.webp"
                    alt={t("collaboration.about2ImageAlt")}
                    title={t("collaboration.about2ImageTitle")}
                    fill
                    sizes="(max-width: 768px) 100vw, 520px"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#052638]/25 via-transparent to-transparent" />
                </div>
              </AnimateOnScroll>
            </div>
          </Container>
        </section>

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
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-white/12 bg-white/5 p-6 md:p-8 transition hover:border-[#A8C117]/35 hover:bg-white/8">
                    <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#A8C117]/40 bg-[#A8C117]/10 text-sm font-bold text-[#A8C117]">
                      {step.step}
                    </span>
                    <h3 className="text-white font-semibold text-xl mb-3">
                      {step.title}
                    </h3>
                    <p className="text-white/78 leading-relaxed">
                      {step.description}
                    </p>
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

        <section className="w-full py-16 md:py-24 bg-white overflow-x-hidden">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4">
                {t("scale.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("scale.body")}
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {metrics.map((stat, idx) => (
                <AnimateOnScroll
                  key={stat.label}
                  animation="scaleIn"
                  delay={idx * 150}
                >
                  <div className="rounded-2xl border border-[#A8C117]/20 bg-gradient-to-br from-[#f8fbe8] to-white px-6 py-8 text-center shadow-sm">
                    <p className="text-[#5a8f00] font-semibold text-4xl md:text-5xl mb-2 tabular-nums">
                      {stat.value}
                    </p>
                    <p className="text-[#27415c] text-sm md:text-base font-medium">
                      {t(METRIC_LABEL_KEYS[idx])}
                    </p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        <section className="relative w-full py-16 md:py-24 overflow-x-hidden bg-gradient-to-b from-[#073448] to-[#052638]">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(168,193,23,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(168,193,23,0.06) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
            aria-hidden
          />
          <Container className="relative">
            <AnimateOnScroll animation="fadeInUp" className="text-white mb-10 md:mb-12">
              <div
                className="mb-5 h-1 w-14 rounded-full bg-gradient-to-r from-[#A8C117] to-[#7be117]/60"
                aria-hidden
              />
              <h2 className="font-semibold text-3xl md:text-4xl mb-4">
                {t("leadership.heading")}
              </h2>
              <p className="text-white/85 text-lg max-w-3xl leading-relaxed">
                {t("leadership.body")}
              </p>
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
                      <div
                        className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-gray-50 to-white"
                        style={{ aspectRatio: "4 / 5" }}
                      >
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
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain object-bottom transition-transform group-hover:scale-[1.03] relative z-0"
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
          </Container>
        </section>

        <section className="w-full py-16 md:py-20 bg-white overflow-x-hidden">
          <Container>
            <AnimateOnScroll animation="fadeInLeft" eager>
              <h2 className="text-[#052638] font-semibold text-4xl sm:text-5xl lg:hidden">
                {t("resources.heading")}
              </h2>
            </AnimateOnScroll>

            <div className="mt-6 flex flex-col gap-8 lg:mt-0 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
              <AnimateOnScroll
                animation="fadeInLeft"
                delay={50}
                className="hidden lg:flex lg:w-2/5 flex-col gap-6"
              >
                <h2 className="text-[#052638] font-semibold text-4xl sm:text-5xl">
                  {t("resources.heading")}
                </h2>
                <p className="text-[#22405a] text-lg sm:text-xl leading-relaxed">
                  {t("resources.body")}
                </p>
                <Link
                  href="/blog"
                  title={t("resources.viewAllTitle")}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-[#A8C117] text-[#052638] text-base font-semibold py-3 px-6 hover:bg-[#b3cf3d] transition"
                >
                  {t("resources.viewAll")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </AnimateOnScroll>

              <div className="w-full lg:w-3/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {RESOURCE_ITEMS.map((r) => {
                    const title = t(`resources.${r.key}.title`);
                    const date = t(`resources.${r.key}.date`);
                    return (
                      <article
                        key={r.key}
                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-[#A8C117]/50 hover:shadow-lg"
                      >
                        <Link
                          title={t("resources.cardLinkTitle")}
                          href={r.href}
                          className="group block"
                        >
                          <div
                            className="relative aspect-[4/3] w-full overflow-hidden"
                            style={{ aspectRatio: "4 / 3" }}
                          >
                            <Image
                              src={r.imgSrc}
                              alt={t("resources.resourceImageAlt", { title })}
                              title={t("resources.resourceImageTitle", {
                                title,
                              })}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <div className="border-t border-gray-100 bg-white p-4 sm:p-5">
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A8C117]">
                              {date}
                            </p>
                            <h3 className="text-sm font-semibold leading-snug text-[#052638] transition-colors group-hover:text-[#5a8f00] sm:text-base">
                              {title}
                            </h3>
                          </div>
                        </Link>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>

            <AnimateOnScroll animation="fadeInLeft" delay={50} className="mt-6 lg:hidden">
              <p className="text-[#22405a] text-lg sm:text-xl leading-relaxed">
                {t("resources.body")}
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInLeft" delay={100} className="mt-6 lg:hidden">
              <Link
                href="/blog"
                title={t("resources.viewAllTitle")}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-[#A8C117] text-[#052638] text-base font-semibold py-3 px-6 hover:bg-[#b3cf3d] transition"
              >
                {t("resources.viewAll")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </AnimateOnScroll>
          </Container>
        </section>

        <section className="w-full py-14 md:py-16 bg-[#f4f7f9] border-t border-gray-100">
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-4">
                {t("explore.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed mb-8">
                {t("explore.body")}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {EXPLORE_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-full border border-[#052638]/20 bg-white text-[#052638] text-sm font-medium shadow-sm hover:border-[#052638] hover:bg-[#052638] hover:text-white transition"
                  >
                    {t(link.labelKey)}
                  </Link>
                ))}
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <FaqSection
          id="company-faq-heading"
          title={t("faq.heading")}
          subtitle={t("faq.subheading")}
          faqs={companyFaqs}
          tone="muted"
          footer={
            <GenericContactLeadButton
              source="company_faq"
              analyticsFormType="company_inquiry"
              className="inline-flex items-center justify-center min-h-[48px] bg-[#b2cb19] text-[#22405a] font-medium px-8 py-3 rounded-lg hover:bg-lime-500 transition"
            >
              {t("faq.talkToTeam")}
            </GenericContactLeadButton>
          }
        />

        <CallbackCard headerText="" />
      </div>
    </>
  );
}
