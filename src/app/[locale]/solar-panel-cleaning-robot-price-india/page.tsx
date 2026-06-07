import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Check, MapPin } from "lucide-react";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { FaqSection } from "@/app/components/FaqSection";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import ROICalculatorEmbed from "@/app/components/ROICalculatorEmbed";
import { FAQPageSchema } from "@/app/components/StructuredData";
import {
  formatInr,
  getIndicativeCapexBands,
} from "@/lib/seo/robot-price-guide";
import { UTILITY_SOLAR_OPERATIONS_PATH } from "@/lib/seo/utility-solar-operations";

const COST_DRIVER_KEYS = ["0", "1", "2", "3", "4"] as const;
const MANUFACTURER_CHECK_KEYS = ["0", "1", "2", "3", "4"] as const;
const FAQ_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7"] as const;

const EXPLORE_PRIMARY_LINKS = [
  { labelKey: "explore.linkHub", href: "/solar-panel-cleaning-system" },
  {
    labelKey: "explore.linkGlyde",
    href: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
  },
  {
    labelKey: "explore.linkService",
    href: "/solar-panel-cleaning-system/solar-panel-cleaning-service",
  },
  { labelKey: "explore.linkUtilityOps", href: UTILITY_SOLAR_OPERATIONS_PATH },
  {
    labelKey: "explore.linkCalculator",
    href: "/solar-panel-cleaning-robot-price-calculator",
  },
] as const;

const EXPLORE_STATE_LINKS = [
  {
    labelKey: "explore.linkRajasthan",
    state: "Rajasthan",
    href: "/solar-panel-cleaning-robot-rajasthan",
  },
  {
    labelKey: "explore.linkGujarat",
    state: "Gujarat",
    href: "/solar-panel-cleaning-robot-gujarat",
  },
  {
    labelKey: "explore.linkMadhyaPradesh",
    state: "Madhya Pradesh",
    href: "/solar-panel-cleaning-robot-madhya-pradesh",
  },
  {
    labelKey: "explore.linkKarnataka",
    state: "Karnataka",
    href: "/solar-panel-cleaning-robot-karnataka",
  },
  {
    labelKey: "explore.linkAndhraPradesh",
    state: "Andhra Pradesh",
    href: "/solar-panel-cleaning-robot-andhra-pradesh",
  },
  {
    labelKey: "explore.linkMaharashtra",
    state: "Maharashtra",
    href: "/solar-panel-cleaning-robot-maharashtra",
  },
  {
    labelKey: "explore.linkUttarPradesh",
    state: "Uttar Pradesh",
    href: "/solar-panel-cleaning-robot-uttar-pradesh",
  },
  {
    labelKey: "explore.linkTamilNadu",
    state: "Tamil Nadu",
    href: "/solar-panel-cleaning-robot-tamil-nadu",
  },
] as const;

