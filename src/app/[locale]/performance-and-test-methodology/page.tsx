import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowRight,
  Beaker,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Droplets,
  FileText,
  Gauge,
  Leaf,
  LineChart,
  Scale,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { CompanyPageHero } from "@/app/components/CompanyPageHero";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { FaqSection } from "@/app/components/FaqSection";
import { FAQPageSchema } from "@/app/components/StructuredData";
import { tayproMarketingImpactStats } from "@/app/data";
import { PERFORMANCE_METHODOLOGY_PATH } from "@/lib/seo/performance-methodology";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { TAYPRO_PUBLIC_PROOF } from "@/lib/marketing/public-proof-stats";
import type { Metadata } from "next";

const siteUrl = SITE_URL;
const lastUpdated = "May 15, 2026";

const PRINCIPLE_KEYS = ["item0", "item1", "item2"] as const;
const PRINCIPLE_ICONS: LucideIcon[] = [Gauge, Scale, Building2];

const TESTING_STEP_KEYS = ["step0", "step1", "step2", "step3"] as const;
const TESTING_STEP_ICONS: LucideIcon[] = [Beaker, ClipboardCheck, LineChart, ShieldCheck];

const PLATFORM_KEYS = ["glyde", "helyx", "glydeX"] as const;

const FLEET_PROOF_KEYS = ["item0", "item1", "item2", "item3", "item4", "item5"] as const;
const FLEET_PROOF_VALUES = [
  TAYPRO_PUBLIC_PROOF.dailyCleaningCapacityGw,
  TAYPRO_PUBLIC_PROOF.panelsCleanedAnnually,
  TAYPRO_PUBLIC_PROOF.sitesLive,
  TAYPRO_PUBLIC_PROOF.generationRecoveredGwh,
  TAYPRO_PUBLIC_PROOF.waterSavedLitres,
  TAYPRO_PUBLIC_PROOF.co2ReducedTons,
] as const;

const FLEET_PROOF_ICONS: LucideIcon[] = [Gauge, LineChart, Building2, Leaf, Droplets, Leaf];

const FAQ_KEYS = ["q0", "q1", "q2", "q3", "q4", "q5"] as const;

const QUICK_NAV = [
  { id: "dust-removal", key: "dustRemoval" },
  { id: "generation", key: "generation" },
  { id: "testing", key: "testing" },
  { id: "platforms", key: "platforms" },
  { id: "fleet-proof", key: "fleetProof" },
  { id: "faq", key: "faq" },
] as const;

const AUDIENCE_ICONS: LucideIcon[] = [Building2, Users, ClipboardCheck];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "PerformanceMethodologyPage.meta",
  });

  return withHreflang(PERFORMANCE_METHODOLOGY_PATH, locale, {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: `${t("title")} | Taypro`,
      description: t("description"),
      url: `${siteUrl}${PERFORMANCE_METHODOLOGY_PATH}`,
      type: "article",
    },
  });
}

