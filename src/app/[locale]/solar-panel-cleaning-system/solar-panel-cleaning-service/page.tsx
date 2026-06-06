import { modelBCards } from "@/app/data";
import {
  ClipboardList,
  Cpu,
  FileBarChart,
  Gauge,
  Handshake,
  Leaf,
  LineChart,
  MapPinned,
  Receipt,
  Route,
  ShieldCheck,
  Timer,
  TrendingUp,
  Users,
  UserCheck,
  Wallet,
  Warehouse,
} from "lucide-react";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import ModelCards from "@/app/components/ModelCards";
import ClientsCard from "@/app/components/ClientsCard";
import HeroSection from "@/app/components/Herosection";
import FeaturesSection from "@/app/components/FeaturesSection";
import CallbackCard from "@/app/components/CallbackCard";
import ResourcesCard from "@/app/components/ResourcesCard";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import ROICalculatorEmbed from "@/app/components/ROICalculatorEmbed";
import ProjectsCardServer from "@/app/components/ProjectsCardServer";
import { projectFilterForPage } from "@/lib/cms/project-page-filters";
import { FaqSection } from "@/app/components/FaqSection";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";
import {
  ServiceSchema,
  FAQPageSchema,
  HowToSchema,
} from "@/app/components/StructuredData";
import { Container } from "@/app/components/Container";
import { Link } from "@/i18n/navigation";
import { PRICE_GUIDE_PATH } from "@/lib/seo/robot-price-guide";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { getTranslations } from "next-intl/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

const FAQ_INDICES = ["0", "1", "2", "3", "4", "5", "6", "7", "8"] as const;
const ELIGIBILITY_FOR_KEYS = ["0", "1", "2"] as const;
const ELIGIBILITY_NOT_KEYS = ["0", "1", "2"] as const;
const SLA_KEYS = ["0", "1", "2", "3"] as const;
const HOWTO_INDICES = ["0", "1", "2", "3", "4"] as const;
const PLANT_STUDY_INDICES = ["0", "1", "2", "3", "4"] as const;
const BENEFIT_INDICES = ["0", "1", "2", "3", "4", "5"] as const;
const DELIVERABLE_KEYS = ["0", "1", "2", "3"] as const;
const FLEET_OPS_KEYS = ["0", "1", "2", "3"] as const;
const ADVANTAGE_KEYS = ["0", "1", "2", "3", "4", "5"] as const;
const OPEX_CAPEX_ROW_KEYS = ["0", "1", "2", "3"] as const;
const CADENCE_STAT_KEYS = ["0", "1", "2"] as const;

const DELIVERABLE_ICONS = [Route, Warehouse, FileBarChart, ShieldCheck] as const;
const FLEET_OPS_ICONS = [Users, LineChart, ClipboardList, MapPinned] as const;
const ADVANTAGE_ICONS = [
  UserCheck,
  ShieldCheck,
  TrendingUp,
  Leaf,
  Handshake,
  Wallet,
] as const;

