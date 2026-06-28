import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import {
  Activity,
  BarChart3,
  Battery,
  CloudSun,
  Droplets,
  FileDown,
  Gauge,
  Headphones,
  LayoutDashboard,
  MapPin,
  Radio,
  Shield,
  Sliders,
  Ticket,
  Timer,
  Users,
} from "lucide-react";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import ProjectsCardServer from "@/app/components/ProjectsCardServer";
import { projectFilterForPage } from "@/lib/cms/project-page-filters";
import RelatedProductLineupSection from "@/app/components/RelatedProductLineupSection";
import { buildRelatedProductLineupRobots } from "@/lib/products/build-product-lineup";
import ClientsCard from "@/app/components/ClientsCard";
import EnergyResourceCard from "@/app/components/EnergyResourceCard";
import ProductHero from "@/app/components/ProductHero";
import { ProductVisualSection } from "@/app/components/ProductVisualSection";
import {
  buildProductHeroHighlights,
  productHeroBackgroundCredit,
  productHeroSecondaryCta,
} from "@/lib/products/product-hero-helpers";
import { resolveProductPageHeroBackground } from "@/lib/cms/product-page-hero-background";
import { FaqSection } from "@/app/components/FaqSection";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";
import { ContactLeadInlineLink } from "@/app/components/ContactLeadInlineLink";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import {
  SoftwareApplicationSchema,
  FAQPageSchema,
} from "@/app/components/StructuredData";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const nectyrPageUrl = `${siteUrl}/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app`;

const CAPABILITY_ICONS = [
  LayoutDashboard,
  Sliders,
  Timer,
  FileDown,
  BarChart3,
  Gauge,
  MapPin,
  Radio,
  Ticket,
  Users,
] as const;

const FAQ_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7"] as const;
const CAPABILITY_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
const INTELLIGENCE_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7", "8"] as const;

const INTELLIGENCE_ICONS = [
  MapPin,
  Gauge,
  Battery,
  Droplets,
  CloudSun,
  FileDown,
  Activity,
  Radio,
  LayoutDashboard,
] as const;