export default async function PerformanceAndTestMethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PerformanceMethodologyPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumb"), href: "" },
  ];

  const principles = PRINCIPLE_KEYS.map((key, idx) => ({
    icon: PRINCIPLE_ICONS[idx],
    title: t(`principles.${key}.title`),
    body: t(`principles.${key}.body`),
  }));

  const testingSteps = TESTING_STEP_KEYS.map((key, idx) => ({
    icon: TESTING_STEP_ICONS[idx],
    title: t(`testing.${key}.title`),
    body: t(`testing.${key}.body`),
  }));

  const platforms = PLATFORM_KEYS.map((key) => ({
    key,
    name: t(`platform.${key}`),
    tag: t(`platform.${key}Tag`),
    metric: t(`platform.${key}Metric`),
    method: t(`platform.${key}Method`),
    href: t(`platform.${key}Href`),
  }));

  const fleetProofItems = FLEET_PROOF_KEYS.map((key, idx) => ({
    icon: FLEET_PROOF_ICONS[idx],
    value: FLEET_PROOF_VALUES[idx],
    label: t(`publicProof.${key}.label`),
    body: t(`publicProof.${key}.body`),
  }));

  const faqs = FAQ_KEYS.map((key) => ({
    question: t(`faq.${key}`),
    answer: t(`faq.a${key.slice(1)}`),
  }));

  const heroStats = [
    tayproMarketingImpactStats.dailyCleaningCapacityGw,
    tayproMarketingImpactStats.panelsCleanedAnnually,
    tayproMarketingImpactStats.co2ReducedAnnually,
    tayproMarketingImpactStats.waterSavedAnnually,
  ];

  return (
    <>
      <FAQPageSchema faqs={faqs} />
      <Breadcrumbs items={breadcrumbs} />

      <div className="min-h-screen overflow-x-hidden">
        <CompanyPageHero
          eyebrow={t("hero.eyebrow")}
          title={t("hero.title")}
          subtitle={t("hero.subtitle")}
          bodyBeforeLink={t("hero.bodyBeforeLink")}
          bodyLink={t("hero.bodyLink")}
          bodyLinkHref="/cleaning-technology"
          bodyAfterLink={t("hero.bodyAfterLink")}
          footer={
            <>
              <p className="text-[#5a7a8f] text-sm mb-4">
                {t("lastUpdated", { date: lastUpdated })}
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {(["audience0", "audience1", "audience2"] as const).map((key, idx) => {
                  const Icon = AUDIENCE_ICONS[idx];
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-[#27415c] text-xs sm:text-sm shadow-sm"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#5a8f00]" aria-hidden />
                      {t(`hero.${key}`)}
                    </span>
                  );
                })}
              </div>
            </>
          }
        />

        <section className="w-full py-14 md:py-20 bg-[#f4f7f9] border-b border-gray-200/80">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <p className="mb-3 inline-flex items-center rounded-full border border-[#A8C117]/25 bg-[#A8C117]/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#5a8f00]">
                {t("statsStrip.eyebrow")}
              </p>
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl">
                {t("statsStrip.heading")}
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 max-w-5xl mx-auto">
              {heroStats.map((stat, idx) => (
                <AnimateOnScroll key={stat.label} animation="fadeInUp" delay={idx * 80}>
                  <div className="rounded-2xl border border-gray-100 bg-white px-4 py-6 text-center shadow-sm transition hover:border-[#A8C117]/40 hover:shadow-md">
                    <p className="text-[#5a8f00] font-semibold text-2xl sm:text-3xl md:text-4xl mb-2 tabular-nums">
                      {stat.value}
                    </p>
                    <p className="text-[#27415c] text-xs sm:text-sm leading-snug">{stat.label}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Quick nav */}
        <nav
          aria-label={t("quickNav.label")}
          className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/95 backdrop-blur-sm"
        >
          <Container>
            <ul className="flex gap-2 overflow-x-auto py-3 text-sm scrollbar-none">
              {QUICK_NAV.map((item) => (
                <li key={item.id} className="shrink-0">
                  <a
                    href={`#${item.id}`}
                    className="inline-flex items-center rounded-full border border-gray-200 bg-[#f8fafb] px-3.5 py-1.5 text-[#27415c] font-medium whitespace-nowrap hover:border-[#A8C117]/50 hover:text-[#5a8f00] transition-colors"
                  >
                    {t(`quickNav.${item.key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        </nav>

        {/* Purpose */}
        <section className="py-14 md:py-16 bg-white">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-4">
                {t("purpose.heading")}
              </h2>
              <p className="text-[#27415c] text-base md:text-lg leading-relaxed">
                {t("purpose.body")}
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInUp" delay={60} className="max-w-4xl mx-auto">
              <h3 className="text-[#052638] font-semibold text-xl md:text-2xl text-center mb-3">
                {t("principles.heading")}
              </h3>
              <p className="text-[#5a7a8f] text-sm md:text-base text-center max-w-2xl mx-auto mb-8 leading-relaxed">
                {t("principles.intro")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {principles.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={item.title}
                      className="h-full rounded-2xl border border-gray-200 bg-[#f8fafb] p-6"
                    >
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#A8C117]/12 mb-4">
                        <Icon className="h-5 w-5 text-[#5a8f00]" aria-hidden />
                      </span>
                      <h3 className="text-[#052638] font-semibold text-base mb-2 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-[#27415c] text-sm leading-relaxed">{item.body}</p>
                    </article>
                  );
                })}
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Dust removal */}
        <section id="dust-removal" className="py-14 md:py-16 bg-[#f4f7f9] scroll-mt-16">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-4">
                {t("dustRemoval.heading")}
              </h2>
              <p className="text-[#27415c] text-base md:text-lg leading-relaxed">
                {t("dustRemoval.intro")}
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-5xl mx-auto">
              <AnimateOnScroll animation="fadeInLeft">
                <article className="h-full rounded-2xl border border-[#A8C117]/25 bg-white p-6 md:p-7 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#A8C117]/12">
                      <CheckCircle2 className="h-5 w-5 text-[#5a8f00]" aria-hidden />
                    </span>
                    <h3 className="text-[#052638] font-semibold text-lg">
                      {t("dustRemoval.meansHeading")}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {[t("dustRemoval.means0"), t("dustRemoval.means1")].map((line) => (
                      <li
                        key={line}
                        className="flex gap-3 text-[#27415c] text-sm md:text-base leading-relaxed"
                      >
                        <CheckCircle2
                          className="h-4 w-4 shrink-0 text-[#5a8f00] mt-1"
                          aria-hidden
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </AnimateOnScroll>

              <AnimateOnScroll animation="fadeInRight" delay={80}>
                <article className="h-full rounded-2xl border border-gray-200 bg-white p-6 md:p-7 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                      <XCircle className="h-5 w-5 text-red-500/80" aria-hidden />
                    </span>
                    <h3 className="text-[#052638] font-semibold text-lg">
                      {t("dustRemoval.notHeading")}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {[t("dustRemoval.not0"), t("dustRemoval.not1"), t("dustRemoval.not2")].map(
                      (line) => (
                        <li
                          key={line}
                          className="flex gap-3 text-[#27415c] text-sm md:text-base leading-relaxed"
                        >
                          <XCircle
                            className="h-4 w-4 shrink-0 text-red-400 mt-1"
                            aria-hidden
                          />
                          <span>{line}</span>
                        </li>
                      )
                    )}
                  </ul>
                </article>
              </AnimateOnScroll>
            </div>
          </Container>
        </section>

        {/* Generation recovery */}
        <section id="generation" className="py-14 md:py-16 bg-white scroll-mt-16">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-4 text-center">
                {t("generation.heading")}
              </h2>
              <p className="text-[#27415c] text-base md:text-lg leading-relaxed mb-8">
                {t("generation.p0")}
              </p>
              <aside className="rounded-2xl border border-[#A8C117]/25 bg-[#f8fafb] p-6 md:p-7">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-[#5a8f00] mt-0.5" aria-hidden />
                  <div>
                    <h3 className="text-[#052638] font-semibold text-base mb-2">
                      {t("generation.calloutTitle")}
                    </h3>
                    <p className="text-[#27415c] text-sm md:text-base leading-relaxed">
                      {t("generation.p1Before")}{" "}
                      <Link
                        href="/solar-panel-cleaning-robot-price-calculator#calculator"
                        className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                      >
                        {t("generation.roiLink")}
                      </Link>{" "}
                      {t("generation.p1After")}
                    </p>
                  </div>
                </div>
              </aside>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Testing */}
        <section id="testing" className="py-14 md:py-16 bg-[#f4f7f9] scroll-mt-16">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-4">
                {t("testing.heading")}
              </h2>
              <p className="text-[#27415c] text-base md:text-lg leading-relaxed">
                {t("testing.intro")}
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mb-8">
              {testingSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <AnimateOnScroll key={step.title} animation="fadeInUp" delay={idx * 70}>
                    <article className="relative h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                      <span className="text-[#A8C117]/80 text-xs font-bold tracking-[0.2em] mb-3 block">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#A8C117]/10 mb-4">
                        <Icon className="h-5 w-5 text-[#5a8f00]" aria-hidden />
                      </span>
                      <h3 className="text-[#052638] font-semibold text-base mb-2 leading-snug">
                        {step.title}
                      </h3>
                      <p className="text-[#27415c] text-sm leading-relaxed">{step.body}</p>
                    </article>
                  </AnimateOnScroll>
                );
              })}
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={280}>
              <p className="text-[#5a7a8f] text-sm md:text-base text-center max-w-3xl mx-auto leading-relaxed rounded-xl border border-gray-200/80 bg-white px-5 py-4">
                {t("testing.note")}
              </p>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Platforms */}
        <section id="platforms" className="py-14 md:py-16 bg-white scroll-mt-16">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-4">
                {t("platform.heading")}
              </h2>
              <p className="text-[#27415c] text-base md:text-lg leading-relaxed">
                {t("platform.intro")}
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {platforms.map((platform, idx) => (
                <AnimateOnScroll key={platform.key} animation="fadeInUp" delay={idx * 70}>
                  <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-[#f8fafb] p-6 md:p-7">
                    <p className="text-[#A8C117] text-xs font-semibold uppercase tracking-wider mb-2">
                      {platform.tag}
                    </p>
                    <h3 className="text-[#052638] font-semibold text-xl mb-3">{platform.name}</h3>
                    <p className="inline-flex self-start rounded-full border border-[#A8C117]/30 bg-[#A8C117]/10 px-3 py-1 text-[#5a8f00] text-xs font-semibold mb-4">
                      {platform.metric}
                    </p>
                    <p className="text-[#27415c] text-sm leading-relaxed mb-6 flex-1">
                      {platform.method}
                    </p>
                    <Link
                      href={platform.href}
                      className="inline-flex items-center gap-1.5 text-[#5a8f00] text-sm font-semibold hover:underline underline-offset-4"
                    >
                      {platform.name}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </article>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Uptime */}
        <section className="py-10 md:py-12 bg-[#f4f7f9]">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <article className="rounded-2xl border border-gray-200 bg-white p-6 md:p-7 flex gap-4">
                <ShieldCheck className="h-6 w-6 shrink-0 text-[#5a8f00]" aria-hidden />
                <div>
                  <h2 className="text-[#052638] font-semibold text-lg md:text-xl mb-2">
                    {t("uptime.heading")}
                  </h2>
                  <p className="text-[#27415c] text-sm md:text-base leading-relaxed">
                    {t("uptime.body")}
                  </p>
                </div>
              </article>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Fleet proof */}
        <section id="fleet-proof" className="py-14 md:py-16 bg-white scroll-mt-16">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-4">
                {t("publicProof.heading")}
              </h2>
              <p className="text-[#27415c] text-base md:text-lg leading-relaxed">
                {t("publicProof.intro")}
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto mb-8">
              {fleetProofItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <AnimateOnScroll key={item.label} animation="fadeInUp" delay={idx * 60}>
                    <article className="h-full rounded-2xl border border-gray-200 bg-[#f8fafb] p-6">
                      <div className="flex items-start gap-4">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#A8C117]/10">
                          <Icon className="h-5 w-5 text-[#5a8f00]" aria-hidden />
                        </span>
                        <div>
                          <p className="text-[#5a8f00] font-semibold text-xl tabular-nums mb-1">
                            {item.value}
                          </p>
                          <h3 className="text-[#052638] font-semibold text-sm mb-2 leading-snug">
                            {item.label}
                          </h3>
                          <p className="text-[#27415c] text-sm leading-relaxed">{item.body}</p>
                        </div>
                      </div>
                    </article>
                  </AnimateOnScroll>
                );
              })}
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={360}>
              <p className="text-[#5a7a8f] text-sm text-center max-w-3xl mx-auto leading-relaxed rounded-xl border border-amber-200/80 bg-amber-50/60 px-5 py-4">
                {t("publicProof.footnote")}
              </p>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Documentation CTA */}
        <section className="py-14 md:py-16 bg-[#052638]">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center">
              <FileText className="h-8 w-8 text-[#A8C117] mx-auto mb-4" aria-hidden />
              <h2 className="text-white font-semibold text-2xl md:text-3xl mb-4">
                {t("documentation.heading")}
              </h2>
              <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                {t("documentation.bodyBefore")}{" "}
                <Link
                  href="/contact"
                  className="text-[#A8C117] font-medium underline-offset-4 hover:underline"
                >
                  {t("documentation.contactLink")}
                </Link>{" "}
                {t("documentation.bodyAfter")}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
                >
                  {t("documentation.contactLink")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/solar-panel-cleaning-robot-price-calculator#calculator"
                  className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl border border-white/25 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
                >
                  {t("documentation.ctaRoi")}
                </Link>
                <Link
                  href="/cleaning-technology"
                  className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl border border-white/25 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
                >
                  {t("documentation.ctaTechnology")}
                </Link>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <div id="faq" className="scroll-mt-16">
          <FaqSection
            id="methodology-faq-heading"
            title={t("faq.heading")}
            subtitle={t("faq.subtitle")}
            faqs={faqs}
            tone="muted"
          />
        </div>

        {/* Related */}
        <section className="py-10 md:py-12 bg-white border-t border-gray-200/80">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <p className="text-[#27415c] text-sm md:text-base text-center leading-relaxed">
                <span className="font-semibold text-[#052638]">{t("related.label")}: </span>
                <Link
                  href="/cleaning-technology"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  {t("related.cleaningTech")}
                </Link>
                {" · "}
                <Link
                  href="/solar-panel-cleaning-system"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  {t("related.systems")}
                </Link>
                {" · "}
                <Link
                  href="/technology/ai-intelligence"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  {t("related.aiIntelligence")}
                </Link>
                {" · "}
                <Link
                  href="/terms-of-service"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  {t("related.terms")}
                </Link>
              </p>
            </AnimateOnScroll>
          </Container>
        </section>
      </div>
    </>
  );
}