export default async function SolarPanelCleaningService({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CleaningServicePage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.robots"), href: "/solar-panel-cleaning-system" },
    { name: t("breadcrumbs.current"), href: "" },
  ];

  const opexServiceFaqs = FAQ_INDICES.map((i) => ({
    question: t(`faqs.${i}.question`),
    answer: t(`faqs.${i}.answer`),
  }));

  const opexHowToSteps = HOWTO_INDICES.map((i) => ({
    name: t(`howToSteps.${i}.name`),
    text:
      i === "4"
        ? t(`howToSteps.${i}.text`, {
            connectivity: tCommon("connectivitySummary"),
          })
        : t(`howToSteps.${i}.text`),
  }));

  const plantStudyFactors = PLANT_STUDY_INDICES.map((i) => ({
    title: t(`plantStudy.${i}.title`),
    body: t(`plantStudy.${i}.body`),
  }));

  const benefits = BENEFIT_INDICES.map((i) => t(`benefits.${i}`));

  const deliverableCards = DELIVERABLE_KEYS.map((i, idx) => ({
    icon: DELIVERABLE_ICONS[idx],
    title: t(`deliverables.card${i}Title`),
    body: t(`deliverables.card${i}Body`),
  }));

  const fleetOpsCards = FLEET_OPS_KEYS.map((i, idx) => ({
    icon: FLEET_OPS_ICONS[idx],
    title: t(`fleetOps.card${i}Title`),
    body: t(`fleetOps.card${i}Body`),
  }));

  const advantageCards = ADVANTAGE_KEYS.map((i, idx) => ({
    icon: ADVANTAGE_ICONS[idx],
    title: t(`advantages.card${i}Title`),
    body: t(`advantages.card${i}Body`),
  }));

  const cadenceStats = CADENCE_STAT_KEYS.map((i) => ({
    value: t(`cadenceRoi.stat${i}Value`),
    label: t(`cadenceRoi.stat${i}Label`),
  }));

  const allFaqs = opexServiceFaqs;

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <ServiceSchema
        name={t("schema.name")}
        description={t("schema.description")}
        image={`${siteUrl}/tayprosolarpanel/taypro-cleaning-service.png`}
        url={`${siteUrl}/solar-panel-cleaning-system/solar-panel-cleaning-service`}
        provider="TAYPRO Private Limited"
        serviceType={t("schema.serviceType")}
      />
      <FAQPageSchema faqs={allFaqs} />
      <HowToSchema
        name={t("schema.name")}
        description={t("schema.description")}
        steps={opexHowToSteps}
        totalTime="P30D"
        image="/tayprosolarpanel/taypro-cleaning-service.png"
      />

      <div className="min-h-screen overflow-x-hidden">
        <HeroSection
          title={t("hero.title")}
          subtitle={
            <>
              {t("hero.subtitleBefore")}{" "}
              <strong>{t("hero.subtitlePanels")}</strong>.{" "}
              {t("hero.subtitleDeploy")}{" "}
              <Link
                href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                className="text-[#A8C117] hover:underline"
              >
                {t("hero.modelA")}
              </Link>
              ,{" "}
              <Link
                href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                className="text-[#A8C117] hover:underline"
              >
                {t("hero.modelB")}
              </Link>
              , {t("hero.subtitleOr")}{" "}
              <Link
                href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                className="text-[#A8C117] hover:underline"
              >
                {t("hero.modelT")}
              </Link>{" "}, {t("hero.subtitleProgramme")}{" "}
              <strong>{t("hero.subtitleCycles")}</strong>
              {t("hero.subtitleAfter")}{" "}
              <Link
                href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                className="text-[#A8C117] hover:underline"
              >
                {t("hero.console")}
              </Link>
              .
            </>
          }
          imgSrc="/tayprosolarpanel/taypro-cleaning-service.png"
          imgAlt={t("hero.imgAlt")}
          ctaHref="/contact"
          ctaText={t("hero.ctaText")}
        />

        {/* What is Taypro OPEX */}
        <section className="bg-white pt-12 sm:pt-20 pb-8">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("overview.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight">
                {t("overview.title")}
              </h2>
              <div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                <div>
                  {t("overview.p1Before")}
                  <strong>{t("overview.p1Strong")}</strong>
                  {t("overview.p1After")}
                  <strong>{t("overview.p1BillingStrong")}</strong>
                  {t("overview.p1Suffix")}
                </div>
                <div>
                  {t("overview.p2Before")}
                  <strong>{t("overview.p2StudyStrong")}</strong>
                  {t("overview.p2Mid")}
                  <strong>{t("overview.p2CyclesStrong")}</strong>
                  {t("overview.p2AfterCycles")}
                  <strong>{t("overview.p2PlanStrong")}</strong>
                  {t("overview.p2Mid2")}
                  <strong>{t("overview.p2RestStrong")}</strong>
                  {t("overview.p2AfterRest")}
                </div>
                <div>
                  {t("overview.p3Before")}
                  <strong>{t("overview.p3ReportsStrong")}</strong>
                  {t("overview.p3AfterReports")}
                  {tCommon("connectivitySummary")}
                  {t("overview.p3ConnectivitySuffix")}
                </div>
                <div>
                  {t("overview.p4Prefix")}
                  <Link
                    href="/blog/cost-benefit-analysis-of-solar-panel-cleaning-services-in-india"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("overview.linkBlogCost")}
                  </Link>
                  {t("overview.p4Mid")}
                  <Link
                    href="/blog/why-solar-power-plants-need-robotic-cleaning-for-maximum-roi"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("overview.linkBlogRoi")}
                  </Link>
                  {t("overview.p4Suffix")}
                </div>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Eligibility */}
        <section className="bg-[#f4f1e9] py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("eligibility.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight max-w-4xl mx-auto">
                {t("eligibility.title")}
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <AnimateOnScroll animation="fadeInUp" className="bg-white p-6 sm:p-8 rounded-lg border border-[#A8C117]/20">
                <h3 className="text-[#052638] font-semibold text-xl mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#A8C117]" />
                  {t("eligibility.forTitle")}
                </h3>
                <ul className="space-y-3 text-gray-600 text-base leading-relaxed list-disc pl-5">
                  {ELIGIBILITY_FOR_KEYS.map((i) => (
                    <li key={i}>{t(`eligibility.for${i}`)}</li>
                  ))}
                </ul>
              </AnimateOnScroll>
              <AnimateOnScroll animation="fadeInUp" className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200">
                <h3 className="text-[#052638] font-semibold text-xl mb-4">
                  {t("eligibility.notForTitle")}
                </h3>
                <ul className="space-y-3 text-gray-600 text-base leading-relaxed list-disc pl-5">
                  {ELIGIBILITY_NOT_KEYS.map((i) => (
                    <li key={i}>{t(`eligibility.not${i}`)}</li>
                  ))}
                </ul>
              </AnimateOnScroll>
            </div>
          </Container>
        </section>

        {/* Billing highlight */}
        <section className="bg-[#f4f1e9] py-16 sm:py-20">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white shadow-sm mb-6">
                <Receipt className="w-8 h-8 text-[#A8C117]" />
              </div>
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("billing.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight mb-6">
                {t("billing.title")}
              </h2>
              <div className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto mb-8">
                {t("billing.body")}
              </div>
              <OpenLeadModalButton
                topic={t("breadcrumbs.current")}
                title={t("billing.ctaTitle")}
                subtitle={t("billing.ctaSubtitle")}
                className="inline-block bg-[#A8C117] text-[#052638] font-medium px-8 sm:px-12 py-4 sm:py-5 rounded-md hover:bg-[#b3cf3d] transition text-base sm:text-lg"
              >
                {t("billing.ctaLabel")}
              </OpenLeadModalButton>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Plant study */}
        <section className="bg-white py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("plantStudySection.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight max-w-4xl mx-auto">
                {t("plantStudySection.title")}
              </h2>
              <div className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                {t("plantStudySection.subtitle")}
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plantStudyFactors.map((item) => (
                <AnimateOnScroll
                  key={item.title}
                  animation="fadeInUp"
                  className="bg-[#f4f1e9] p-6 rounded-lg border border-transparent hover:border-[#A8C117]/30 transition"
                >
                  <Cpu className="w-8 h-8 text-[#A8C117] mb-3" />
                  <h3 className="text-[#052638] font-semibold text-lg mb-2">
                    {item.title}
                  </h3>
                  <div className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {item.body}
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Deliverables */}
        <section className="bg-[#052638] py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("deliverables.eyebrow")}
              </div>
              <h2 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("deliverables.title")}
              </h2>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {deliverableCards.map((card) => {
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
                    <div className="text-white/80 text-base leading-relaxed">
                      {card.body}
                    </div>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        {/* Methodology */}
        <section className="bg-white py-16 sm:py-20">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("methodology.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight">
                {t("methodology.title")}
              </h2>
              <div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed border-l-4 border-[#A8C117] pl-6 sm:pl-8">
                <div>
                  {t("methodology.p1Before")}
                  <strong>{t("methodology.p1CompanyStrong")}</strong>
                  {t("methodology.p1After")}
                  <strong>{t("methodology.p1MwStrong")}</strong>
                  {t("methodology.p1Suffix")}
                </div>
                <div>
                  {t("methodology.p2Before")}
                  <strong>{t("methodology.p2OpexStrong")}</strong>
                  {t("methodology.p2Mid")}
                  <strong>{t("methodology.p2CyclesStrong")}</strong>
                  {t("methodology.p2AfterCycles")}
                  <strong>{t("methodology.p2GoalStrong")}</strong>
                  {t("methodology.p2Suffix")}
                </div>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <FeaturesSection
          headline={
            <>
              {t("featuresSection.headlineLine1")}
              <br />
              {t("featuresSection.headlineLine2")}
            </>
          }
          description={
            <>
              {t("featuresSection.descriptionBefore")}
              <strong>{t("featuresSection.descriptionStrong")}</strong>
              {t("featuresSection.descriptionAfter")}
            </>
          }
          benefits={benefits}
        />

        <section className="w-full pt-10 pb-24 bg-white">
          <Container>
            <AnimateOnScroll animation="fadeInUp">
              <h2 className="font-semibold text-3xl sm:text-4xl md:text-5xl text-[#052638] mb-6">
                {t("fleetOps.title")}
              </h2>
              <div className="mb-12 text-start text-lg text-gray-600 max-w-3xl">
                {t("fleetOps.subtitle")}
              </div>
            </AnimateOnScroll>
            <div className="grid gap-10 md:grid-cols-2">
              {fleetOpsCards.map((block) => {
                const Icon = block.icon;
                return (
                  <AnimateOnScroll
                    key={block.title}
                    animation="fadeInUp"
                    className="border border-gray-200 rounded-xl p-6 sm:p-8"
                  >
                    <Icon className="w-9 h-9 text-[#A8C117] mb-3" />
                    <h3 className="text-xl font-semibold text-[#052638] mb-3">
                      {block.title}
                    </h3>
                    <div className="text-gray-600 text-base leading-relaxed">
                      {block.body}
                    </div>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        {/* SLA */}
        <section className="bg-[#052638] py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("sla.eyebrow")}
              </div>
              <h2 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight max-w-4xl mx-auto">
                {t("sla.title")}
              </h2>
              <p className="text-white/80 text-base sm:text-lg max-w-3xl mx-auto mt-6 leading-relaxed">
                {t("sla.intro")}
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {SLA_KEYS.map((i) => (
                <AnimateOnScroll
                  key={i}
                  animation="fadeInUp"
                  className="bg-white/5 border border-white/10 p-6 sm:p-7 rounded-lg"
                >
                  <h3 className="text-white font-semibold text-xl mb-2">
                    {t(`sla.item${i}Title`)}
                  </h3>
                  <p className="text-white/80 text-base leading-relaxed">
                    {t(`sla.item${i}Body`)}
                  </p>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        <CallbackCard headerText={t("callbackHeader")} />

        {/* OPEX vs Capex */}
        <section className="w-full py-16 bg-[#f4f1e9]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl">
                {t("opexVsCapex.title")}
              </h2>
              <div className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mt-4">
                {t("opexVsCapex.subtitle")}
              </div>
            </AnimateOnScroll>
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
              <table className="w-full text-left text-sm sm:text-base">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 sm:px-6 font-semibold text-[#052638]">
                      {t("opexVsCapex.topic")}
                    </th>
                    <th className="py-3 px-4 sm:px-6 font-semibold text-[#A8C117]">
                      {t("opexVsCapex.opex")}
                    </th>
                    <th className="py-3 px-4 sm:px-6 font-semibold text-[#052638]">
                      {t("opexVsCapex.capex")}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#052638]">
                  {OPEX_CAPEX_ROW_KEYS.map((i) => (
                    <tr key={i} className="border-t border-gray-200">
                      <td className="py-3 px-4 sm:px-6 font-medium align-top">
                        {t(`opexVsCapex.row${i}.t`)}
                      </td>
                      <td className="py-3 px-4 sm:px-6 align-top">
                        {t(`opexVsCapex.row${i}.opex`)}
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-gray-600 align-top">
                        {t(`opexVsCapex.row${i}.capex`)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-center text-gray-600 mt-8 text-sm sm:text-base">
              {t("opexVsCapex.explorePrefix")}
              <Link
                href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                className="text-[#A8C117] hover:underline"
              >
                {t("opexVsCapex.linkModelA")}
              </Link>
              {t("opexVsCapex.linkBetweenAB")}
              <Link
                href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                className="text-[#A8C117] hover:underline"
              >
                {t("opexVsCapex.linkModelB")}
              </Link>
              {t("opexVsCapex.linkBetweenBT")}
              <Link
                href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                className="text-[#A8C117] hover:underline"
              >
                {t("opexVsCapex.linkModelT")}
              </Link>
              {t("opexVsCapex.linkBetweenTConsole")}
              <Link
                href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                className="text-[#A8C117] hover:underline"
              >
                {t("opexVsCapex.linkConsole")}
              </Link>
              {t("opexVsCapex.exploreSuffix")}
            </div>
          </Container>
        </section>

        <section
          className="py-14 md:py-20 bg-[#f4f7f9]"
          aria-labelledby="opex-roi-heading"
        >
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
              <h2
                id="opex-roi-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("roiSection.title")}
              </h2>
              <div className="text-[#27415c] text-lg leading-relaxed text-center">
                {t("roiSection.body")}
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeInUp" delay={100}>
              <ROICalculatorEmbed />
            </AnimateOnScroll>
          </Container>
        </section>

        <FaqSection
          id="opex-faq-heading"
          title={t("faqSection.title")}
          subtitle={t("faqSection.subtitle")}
          faqs={allFaqs}
        />

        <ClientsCard />

        <ProjectsCardServer
          useFileProjects
          showHeader
          headerText={t("projectsHeader")}
          filter={projectFilterForPage("opex")}
          locale={locale}
        />

        {/* Advantages */}
        <section className="w-full py-16 sm:py-20 bg-white">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("advantages.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("advantages.title")}
              </h2>
              <div className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                {t("advantages.subtitle")}
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {advantageCards.map((row) => {
                const Icon = row.icon;
                return (
                  <AnimateOnScroll
                    key={row.title}
                    animation="fadeInUp"
                    className="bg-[#f4f1e9] p-6 sm:p-7 rounded-lg flex flex-col items-start h-full"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-[#A8C117]/15 rounded-md mb-4">
                      <Icon className="text-[#A8C117] w-6 h-6" />
                    </div>
                    <h3 className="text-[#052638] font-semibold text-lg sm:text-xl mb-2">
                      {row.title}
                    </h3>
                    <div className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {row.body}
                    </div>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        {/* Duration & ROI, two-up cards */}
        <section className="w-full py-16 sm:py-20 bg-[#f4f1e9]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("cadenceRoi.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                {t("cadenceRoi.title")}
              </h2>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <AnimateOnScroll
                animation="fadeInUp"
                className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-[#A8C117]/15 rounded-xl mb-5">
                  <Timer className="text-[#A8C117] w-7 h-7" />
                </div>
                <h3 className="text-[#052638] font-semibold text-2xl sm:text-3xl mb-4 leading-snug">
                  {t("cadenceRoi.cycleTitle")}
                </h3>
                <div className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
                  {t("cadenceRoi.cycleBodyBefore")}
                  <strong>{t("cadenceRoi.cycleSpeedStrong")}</strong>
                  {t("cadenceRoi.cycleMid")}
                  <strong>{t("cadenceRoi.cycleRangeStrong")}</strong>
                  {t("cadenceRoi.cycleAfterRange")}
                  <strong>{t("cadenceRoi.cycleProgramStrong")}</strong>
                  {t("cadenceRoi.cycleMid2")}
                  <strong>{t("cadenceRoi.cycleCountStrong")}</strong>
                  {t("cadenceRoi.cycleSuffix")}
                </div>
                <div className="mt-auto grid grid-cols-3 gap-3 text-center">
                  {cadenceStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-[#f4f1e9] rounded-md py-3 px-2"
                    >
                      <div className="text-[#052638] font-semibold text-lg sm:text-xl">
                        {stat.value}
                      </div>
                      <div className="text-gray-500 text-xs sm:text-sm">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll
                animation="fadeInUp"
                delay={100}
                className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-[#A8C117]/15 rounded-xl mb-5">
                  <Gauge className="text-[#A8C117] w-7 h-7" />
                </div>
                <h3 className="text-[#052638] font-semibold text-2xl sm:text-3xl mb-4 leading-snug">
                  {t("cadenceRoi.roiTitle")}
                </h3>
                <div className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
                  {t("cadenceRoi.roiBodyBefore")}
                  <strong>{t("cadenceRoi.roiLossStrong")}</strong>
                  {t("cadenceRoi.roiAfterLoss")}
                </div>
                <div className="mt-auto flex flex-wrap gap-3 items-center">
                  <Link
                    href="/solar-panel-cleaning-robot-price-calculator#calculator"
                    className="inline-flex items-center bg-[#A8C117] text-[#052638] font-medium px-6 py-3 rounded-md hover:bg-[#b3cf3d] transition"
                  >
                    {t("cadenceRoi.roiCalculatorLink")}
                  </Link>
                  <Link
                    href={PRICE_GUIDE_PATH}
                    className="inline-flex items-center border border-[#052638] text-[#052638] font-medium px-6 py-3 rounded-md hover:bg-[#052638] hover:text-white transition"
                  >
                    {t("cadenceRoi.priceGuideLink")}
                  </Link>
                  <OpenLeadModalButton
                    topic={t("breadcrumbs.current")}
                    title={t("billing.ctaTitle")}
                    subtitle={t("billing.ctaSubtitle")}
                    className="inline-flex items-center border border-[#052638] text-[#052638] font-medium px-6 py-3 rounded-md hover:bg-[#052638] hover:text-white transition"
                  >
                    {t("cadenceRoi.roiCtaLabel")}
                  </OpenLeadModalButton>
                </div>
              </AnimateOnScroll>
            </div>
          </Container>
        </section>

        <ResourcesCard />

        <section className="w-full bg-white py-20 relative overflow-hidden min-h-[480px]">
          <div className="absolute top-7 left-0 right-0 mx-auto w-[98%] h-[85%] bg-[#f4f1e9] rounded-[36px] z-0" />

          <Container className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 items-center min-h-[380px]">
            <div className="flex flex-col justify-center h-full">
              <h2 className="text-[#052638] font-semibold text-4xl md:text-5xl lg:text-6xl mb-2">
                {t("skillSection.titleLine1")} <br />{" "}
                {t("skillSection.titleLine2")}
              </h2>
            </div>
            <div className="flex flex-col justify-center h-full relative">
              <div className="text-[#052638] text-lg md:text-xl leading-relaxed max-w-xl ml-auto">
                {t("skillSection.body")}
              </div>
              <svg
                className="hidden md:block absolute top-0 right-0 h-48 w-72 -z-0 opacity-50"
                viewBox="0 0 320 180"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M10,30 Q80,80 180,40 Q250,10 300,100"
                  stroke="#e0e0d2"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  d="M0,70 Q100,130 250,60 Q310,50 320,140"
                  stroke="#e0e0d2"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </Container>
        </section>

        <ModelCards title={t("modelCardsTitle")} cards={modelBCards} />

        <RequestEstimateForm />
      </div>
    </>
  );
}
