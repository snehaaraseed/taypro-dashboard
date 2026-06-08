import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Battery,
  Bot,
  Brain,
  Building2,
  Check,
  CloudSun,
  Database,
  Droplets,
  LayoutDashboard,
  MapPin,
  Sparkles,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { FaqSection } from "@/app/components/FaqSection";
import { FAQPageSchema } from "@/app/components/StructuredData";
import { tayproMarketingImpactStats } from "@/app/data";
import { ORION_PRODUCT_PATH } from "@/lib/product-coming-soon";

const CAPABILITY_KEYS = [
  "capability0",
  "capability1",
  "capability2",
  "capability3",
  "capability4",
  "capability5",
] as const;
const CAPABILITY_ICONS = [Brain, MapPin, Battery, CloudSun, Droplets, Zap] as const;
const NECTYR_LIVE_KEYS = ["item0", "item1", "item2", "item3", "item4", "item5"] as const;
const WHY_SCALE_PILLAR_KEYS = ["pillar0", "pillar1", "pillar2"] as const;
const PLATFORM_LAYER_KEYS = ["layer0", "layer1", "layer2"] as const;
const PLATFORM_LAYER_ICONS = [Bot, LayoutDashboard, Sparkles] as const;
const LOOP_STEP_KEYS = ["step0", "step1", "step2", "step3", "step4"] as const;
const DATA_SIGNAL_KEYS = ["signal0", "signal1", "signal2", "signal3", "signal4", "signal5"] as const;
const DEEP_DIVE_KEYS = ["dive0", "dive1", "dive2"] as const;
const DEEP_DIVE_IMAGES = [
  "/tayproasset/taypro-robotFeature.webp",
  "/tayproasset/nectyr.webp",
  "/tayproasset/nectyr.png",
] as const;
const AUDIENCE_KEYS = ["segment0", "segment1", "segment2"] as const;
const AUDIENCE_ICONS = [Wrench, Building2, TrendingUp] as const;
const DATA_MOAT_BULLET_KEYS = ["bullet0", "bullet1", "bullet2", "bullet3"] as const;
const FAQ_KEYS = ["q0", "q1", "q2", "q3", "q4", "q5"] as const;