export default async function RobotPriceIndiaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "RobotPriceIndiaPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const capexBands = getIndicativeCapexBands();

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.current"), href: "" },
  ];

  const faqs = FAQ_KEYS.map((key) => ({
    question: t(`faq.q${key}`),
    answer: t(`faq.a${key}`),
  }));

  return (
    <>
      <FAQPageSchema faqs={faqs} />
      <Breadcrumbs items={breadcrumbs} />

      <section className="bg-[#052638] text-white py-14 md:py-20 px-4 sm:px-6">
        <Container className="max-w-4xl">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-4">
            {t("hero.eyebrow")}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-5">
            {t("hero.title")}
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/solar-panel-cleaning-robot-price-calculator#calculator"
              className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-lg bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
            >
              {t("hero.ctaCalculator")}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="inline-flex justify-center px-6 py-3 rounded-lg border border-white/30 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
            >
              {t("hero.ctaQuote")}
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-6 bg-[#fff8e6] border-b border-amber-200/60 px-4 sm:px-6">
        <Container className="max-w-4xl">
          <p className="text-[#27415c] text-sm leading-relaxed">
            <strong className="text-[#052638]">{t("disclaimer.label")}</strong>{" "}
            {t("disclaimer.body")}
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20 bg-white px-4 sm:px-6">
        <Container className="max-w-4xl">
          <AnimateOnScroll animation="fadeInUp">
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
              {t("costDrivers.eyebrow")}
            </p>
            <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4">
              {t("costDrivers.heading")}
            </h2>
            <p className="text-[#27415c] text-lg leading-relaxed mb-8">
              {t("costDrivers.intro")}
            </p>
            <ul className="space-y-6">
              {COST_DRIVER_KEYS.map((key) => (
                <li key={key} className="border-l-4 border-[#A8C117] pl-5">
                  <h3 className="text-[#052638] font-semibold text-lg mb-2">
                    {t(`costDrivers.item${key}.title`)}
                  </h3>
                  <p className="text-[#27415c] text-base leading-relaxed">
                    {t(`costDrivers.item${key}.body`)}
                  </p>
                </li>
              ))}
            </ul>
          </AnimateOnScroll>
        </Container>
      </section>

      <section className="py-14 md:py-20 bg-[#f4f7f9] px-4 sm:px-6">
        <Container className="max-w-5xl">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
            {t("capexBands.eyebrow")}
          </p>
          <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4">
            {t("capexBands.heading")}
          </h2>
          <p className="text-[#27415c] text-base leading-relaxed mb-8 max-w-3xl">
            {t("capexBands.intro")}
          </p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="bg-[#052638] text-white">
                  <th className="px-4 py-3 font-semibold">{t("capexBands.table.colPlant")}</th>
                  <th className="px-4 py-3 font-semibold">{t("capexBands.table.colInvestment")}</th>
                  <th className="px-4 py-3 font-semibold">{t("capexBands.table.colPayback")}</th>
                  <th className="px-4 py-3 font-semibold">{t("capexBands.table.colSavings")}</th>
                  <th className="px-4 py-3 font-semibold">{t("capexBands.table.colPerModule")}</th>
                </tr>
              </thead>
              <tbody>
                {capexBands.map((tier) => (
                  <tr key={tier.mw} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-[#052638]">
                      {t("capexBands.table.tierMw", { mw: tier.mw })}
                    </td>
                    <td className="px-4 py-3 text-[#27415c]">{formatInr(tier.investmentInr)}</td>
                    <td className="px-4 py-3 text-[#27415c]">{tier.paybackYears}</td>
                    <td className="px-4 py-3 text-[#27415c]">{formatInr(tier.annualSavingsInr)}</td>
                    <td className="px-4 py-3 text-[#27415c]">
                      {formatInr(tier.investmentPerModuleInr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[#27415c] text-sm mt-4">{t("capexBands.footnote")}</p>
        </Container>
      </section>

      <section className="py-14 md:py-16 bg-white px-4 sm:px-6">
        <Container className="max-w-3xl">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
            {t("costPerPanel.eyebrow")}
          </p>
          <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4">
            {t("costPerPanel.heading")}
          </h2>
          <p className="text-[#27415c] text-base leading-relaxed mb-4">{t("costPerPanel.p1")}</p>
          <p className="text-[#27415c] text-base leading-relaxed mb-4">{t("costPerPanel.p2")}</p>
          <Link
            href={UTILITY_SOLAR_OPERATIONS_PATH}
            className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
          >
            {t("costPerPanel.linkOperations")}
          </Link>
        </Container>
      </section>

      <section className="py-14 md:py-16 bg-[#052638] px-4 sm:px-6">
        <Container className="max-w-4xl">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
            {t("capexVsOpex.eyebrow")}
          </p>
          <h2 className="text-white font-semibold text-3xl md:text-4xl mb-6">
            {t("capexVsOpex.heading")}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-gray-300 text-sm leading-relaxed">{t("capexVsOpex.capexBody")}</p>
              <Link
                href="/solar-panel-cleaning-system"
                className="inline-block mt-4 brand-inline-link text-sm font-medium"
              >
                {t("capexVsOpex.capexCta")}
              </Link>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-gray-300 text-sm leading-relaxed">{t("capexVsOpex.opexBody")}</p>
              <Link
                href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                className="inline-block mt-4 brand-inline-link text-sm font-medium"
              >
                {t("capexVsOpex.opexCta")}
              </Link>
            </article>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-16 bg-white px-4 sm:px-6">
        <Container className="max-w-3xl">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
            {t("manufacturer.eyebrow")}
          </p>
          <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4">
            {t("manufacturer.heading")}
          </h2>
          <p className="text-[#27415c] text-base leading-relaxed mb-6">{t("manufacturer.body")}</p>
          <h3 className="text-[#052638] font-semibold text-lg mb-3">
            {t("manufacturer.checklistHeading")}
          </h3>
          <ul className="space-y-2">
            {MANUFACTURER_CHECK_KEYS.map((key) => (
              <li key={key} className="flex gap-2 text-[#27415c] text-sm">
                <Check className="w-5 h-5 text-[#A8C117] shrink-0 mt-0.5" aria-hidden />
                {t(`manufacturer.check${key}`)}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-14 md:py-16 bg-[#f4f7f9] px-4 sm:px-6">
        <Container className="max-w-3xl text-center">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
            {t("roiSummary.eyebrow")}
          </p>
          <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4">
            {t("roiSummary.heading")}
          </h2>
          <p className="text-[#27415c] text-base leading-relaxed mb-6">{t("roiSummary.body")}</p>
          <Link
            href="/solar-panel-cleaning-robot-price-calculator#calculator"
            className="inline-flex justify-center px-6 py-3 rounded-lg bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
          >
            {t("roiSummary.ctaCalculator")}
          </Link>
        </Container>
      </section>

      <section className="py-14 md:py-20 bg-white px-4 sm:px-6" id="calculator">
        <Container className="max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3">
              {t("calculator.heading")}
            </h2>
            <p className="text-[#27415c] text-base">{t("calculator.subheading")}</p>
          </div>
          <ROICalculatorEmbed />
        </Container>
      </section>

      <FaqSection
        id="robot-price-india-faq"
        title={t("faq.heading")}
        subtitle={t("faq.subheading")}
        faqs={faqs}
        tone="muted"
      />

      <section className="py-14 md:py-16 bg-[#f4f7f9] px-4 sm:px-6 border-t border-gray-100">
        <Container className="max-w-5xl">
          <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
            <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-3">
              {t("explore.heading")}
            </h2>
            <p className="text-[#27415c] text-base md:text-lg max-w-2xl mx-auto">
              {t("explore.subheading")}
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fadeInUp" delay={50}>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {EXPLORE_PRIMARY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-[#052638] hover:border-[#A8C117] hover:text-[#5a8f00] shadow-sm transition"
                >
                  {t(link.labelKey)}
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden />
                </Link>
              ))}
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fadeInUp" delay={100}>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
              <h3 className="text-[#052638] font-semibold text-lg md:text-xl text-center mb-6">
                {t("explore.statesHeading")}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {EXPLORE_STATE_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-label={t(link.labelKey)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-100 bg-[#f8fafb] px-3 py-3 text-sm font-medium text-[#052638] hover:border-[#A8C117] hover:bg-white hover:text-[#5a8f00] transition text-center"
                  >
                    <MapPin className="w-4 h-4 shrink-0 text-[#A8C117]" aria-hidden />
                    <span>{link.state}</span>
                  </Link>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </Container>
      </section>

      <RequestEstimateForm
        variant="fullPage"
        eyebrow={t("quoteForm.topic")}
        title={t("quoteForm.title")}
        messagePlaceholder={t("quoteForm.subtitle")}
      />
    </>
  );
}