export default async function NectyrPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "NectyrPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const heroBackground = await resolveProductPageHeroBackground("console", locale);
  const heroHighlights = buildProductHeroHighlights(t);

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.robots"), href: "/solar-panel-cleaning-system" },
    { name: t("breadcrumbs.current"), href: "" },
  ];

  const nectyrFaqs = FAQ_KEYS.map((i) => ({
    question: t(`faq.q${i}`),
    answer:
      i === "5"
        ? t("faq.a5", {
            connectivity: tCommon("connectivitySummary"),
          })
        : t(`faq.a${i}`),
  }));

  const capabilityCards = CAPABILITY_KEYS.map((i, idx) => ({
    icon: CAPABILITY_ICONS[idx],
    title: t(`capabilitiesCards.${i}.title`),
    body: t(`capabilitiesCards.${i}.body`),
  }));

  const intelligenceCards = INTELLIGENCE_KEYS.map((i, idx) => ({
    icon: INTELLIGENCE_ICONS[idx],
    title: t(`intelligenceCards.${i}.title`),
    body: t(`intelligenceCards.${i}.body`),
  }));

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <SoftwareApplicationSchema
        name={t("schema.name")}
        description={t("schema.description")}
        image={`${siteUrl}/tayproasset/taypro-dashboard.png`}
        url={nectyrPageUrl}
        applicationCategory="WebApplication"
        operatingSystem="Web browser"
        offerPriceKey="nectyr"
      />
      <FAQPageSchema faqs={nectyrFaqs} />

      <div className="min-h-screen overflow-x-hidden">
        <ProductHero
          eyebrow={t("intro.eyebrow")}
          title={t("hero.title")}
          subtitle={t("hero.subtitleShort")}
          backgroundImage={heroBackground.src}
          backgroundAlt={heroBackground.alt}
          backgroundCredit={productHeroBackgroundCredit(heroBackground)}
          ctaHref="/contact"
          ctaText={t("hero.primaryCta.label")}
          ctaTopic={t("hero.primaryCta.topic")}
          ctaTitle={t("hero.primaryCta.title")}
          ctaSubtitle={t("hero.primaryCta.subtitle")}
          secondaryCta={productHeroSecondaryCta(t, "#deployments")}
          highlights={heroHighlights}
        />

        <section className="bg-white pt-4 sm:pt-8 pb-8">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("intro.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight">
                {t("intro.title")}
              </h2>
              <div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                <div>
                  {t("intro.p1Before")}{" "}
                  <strong>{t("intro.p1Strong")}</strong>{" "}
                  {t("intro.p1After")}
                </div>
                <div>
                  {t("intro.p2Before")}{" "}
                  <strong>{t("intro.p2Strong")}</strong>, multi-site
                  portfolios, multi-block plants, and mixed fleets of{" "}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                    className="brand-inline-link"
                  >
                    {t("intro.glyde")}
                  </Link>
                  ,{" "}
                  <Link
                    href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                    className="brand-inline-link"
                  >
                    {t("intro.helyx")}
                  </Link>
                  , and{" "}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                    className="brand-inline-link"
                  >
                    {t("intro.glydeX")}
                  </Link>{" "}
                  {t("intro.p2Mid")}{" "}
                  <strong>{t("intro.p2GuideStrong")}</strong>{" "}
                  {t("intro.p2End")}
                </div>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <ProductVisualSection
          imageSrc="/tayproasset/taypro-dashboard.png"
          imageAlt={t("hero.imgAlt")}
          eyebrow={t("productVisual.eyebrow")}
          title={t("productVisual.title")}
          caption={t("hero.imgAlt")}
        />

        <section
          className="w-full py-16 sm:py-20 bg-[#052638]"
          aria-labelledby="nectyr-intelligence-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                {t("intelligenceCapabilities.eyebrow")}
              </p>
              <h2
                id="nectyr-intelligence-heading"
                className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight max-w-4xl mx-auto"
              >
                {t("intelligenceCapabilities.title")}
              </h2>
              <p className="text-white/80 text-base sm:text-lg max-w-3xl mx-auto mt-6 leading-relaxed">
                {t("intelligenceCapabilities.subtitle")}
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInUp" delay={80} className="mb-12">
              <article className="max-w-3xl mx-auto rounded-2xl border border-[#A8C117]/30 bg-white/5 px-6 py-8 text-center">
                <p className="text-[#A8C117] font-semibold text-3xl sm:text-4xl mb-2 tabular-nums">
                  {t("intelligenceStat.value")}
                </p>
                <p className="text-white/70 text-sm uppercase tracking-wide mb-4">
                  {t("intelligenceStat.label")}
                </p>
                <p className="text-white/85 text-base leading-relaxed">
                  {t("intelligenceStat.body")}
                </p>
              </article>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {intelligenceCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <AnimateOnScroll
                    key={card.title}
                    animation="fadeInUp"
                    delay={idx * 60}
                    className="bg-white/5 border border-white/10 p-6 sm:p-7 rounded-lg flex flex-col items-start h-full hover:border-[#A8C117]/40 transition-colors"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-[#A8C117]/15 rounded-md mb-4">
                      <Icon className="text-[#A8C117] w-6 h-6" aria-hidden />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">
                      {card.title}
                    </h3>
                    <p className="text-white/75 text-sm sm:text-base leading-relaxed">
                      {card.body}
                    </p>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="w-full py-16 sm:py-20 bg-[#f4f1e9]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("capabilities.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight max-w-4xl mx-auto">
                {t("capabilities.title")}
              </h2>
              <div className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                {t("capabilities.subtitle")}
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {capabilityCards.map((card) => {
                const Icon = card.icon;
                return (
                  <AnimateOnScroll
                    key={card.title}
                    animation="fadeInUp"
                    className="bg-white p-6 sm:p-7 rounded-lg shadow-sm flex flex-col items-start h-full"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-[#A8C117]/15 rounded-md mb-4">
                      <Icon className="text-[#A8C117] w-6 h-6" />
                    </div>
                    <h3 className="text-[#052638] font-semibold text-lg mb-2">
                      {card.title}
                    </h3>
                    <div className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {card.body}
                    </div>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="w-full py-16 sm:py-20 bg-white">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("security.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("security.title")}
              </h2>
              <div className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                {t("security.subtitle")}
              </div>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Shield, titleKey: "card0Title", bodyKey: "card0Body" },
                {
                  icon: CloudSun,
                  titleKey: "card1Title",
                  bodyKey: "card1Body",
                },
                {
                  icon: Headphones,
                  titleKey: "card2Title",
                  bodyKey: "card2Body",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <AnimateOnScroll
                    key={item.titleKey}
                    animation="fadeInUp"
                    className="bg-[#f4f1e9] p-6 rounded-lg"
                  >
                    <Icon className="w-9 h-9 text-[#A8C117] mb-3" />
                    <h3 className="text-[#052638] font-semibold text-lg mb-2">
                      {t(`security.${item.titleKey}`)}
                    </h3>
                    <div className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {t(`security.${item.bodyKey}`)}
                    </div>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="w-full py-16 sm:py-20 bg-white">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("workflow.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight">
                {t("workflow.title")}
              </h2>
              <div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                <div>{t("workflow.p1")}</div>
                <div>
                  {t("workflow.p2Before")}{" "}
                  <Link
                    href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                    className="brand-inline-link"
                  >
                    {t("workflow.opexLink")}
                  </Link>{" "}
                  {t("workflow.p2After")}
                </div>
                <div>
                  {t("workflow.p3Before")}{" "}
                  <Link
                    href="/solar-panel-cleaning-system"
                    className="brand-inline-link"
                  >
                    {t("workflow.categoryLink")}
                  </Link>{" "}
                  {t("workflow.p3After")}
                </div>
                <div>
                  {t("workflow.p4Before")}{" "}
                  <Link
                    href="/blog/the-role-of-data-analytics-in-solar-panel-cleaning-improving-efficiency-with-taypro"
                    className="brand-inline-link"
                  >
                    {t("workflow.blogAnalytics")}
                  </Link>{" "}
                  {t("workflow.p4Mid")}{" "}
                  <Link
                    href="/blog/beyond-cleaning-how-automated-systems-can-monitor-solar-panel-performance"
                    className="brand-inline-link"
                  >
                    {t("workflow.blogMonitoring")}
                  </Link>
                  {t("workflow.p4End")}
                </div>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <section className="w-full py-16 sm:py-20 bg-[#f4f1e9]">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("scheduling.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight">
                {t("scheduling.title")}
              </h2>
              <div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                <div>{t("scheduling.p1")}</div>
                <ul className="list-disc pl-6 space-y-3">
                  {(["0", "1", "2", "3"] as const).map((i) => (
                    <li key={i}>
                      <strong>{t(`scheduling.li${i}Strong`)}</strong>{" "}
                      {t(`scheduling.li${i}`)}
                    </li>
                  ))}
                </ul>
                <div>
                  {t("scheduling.p2Before")}{" "}
                  <Link
                    href="/solar-panel-cleaning-robot-price-calculator#calculator"
                    className="brand-inline-link"
                  >
                    {t("scheduling.roiLink")}
                  </Link>{" "}
                  {t("scheduling.p2After")}
                </div>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <section
          className="w-full py-20 bg-white"
          style={{
            background: "url('/tayprobglayout/taypro-semi.png') repeat",
            backgroundSize: "auto",
          }}
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl lg:text-5xl leading-tight max-w-4xl mx-auto">
                {t("visual.title")}
              </h2>
              <div className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mt-4">
                {t("visual.subtitle")}
              </div>
            </AnimateOnScroll>

            <div className="block lg:hidden">
              <AnimateOnScroll animation="fadeInUp" delay={100}>
                <div className="relative w-full aspect-[16/10] overflow-hidden rounded-lg">
                  <Image
                    src="/tayproasset/nectyr.webp"
                    alt={t("visual.imageAlt")}
                    title="NECTYR"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="bg-[#7da300] p-6 mt-4 rounded-lg">
                  <h3 className="text-white text-start text-xl sm:text-2xl mb-4">
                    {t("visual.panelTitle")}
                  </h3>
                  <div className="text-white text-start text-sm sm:text-base leading-relaxed">
                    {t("visual.panelBody")}
                  </div>
                </div>
              </AnimateOnScroll>
            </div>

            <div className="hidden lg:block relative w-full aspect-[16/9] overflow-hidden rounded-lg">
              <Image
                src="/tayproasset/nectyr.webp"
                alt={t("visual.imageAlt")}
                title="NECTYR"
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1200px"
              />
              <div className="absolute right-6 xl:right-10 top-1/2 -translate-y-1/2 bg-[#7da300] p-6 sm:p-8 max-w-[min(100%,360px)] rounded-lg shadow-lg">
                <h3 className="text-white text-2xl mb-4 text-center sm:text-left">
                  {t("visual.panelTitle")}
                </h3>
                <div className="text-white text-sm sm:text-base leading-relaxed text-center sm:text-left">
                  {t("visual.panelBody")}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="w-full py-16 sm:py-20 bg-[#052638] border-t border-[#0c3c57]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-10 lg:gap-14 lg:items-start">
                <div className="min-w-0 text-center lg:text-left">
                  <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                    {t("cta.eyebrow")}
                  </div>
                  <h2 className="text-white font-semibold text-2xl sm:text-3xl md:text-4xl mb-4 leading-tight">
                    {t("cta.title")}
                  </h2>
                  <div className="text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    {t("cta.bodyBefore")}{" "}
                    <ContactLeadInlineLink
                      source="nectyr_support_inline"
                      topic={t("cta.supportLeadTopic")}
                      title={t("cta.supportLeadTitle")}
                      subtitle={t("cta.supportLeadSubtitle")}
                      leadIntent={t("cta.supportLeadTopic")}
                      formPrompt={t("cta.supportLeadFormPrompt")}
                      showMessageField
                      messageLabel={t("cta.supportLeadMessageLabel")}
                      messagePlaceholder={t("cta.supportLeadMessagePlaceholder")}
                      submitLabel={t("cta.supportLeadSubmitLabel")}
                      analyticsFormType="nectyr_support"
                      className="brand-inline-link font-medium"
                    >
                      {t("cta.emailServiceLink")}
                    </ContactLeadInlineLink>
                    {t("cta.bodyAfter")}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 w-full sm:justify-center lg:justify-start lg:w-auto lg:shrink-0 lg:pt-1">
                  <OpenLeadModalButton
                    topic={t("cta.leadTopic")}
                    title={t("cta.leadTitle")}
                    subtitle={t("cta.leadSubtitle")}
                    leadIntent={t("cta.leadTopic")}
                    formPrompt={t("cta.leadFormPrompt")}
                    submitLabel={t("cta.requestAccess")}
                    source="nectyr_page"
                    analyticsFormType="nectyr_access"
                    className="inline-flex items-center justify-center min-h-[48px] w-full sm:w-auto sm:min-w-[220px] bg-[#A8C117] text-[#052638] font-medium px-8 py-3.5 rounded-md hover:bg-[#b3cf3d] transition text-center"
                  >
                    {t("cta.requestAccess")}
                  </OpenLeadModalButton>
                  <OpenLeadModalButton
                    topic={t("cta.supportLeadTopic")}
                    title={t("cta.supportLeadTitle")}
                    subtitle={t("cta.supportLeadSubtitle")}
                    leadIntent={t("cta.supportLeadTopic")}
                    formPrompt={t("cta.supportLeadFormPrompt")}
                    showMessageField
                    messageLabel={t("cta.supportLeadMessageLabel")}
                    messagePlaceholder={t("cta.supportLeadMessagePlaceholder")}
                    submitLabel={t("cta.supportLeadSubmitLabel")}
                    source="nectyr_support"
                    analyticsFormType="nectyr_support"
                    className="inline-flex items-center justify-center min-h-[48px] w-full sm:w-auto sm:min-w-[220px] border-2 border-white text-white font-medium px-8 py-3.5 rounded-md hover:bg-white/10 transition text-center"
                  >
                    {t("cta.emailService")}
                  </OpenLeadModalButton>
                </div>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <FaqSection
          id="nectyr-faq-heading"
          title={t("faq.title")}
          subtitle={t("faq.subtitle")}
          faqs={nectyrFaqs}
        />

        <EnergyResourceCard
          title={t("energyResources.title")}
          subtitle={t("energyResources.subtitle")}
          ctaLabel={t("energyResources.ctaLabel")}
        />

        <div id="deployments">
          <ProjectsCardServer
            useFileProjects
            showHeader
            headerText={t("misc.projectsHeader")}
            filter={projectFilterForPage("console")}
            locale={locale}
          />
        </div>

        <ClientsCard />

        <RelatedProductLineupSection
          headingId="nectyr-related-heading"
          title={t("misc.productCardsTitle")}
          robots={buildRelatedProductLineupRobots("helyx")}
        />

        <RequestEstimateForm />
      </div>
    </>
  );
}
