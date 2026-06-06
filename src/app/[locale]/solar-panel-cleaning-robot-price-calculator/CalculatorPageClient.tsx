"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Droplets, IndianRupee, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";
import { FaqSection } from "@/app/components/FaqSection";
import ROICalculatorEmbed from "@/app/components/ROICalculatorEmbed";
import { robots, tayproTrustedByStatsStrip } from "@/app/data";

const BENEFIT_ICONS = [IndianRupee, Droplets, TrendingUp] as const;
const BENEFIT_KEYS = ["item0", "item1", "item2"] as const;
const HOW_IT_WORKS_KEYS = ["step0", "step1", "step2"] as const;
const FAQ_KEYS = ["0", "1", "2", "3", "4", "5", "6"] as const;
const EXPLORE_LINKS = [
  { labelKey: "explore.link4", href: "/solar-panel-cleaning-robot-price-india" },
  { labelKey: "explore.link0", href: "/solar-panel-cleaning-system" },
  { labelKey: "explore.link1", href: "/cleaning-technology" },
  { labelKey: "explore.link2", href: "/projects" },
  { labelKey: "explore.link3", href: "/contact" },
] as const;

type CalculatorPageClientProps = {
  exampleScenarios: ReactNode;
};

export default function CalculatorPageClient({
  exampleScenarios,
}: CalculatorPageClientProps) {
  const t = useTranslations("PriceCalculatorPage");
  const tCommon = useTranslations("Common");

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.calculator"), href: "" },
  ];

  const calculatorBenefits = BENEFIT_KEYS.map((key, idx) => ({
    icon: BENEFIT_ICONS[idx],
    title: t(`benefits.${key}.title`),
    description: t(`benefits.${key}.description`),
  }));

  const howItWorksSteps = HOW_IT_WORKS_KEYS.map((key, idx) => ({
    step: String(idx + 1).padStart(2, "0"),
    title: t(`howItWorks.${key}.title`),
    description: t(`howItWorks.${key}.description`),
  }));

  const calculatorFaqs = FAQ_KEYS.map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  const stats = tayproTrustedByStatsStrip.map((stat, i) => ({
    value: stat.value,
    label: t(`stats.stat${i}.label`),
  }));

  const translatedRobots = robots.slice(0, 4).map((robot, i) => ({
    ...robot,
    description: t(`models.robot${i}.description`),
  }));

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <div className="min-h-screen overflow-x-hidden">
        <div className="relative flex flex-col items-center justify-start overflow-hidden pb-6">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/tayprobglayout/taypro-roi-bg.png')",
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-white/92 sm:bg-white/88"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/55 to-[#f4f7f9]"
            aria-hidden
          />

          <AnimateOnScroll
            animation="fadeInUp"
            className="relative z-10 pt-10 px-4 max-w-4xl mx-auto pb-6 text-center"
          >
            <p className="text-[#A8C117] text-[16px] mb-4 uppercase tracking-wide font-medium">
              {t("hero.eyebrow")}
            </p>
            <h1 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-6 leading-tight">
              {t("hero.titleLine1")}
              <br />
              {t("hero.titleLine2")}
            </h1>
            <p className="text-[#22405a] text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
              {t("hero.bodyBeforeLink")}{" "}
              <Link
                href="/solar-panel-cleaning-system"
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                {t("hero.bodyLink")}
              </Link>{" "}
              {t("hero.bodyAfterLink")}{" "}
              <Link
                href="/solar-panel-cleaning-robot-price-india"
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                {t("hero.priceGuideLink")}
              </Link>
              {t("hero.priceGuideAfter")}
            </p>
          </AnimateOnScroll>

          <div
            id="calculator"
            className="relative z-10 w-full py-6 md:py-8 pb-16 md:pb-20"
            aria-labelledby="calculator-heading"
          >
            <Container>
              <h2 id="calculator-heading" className="sr-only">
                {t("hero.calculatorSrOnly")}
              </h2>
              <AnimateOnScroll animation="fadeInUp" delay={80}>
                <ROICalculatorEmbed />
                {exampleScenarios}
                <p className="mt-4 text-center text-[#5c6f82] text-sm max-w-2xl mx-auto leading-relaxed">
                  <strong className="text-[#27415c]">{t("note.label")}</strong>{" "}
                  {t("note.beforeOpexLink")}{" "}
                  <Link
                    href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                    className="text-[#5a8f00] hover:underline"
                  >
                    {t("note.opexLink")}
                  </Link>
                  {t("note.afterOpexLink")}
                </p>
                <div className="mt-6 max-w-2xl mx-auto rounded-xl border border-[#A8C117]/40 bg-[#052638]/5 px-5 py-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:gap-4">
                  <div>
                    <p className="text-[#052638] font-semibold text-sm sm:text-base">
                      {t("opexBanner.heading")}
                    </p>
                    <p className="text-[#5c6f82] text-sm mt-1 leading-relaxed">
                      {t("opexBanner.body")}
                    </p>
                  </div>
                  <Link
                    href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                    className="inline-flex items-center justify-center gap-1 mt-3 sm:mt-0 shrink-0 text-[#5a8f00] font-medium text-sm hover:underline underline-offset-4"
                  >
                    {t("opexBanner.cta")}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </AnimateOnScroll>
            </Container>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden pointer-events-none">
            <svg
              className="w-full h-20 md:h-32"
              viewBox="0 0 1440 320"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path fill="#052638" d="M0,224L1440,96L1440,320L0,320Z" />
            </svg>
          </div>
        </div>

        <div className="w-full py-12 md:py-14 bg-[#052638]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("stats.eyebrow")}
              </p>
              <h2 className="text-white font-semibold text-2xl md:text-3xl">
                {t("stats.heading")}
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 text-center">
              {stats.map((stat, idx) => (
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
                    {stat.label}
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </div>

        <div className="w-full py-14 md:py-16 bg-white" aria-labelledby="benefits-heading">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mb-10">
              <h2
                id="benefits-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("benefits.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("benefits.subheading")}
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {calculatorBenefits.map((item, idx) => (
                <AnimateOnScroll
                  key={item.title}
                  animation="fadeInUp"
                  delay={idx * 100}
                >
                  <div className="h-full rounded-xl border border-gray-200 bg-[#f8fafb] p-6 shadow-sm">
                    <item.icon
                      className="w-10 h-10 text-[#5a8f00] mb-4"
                      aria-hidden
                    />
                    <h3 className="text-[#052638] font-semibold text-xl mb-3">
                      {item.title}
                    </h3>
                    <p className="text-[#27415c] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </div>

        <div
          className="w-full py-14 md:py-16 bg-white"
          aria-labelledby="how-it-works-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center max-w-2xl mx-auto mb-10">
              <h2
                id="how-it-works-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("howItWorks.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("howItWorks.subheading")}
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {howItWorksSteps.map((step, idx) => (
                <AnimateOnScroll
                  key={step.step}
                  animation="fadeInUp"
                  delay={idx * 100}
                >
                  <div className="text-center md:text-left">
                    <span className="text-[#A8C117] font-bold text-4xl block mb-3">
                      {step.step}
                    </span>
                    <h3 className="text-[#052638] font-semibold text-xl mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[#27415c] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </div>

        <div className="w-full py-14 md:py-16 bg-[#f4f7f9]" aria-labelledby="models-heading">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mb-10">
              <h2
                id="models-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("models.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("models.subheading")}
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {translatedRobots.map((robot, idx) => (
                <AnimateOnScroll
                  key={robot.model}
                  animation="fadeInUp"
                  delay={idx * 80}
                >
                  <Link
                    href={robot.href}
                    className="group flex flex-col h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-[#A8C117] hover:shadow-md transition"
                  >
                    <h3 className="text-[#052638] font-semibold text-lg mb-2 group-hover:text-[#5a8f00] transition-colors">
                      {robot.model}
                    </h3>
                    <p className="text-[#27415c] text-sm leading-relaxed flex-1">
                      {robot.description}
                    </p>
                    <span className="mt-4 text-[#5a8f00] text-sm font-medium group-hover:underline inline-flex items-center gap-1">
                      {t("models.viewDetails")}
                      <ArrowRight className="w-4 h-4" aria-hidden />
                    </span>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </div>

        <div className="bg-[#052638] py-16 sm:py-20">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <p className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("methodology.eyebrow")}
              </p>
              <h2 className="text-white font-semibold text-3xl sm:text-4xl mb-6 leading-tight">
                {t("methodology.heading")}
              </h2>
              <div className="space-y-5 text-white/85 text-base sm:text-lg leading-relaxed">
                <p>{t("methodology.paragraph0")}</p>
                <p>
                  {t("methodology.paragraph1BeforeTech")}{" "}
                  <Link
                    href="/cleaning-technology"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("methodology.paragraph1TechLink")}
                  </Link>
                  {t("methodology.paragraph1Between")}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("methodology.paragraph1ModelA")}
                  </Link>
                  {t("methodology.paragraph1BetweenModels")}{" "}
                  <Link
                    href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("methodology.paragraph1ModelB")}
                  </Link>
                  {t("methodology.paragraph1Or")}{" "}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("methodology.paragraph1ModelT")}
                  </Link>
                  {t("methodology.paragraph1AfterModels")}{" "}
                  <Link
                    href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("methodology.paragraph1OpexLink")}
                  </Link>
                  {t("methodology.paragraph1AfterOpex")}{" "}
                  <Link
                    href="/solar-panel-cleaning-system"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("methodology.paragraph1OverviewLink")}
                  </Link>
                  {t("methodology.paragraph1End")}
                </p>
                <p>
                  {t("methodology.paragraph2BeforeNectyr")}{" "}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("methodology.paragraph2NectyrLink")}
                  </Link>
                  {t("methodology.paragraph2Between")}{" "}
                  <Link href="/projects" className="text-[#A8C117] hover:underline">
                    {t("methodology.paragraph2ProjectsLink")}
                  </Link>
                  {t("methodology.paragraph2End")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <OpenLeadModalButton
                  topic={t("methodology.ctaTopic")}
                  title={t("methodology.ctaTitle")}
                  subtitle={t("methodology.ctaSubtitle")}
                  className="inline-flex items-center justify-center min-h-[48px] bg-[#A8C117] text-[#052638] font-medium px-8 py-3.5 rounded-md hover:bg-[#b3cf3d] transition text-center"
                >
                  {t("methodology.ctaButton")}
                </OpenLeadModalButton>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center min-h-[48px] border-2 border-white/70 text-white font-medium px-8 py-3.5 rounded-md hover:bg-white/10 transition text-center"
                >
                  {t("methodology.contactButton")}
                </Link>
              </div>
            </AnimateOnScroll>
          </Container>
        </div>

        <FaqSection
          id="calculator-faq-heading"
          title={t("faq.heading")}
          subtitle={t("faq.subheading")}
          faqs={calculatorFaqs}
        />

        <div className="w-full py-14 md:py-16 bg-[#f4f7f9]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-3">
                {t("explore.heading")}
              </h2>
              <p className="text-[#27415c]">{t("explore.subheading")}</p>
            </AnimateOnScroll>
            <div className="flex flex-wrap justify-center gap-3">
              {EXPLORE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-[#052638] text-sm font-medium hover:border-[#A8C117] hover:text-[#5a8f00] transition shadow-sm"
                >
                  {t(link.labelKey)}
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              ))}
            </div>
          </Container>
        </div>
      </div>
    </>
  );
}