export default async function AiIntelligencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AiIntelligencePage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumb"), href: "" },
  ];

  const capabilities = CAPABILITY_KEYS.map((key, idx) => ({
    icon: CAPABILITY_ICONS[idx],
    title: t(`${key}.title`),
    body: t(`${key}.body`),
  }));

  const platformLayers = PLATFORM_LAYER_KEYS.map((key, idx) => ({
    icon: PLATFORM_LAYER_ICONS[idx],
    tag: t(`platformStack.${key}.tag`),
    title: t(`platformStack.${key}.title`),
    body: t(`platformStack.${key}.body`),
  }));

  const dataSignals = DATA_SIGNAL_KEYS.map((key) => ({
    title: t(`dataSignals.${key}.title`),
    body: t(`dataSignals.${key}.body`),
  }));

  const audienceSegments = AUDIENCE_KEYS.map((key, idx) => ({
    icon: AUDIENCE_ICONS[idx],
    title: t(`forWhom.${key}.title`),
    body: t(`forWhom.${key}.body`),
    link: t(`forWhom.${key}.link`),
    href: t(`forWhom.${key}.href`),
  }));

  const faqs = FAQ_KEYS.map((key) => ({
    question: t(`faq.${key}`),
    answer: t(`faq.a${key.slice(1)}`),
  }));

  const fleetStats = [
    {
      value: tayproMarketingImpactStats.dailyCleaningCapacityGw.value,
      label: t("fleetProof.dailyLabel"),
    },
    {
      value: tayproMarketingImpactStats.panelsCleanedAnnually.value,
      label: t("fleetProof.panelsLabel"),
    },
    {
      value: tayproMarketingImpactStats.plantInstallations.value,
      label: t("fleetProof.sitesLabel"),
    },
    {
      value: tayproMarketingImpactStats.robotCapacityDeployed.value,
      label: t("fleetProof.deployedLabel"),
    },
  ];

  const liveOpsCards = [
    { title: t("nectyrLive.trackingTitle"), body: t("nectyrLive.trackingBody") },
    { title: t("nectyrLive.predictiveTitle"), body: t("nectyrLive.predictiveBody") },
    { title: t("nectyrLive.autonomousTitle"), body: t("nectyrLive.autonomousBody") },
  ];

  return (
    <>
      <FAQPageSchema faqs={faqs} />
      <Breadcrumbs items={breadcrumbs} />

      <div className="min-h-screen overflow-x-hidden">
        {/* Hero */}
        <section className="relative py-16 md:py-24 bg-[#052638] overflow-hidden">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-4xl mx-auto text-center">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-4">
                {t("hero.eyebrow")}
              </p>
              <h1 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight mb-6">
                {t("hero.title")}
              </h1>
              <p className="text-white/85 text-lg leading-relaxed max-w-3xl mx-auto mb-4">
                {t("hero.body")}
              </p>
              <p className="text-white/70 text-base leading-relaxed max-w-3xl mx-auto mb-8">
                {t("hero.lead")}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                  className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
                >
                  {t("hero.ctaNectyr")}
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
                <Link
                  href="/cleaning-technology#ai-learning"
                  className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl border border-white/25 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
                >
                  {t("hero.ctaTechnology")}
                </Link>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Fleet proof stats */}
        <section className="py-12 md:py-16 bg-[#0a3347]" aria-label="Fleet scale metrics">
          <Container>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto mb-6">
              {fleetStats.map((item, idx) => (
                <AnimateOnScroll key={item.label} animation="fadeInUp" delay={idx * 60}>
                  <div className="rounded-2xl border border-white/15 bg-white/5 px-5 py-5 text-center">
                    <p className="text-[#A8C117] font-semibold text-2xl sm:text-3xl mb-1">
                      {item.value}
                    </p>
                    <p className="text-white/75 text-xs sm:text-sm leading-snug">{item.label}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
            <p className="text-white/50 text-xs text-center max-w-2xl mx-auto">
              {t("fleetProof.footnoteBefore")}{" "}
              <Link
                href="/performance-and-test-methodology"
                className="text-[#A8C117]/80 hover:text-[#A8C117] underline-offset-2 hover:underline"
              >
                {t("fleetProof.methodologyLink")}
              </Link>{" "}
              {t("fleetProof.footnoteAfter")}
            </p>
          </Container>
        </section>

        {/* Why scale matters */}
        <section className="py-14 md:py-20 bg-[#f4f7f9]" aria-labelledby="why-scale-heading">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                {t("whyScale.eyebrow")}
              </p>
              <h2 id="why-scale-heading" className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4">
                {t("whyScale.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">{t("whyScale.body")}</p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {WHY_SCALE_PILLAR_KEYS.map((key, idx) => (
                <AnimateOnScroll key={key} animation="fadeInUp" delay={idx * 70}>
                  <article className="h-full rounded-2xl border border-gray-200 bg-white p-6">
                    <h3 className="text-[#052638] font-semibold text-lg mb-2 leading-snug">
                      {t(`whyScale.${key}.title`)}
                    </h3>
                    <p className="text-[#27415c] text-sm leading-relaxed">
                      {t(`whyScale.${key}.body`)}
                    </p>
                  </article>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Platform stack */}
        <section className="py-14 md:py-20 bg-white" aria-labelledby="platform-stack-heading">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                {t("platformStack.eyebrow")}
              </p>
              <h2 id="platform-stack-heading" className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4">
                {t("platformStack.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">{t("platformStack.intro")}</p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {platformLayers.map((layer, idx) => {
                const Icon = layer.icon;
                return (
                  <AnimateOnScroll key={layer.title} animation="fadeInUp" delay={idx * 70}>
                    <article className="h-full rounded-2xl border border-gray-200 bg-[#f8fafb] p-6 md:p-7">
                      <p className="text-[#5a8f00] text-xs font-semibold uppercase tracking-wide mb-3">
                        {layer.tag}
                      </p>
                      <Icon className="w-8 h-8 text-[#5a8f00] mb-4" aria-hidden />
                      <h3 className="text-[#052638] font-semibold text-lg mb-3 leading-snug">
                        {layer.title}
                      </h3>
                      <p className="text-[#27415c] text-sm leading-relaxed">{layer.body}</p>
                    </article>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        {/* Data flywheel */}
        <section className="py-14 md:py-20 bg-[#052638]" aria-labelledby="flywheel-heading">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <AnimateOnScroll animation="fadeInLeft">
                <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                  {t("flywheel.eyebrow")}
                </p>
                <h2 id="flywheel-heading" className="text-white font-semibold text-3xl md:text-4xl mb-4">
                  {t("flywheel.heading")}
                </h2>
                <p className="text-white/85 text-base leading-relaxed mb-6">{t("flywheel.body")}</p>
                <p className="text-white/70 text-sm leading-relaxed mb-8">{t("flywheel.closing")}</p>
                <ol className="flex flex-wrap gap-2 sm:gap-3 list-none p-0 m-0">
                  {LOOP_STEP_KEYS.map((key, idx) => (
                    <li
                      key={key}
                      className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/90"
                    >
                      <span className="text-[#A8C117] font-semibold">{idx + 1}.</span>
                      {t(`flywheel.${key}`)}
                      {idx < LOOP_STEP_KEYS.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-white/40 hidden sm:inline" aria-hidden />
                      )}
                    </li>
                  ))}
                </ol>
              </AnimateOnScroll>
              <AnimateOnScroll animation="fadeInRight" delay={80}>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg ring-1 ring-white/10">
                  <Image
                    src="/tayproasset/nectyr.webp"
                    alt="NECTYR fleet intelligence dashboard"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </AnimateOnScroll>
            </div>
          </Container>
        </section>

        {/* Data signals */}
        <section
          id="data-signals"
          className="py-14 md:py-20 bg-[#f4f7f9]"
          aria-labelledby="data-signals-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                {t("dataSignals.eyebrow")}
              </p>
              <h2 id="data-signals-heading" className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4">
                {t("dataSignals.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">{t("dataSignals.intro")}</p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {dataSignals.map((signal, idx) => (
                <AnimateOnScroll key={signal.title} animation="fadeInUp" delay={idx * 60}>
                  <article className="h-full rounded-2xl border border-gray-200 bg-white p-6">
                    <Database className="w-6 h-6 text-[#5a8f00] mb-3" aria-hidden />
                    <h3 className="text-[#052638] font-semibold text-base mb-2 leading-snug">
                      {signal.title}
                    </h3>
                    <p className="text-[#27415c] text-sm leading-relaxed">{signal.body}</p>
                  </article>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Six AI capabilities */}
        <section
          id="ai-capabilities"
          className="py-14 md:py-20 bg-white"
          aria-labelledby="capabilities-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                {t("capabilities.eyebrow")}
              </p>
              <h2 id="capabilities-heading" className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4">
                {t("capabilities.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">{t("capabilities.intro")}</p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {capabilities.map((cap, idx) => {
                const Icon = cap.icon;
                return (
                  <AnimateOnScroll key={cap.title} animation="fadeInUp" delay={idx * 70}>
                    <article className="h-full rounded-2xl border border-gray-200 bg-[#f8fafb] p-6 hover:border-[#A8C117]/60 hover:shadow-sm transition">
                      <Icon className="w-7 h-7 text-[#5a8f00] mb-3" aria-hidden />
                      <h3 className="text-[#052638] font-semibold text-lg mb-2 leading-snug">
                        {cap.title}
                      </h3>
                      <p className="text-[#27415c] text-sm leading-relaxed">{cap.body}</p>
                    </article>
                  </AnimateOnScroll>
                );
              })}
            </div>
            <AnimateOnScroll animation="fadeInUp" delay={100} className="text-center mt-10 max-w-2xl mx-auto">
              <p className="text-[#27415c] text-sm leading-relaxed">
                {t("capabilities.hardwareCrossBefore")}{" "}
                <Link
                  href="/cleaning-technology"
                  className="text-[#5a8f00] font-medium hover:underline"
                >
                  {t("capabilities.hardwareCrossLink")}
                </Link>
                {t("capabilities.hardwareCrossAfter")}
              </p>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Deep dives */}
        <section className="py-14 md:py-20 bg-[#f4f7f9]" aria-labelledby="deep-dive-heading">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-12">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                {t("deepDive.eyebrow")}
              </p>
              <h2 id="deep-dive-heading" className="text-[#052638] font-semibold text-3xl md:text-4xl">
                {t("deepDive.heading")}
              </h2>
            </AnimateOnScroll>
            <div className="space-y-16 max-w-6xl mx-auto">
              {DEEP_DIVE_KEYS.map((key, idx) => {
                const imageRight = idx % 2 === 1;
                return (
                  <div
                    key={key}
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                      imageRight ? "lg:[&>*:first-child]:order-2" : ""
                    }`}
                  >
                    <AnimateOnScroll animation={imageRight ? "fadeInRight" : "fadeInLeft"}>
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md ring-1 ring-gray-200">
                        <Image
                          src={DEEP_DIVE_IMAGES[idx]}
                          alt={t(`deepDive.${key}.title`)}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </div>
                    </AnimateOnScroll>
                    <AnimateOnScroll animation={imageRight ? "fadeInLeft" : "fadeInRight"} delay={80}>
                      <h3 className="text-[#052638] font-semibold text-2xl mb-4 leading-snug">
                        {t(`deepDive.${key}.title`)}
                      </h3>
                      <p className="text-[#27415c] text-base leading-relaxed mb-4">
                        {t(`deepDive.${key}.body`)}
                      </p>
                      <p className="text-[#27415c]/90 text-sm leading-relaxed border-l-2 border-[#A8C117] pl-4">
                        {t(`deepDive.${key}.detail`)}
                      </p>
                    </AnimateOnScroll>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* NECTYR live intelligence */}
        <section className="py-14 md:py-20 bg-[#052638]" aria-labelledby="nectyr-live-heading">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                {t("nectyrLive.eyebrow")}
              </p>
              <h2 id="nectyr-live-heading" className="text-white font-semibold text-3xl md:text-4xl mb-4">
                {t("nectyrLive.heading")}
              </h2>
              <p className="text-white/80 text-lg leading-relaxed">{t("nectyrLive.intro")}</p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
              {liveOpsCards.map((card, idx) => (
                <AnimateOnScroll key={card.title} animation="fadeInUp" delay={idx * 70}>
                  <article className="h-full rounded-2xl border border-white/15 bg-white/5 p-6">
                    <h3 className="text-white font-semibold text-lg mb-3 leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">{card.body}</p>
                  </article>
                </AnimateOnScroll>
              ))}
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto mb-10">
              {NECTYR_LIVE_KEYS.map((key, idx) => (
                <AnimateOnScroll key={key} animation="fadeInUp" delay={idx * 50}>
                  <li className="flex gap-3 rounded-xl border border-white/15 bg-white/5 px-5 py-4 text-sm text-white/85 leading-relaxed list-none">
                    <Check className="w-4 h-4 text-[#A8C117] mt-0.5 shrink-0" aria-hidden />
                    {t(`nectyrLive.${key}`)}
                  </li>
                </AnimateOnScroll>
              ))}
            </ul>
            <AnimateOnScroll animation="fadeInUp" className="text-center">
              <Link
                href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#A8C117] text-[#052638] text-sm font-semibold hover:bg-[#b3cf3d] transition-colors"
              >
                {t("nectyrLive.nectyrLink")}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* For whom */}
        <section className="py-14 md:py-20 bg-white" aria-labelledby="for-whom-heading">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                {t("forWhom.eyebrow")}
              </p>
              <h2 id="for-whom-heading" className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4">
                {t("forWhom.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">{t("forWhom.intro")}</p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {audienceSegments.map((segment, idx) => {
                const Icon = segment.icon;
                return (
                  <AnimateOnScroll key={segment.title} animation="fadeInUp" delay={idx * 70}>
                    <article className="flex flex-col h-full rounded-2xl border border-gray-200 bg-[#f8fafb] p-6">
                      <Icon className="w-8 h-8 text-[#5a8f00] mb-4" aria-hidden />
                      <h3 className="text-[#052638] font-semibold text-lg mb-3 leading-snug">
                        {segment.title}
                      </h3>
                      <p className="text-[#27415c] text-sm leading-relaxed flex-1 mb-5">
                        {segment.body}
                      </p>
                      <Link
                        href={segment.href}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5a8f00] hover:underline"
                      >
                        {segment.link}
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                      </Link>
                    </article>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        {/* ORION roadmap */}
        <section className="py-14 md:py-20 bg-[#f4f7f9]" aria-labelledby="orion-heading">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                {t("orion.eyebrow")}
              </p>
              <h2 id="orion-heading" className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4">
                {t("orion.heading")}
              </h2>
              <p className="text-[#27415c] text-base leading-relaxed mb-8">{t("orion.body")}</p>
              <Link
                href={ORION_PRODUCT_PATH}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white text-[#052638] text-sm font-semibold hover:border-[#A8C117] hover:text-[#5a8f00] transition-colors"
              >
                {t("orion.cta")}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Data moat */}
        <section className="py-14 md:py-20 bg-[#052638]" aria-labelledby="data-moat-heading">
          <Container>
            <AnimateOnScroll animation="fadeInUp">
              <article className="max-w-4xl mx-auto rounded-2xl border border-[#A8C117]/30 bg-white/5 p-8 md:p-10">
                <div className="text-center mb-8">
                  <Sparkles className="w-8 h-8 text-[#A8C117] mx-auto mb-4" aria-hidden />
                  <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                    {t("dataMoat.eyebrow")}
                  </p>
                  <h2 id="data-moat-heading" className="text-white font-semibold text-2xl md:text-3xl mb-4">
                    {t("dataMoat.heading")}
                  </h2>
                  <p className="text-white/85 text-base leading-relaxed">{t("dataMoat.body")}</p>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {DATA_MOAT_BULLET_KEYS.map((key, idx) => (
                    <li
                      key={key}
                      className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/85 leading-relaxed list-none"
                    >
                      <Check className="w-4 h-4 text-[#A8C117] mt-0.5 shrink-0" aria-hidden />
                      {t(`dataMoat.${key}`)}
                    </li>
                  ))}
                </ul>
              </article>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* FAQ */}
        <FaqSection
          id="ai-intelligence-faq-heading"
          title={t("faq.title")}
          subtitle={t("faq.subtitle")}
          faqs={faqs}
          tone="muted"
          footer={
            <p className="text-center text-[#27415c] text-sm mt-6">
              <Link href="/cleaning-technology" className="text-[#5a8f00] font-medium hover:underline">
                {t("cta.cleaningTech")}
              </Link>
              {" · "}
              <Link
                href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                className="text-[#5a8f00] font-medium hover:underline"
              >
                {t("cta.nectyr")}
              </Link>
            </p>
          }
        />

        {/* CTAs */}
        <section className="py-14 md:py-20 bg-[#052638]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center">
              <h2 className="text-white font-semibold text-2xl md:text-3xl mb-8">
                {t("cta.heading")}
              </h2>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
                <Link
                  href="/cleaning-technology"
                  className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
                >
                  {t("cta.cleaningTech")}
                </Link>
                <Link
                  href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                  className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl border border-white/25 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
                >
                  {t("cta.nectyr")}
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl border border-white/25 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
                >
                  {t("cta.projects")}
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl border border-white/25 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
                >
                  {t("cta.contact")}
                </Link>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>
      </div>
    </>
  );
}
