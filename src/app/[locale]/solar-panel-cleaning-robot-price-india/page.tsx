import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Check } from "lucide-react";
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
                className="inline-block mt-4 text-[#A8C117] text-sm font-medium hover:underline underline-offset-4"
              >
                {t("capexVsOpex.capexCta")}
              </Link>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-gray-300 text-sm leading-relaxed">{t("capexVsOpex.opexBody")}</p>
              <Link
                href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                className="inline-block mt-4 text-[#A8C117] text-sm font-medium hover:underline underline-offset-4"
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

      <section className="py-10 bg-[#f4f7f9] px-4 sm:px-6 border-t border-gray-100">
        <Container className="max-w-3xl">
          <h2 className="text-[#052638] font-semibold text-xl mb-4">{t("explore.heading")}</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/solar-panel-cleaning-system" className="text-[#5a8f00] font-medium hover:underline">
                {t("explore.linkHub")}
              </Link>
            </li>
            <li>
              <Link
                href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                className="text-[#5a8f00] font-medium hover:underline"
              >
                {t("explore.linkGlyde")}
              </Link>
            </li>
            <li>
              <Link
                href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                className="text-[#5a8f00] font-medium hover:underline"
              >
                {t("explore.linkService")}
              </Link>
            </li>
            <li>
              <Link href={UTILITY_SOLAR_OPERATIONS_PATH} className="text-[#5a8f00] font-medium hover:underline">
                {t("explore.linkUtilityOps")}
              </Link>
            </li>
            <li>
              <Link
                href="/solar-panel-cleaning-robot-price-calculator"
                className="text-[#5a8f00] font-medium hover:underline"
              >
                {t("explore.linkCalculator")}
              </Link>
            </li>
            <li>
              <Link
                href="/solar-panel-cleaning-robot-rajasthan"
                className="text-[#5a8f00] font-medium hover:underline"
              >
                {t("explore.linkRajasthan")}
              </Link>
            </li>
            <li>
              <Link
                href="/solar-panel-cleaning-robot-gujarat"
                className="text-[#5a8f00] font-medium hover:underline"
              >
                {t("explore.linkGujarat")}
              </Link>
            </li>
            <li>
              <Link
                href="/solar-panel-cleaning-robot-madhya-pradesh"
                className="text-[#5a8f00] font-medium hover:underline"
              >
                {t("explore.linkMadhyaPradesh")}
              </Link>
            </li>
            <li>
              <Link
                href="/solar-panel-cleaning-robot-karnataka"
                className="text-[#5a8f00] font-medium hover:underline"
              >
                {t("explore.linkKarnataka")}
              </Link>
            </li>
            <li>
              <Link
                href="/solar-panel-cleaning-robot-andhra-pradesh"
                className="text-[#5a8f00] font-medium hover:underline"
              >
                {t("explore.linkAndhraPradesh")}
              </Link>
            </li>
            <li>
              <Link
                href="/solar-panel-cleaning-robot-maharashtra"
                className="text-[#5a8f00] font-medium hover:underline"
              >
                {t("explore.linkMaharashtra")}
              </Link>
            </li>
            <li>
              <Link
                href="/solar-panel-cleaning-robot-uttar-pradesh"
                className="text-[#5a8f00] font-medium hover:underline"
              >
                {t("explore.linkUttarPradesh")}
              </Link>
            </li>
            <li>
              <Link
                href="/solar-panel-cleaning-robot-tamil-nadu"
                className="text-[#5a8f00] font-medium hover:underline"
              >
                {t("explore.linkTamilNadu")}
              </Link>
            </li>
          </ul>
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
