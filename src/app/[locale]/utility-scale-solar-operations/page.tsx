import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { FaqSection } from "@/app/components/FaqSection";
import { FAQPageSchema } from "@/app/components/StructuredData";
import { UTILITY_SOLAR_OPERATIONS_PATH } from "@/lib/seo/utility-solar-operations";
import {
  ALL_STATE_LANDING_IDS,
  getStateLandingConfig,
  statePathById,
} from "@/lib/seo/state-landing-config";
import { PRICE_GUIDE_PATH } from "@/lib/seo/robot-price-guide";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { ORION_PRODUCT_PATH } from "@/lib/product-coming-soon";
import type { Metadata } from "next";

const siteUrl = SITE_URL;
const PROBLEM_KEYS = ["0", "1", "2", "3"] as const;
const PILLAR_KEYS = ["0", "1", "2"] as const;
const FAQ_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7"] as const;

const PILLAR_HREFS = [
  "/solar-panel-cleaning-system",
  "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
  ORION_PRODUCT_PATH,
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "UtilityOperationsPage.meta",
  });

  return withHreflang(UTILITY_SOLAR_OPERATIONS_PATH, locale, {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: `${siteUrl}${UTILITY_SOLAR_OPERATIONS_PATH}`,
      type: "article",
    },
  });
}

export default async function UtilitySolarOperationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "UtilityOperationsPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const faqs = FAQ_KEYS.map((key) => ({
    question: t(`faq.q${key}`),
    answer: t(`faq.a${key}`),
  }));

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumb"), href: "" },
  ];

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
            {t("hero.titleLine1")}{" "}
            <span className="text-[#A8C117]">{t("hero.titleHighlight")}</span>{" "}
            {t("hero.titleLine2")}
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/solar-panel-cleaning-system"
              className="inline-flex justify-center px-6 py-3 rounded-lg bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
            >
              {t("hero.ctaRobots")}
            </Link>
            <Link
              href="/company#investors"
              className="inline-flex justify-center px-6 py-3 rounded-lg border border-white/30 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
            >
              {t("hero.ctaCompany")}
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20 bg-white px-4 sm:px-6">
        <Container className="max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
              {t("problems.eyebrow")}
            </p>
            <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl">
              {t("problems.heading")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROBLEM_KEYS.map((key) => (
              <article
                key={key}
                className="rounded-2xl border border-gray-200 bg-[#f8fafb] p-6 md:p-8"
              >
                <p className="text-[#A8C117] text-xs font-semibold uppercase tracking-wider mb-2">
                  {t(`problems.card${key}.tag`)}
                </p>
                <p className="text-[#052638] font-semibold text-3xl mb-2">
                  {t(`problems.card${key}.stat`)}
                </p>
                <h3 className="text-[#052638] font-semibold text-lg mb-3">
                  {t(`problems.card${key}.label`)}
                </h3>
                <p className="text-[#27415c] text-sm leading-relaxed">
                  {t(`problems.card${key}.body`)}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20 bg-white px-4 sm:px-6">
        <Container className="max-w-3xl">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
            {t("soilingPr.eyebrow")}
          </p>
          <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-6">
            {t("soilingPr.heading")}
          </h2>
          <div className="space-y-4 text-[#27415c] text-base leading-relaxed mb-6">
            <p>{t("soilingPr.p1")}</p>
            <p>{t("soilingPr.p2")}</p>
            <p>{t("soilingPr.p3")}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={PRICE_GUIDE_PATH}
              className="inline-flex justify-center px-6 py-3 rounded-lg bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
            >
              {t("soilingPr.linkPriceGuide")}
            </Link>
            <Link
              href="/solar-panel-cleaning-robot-price-calculator#calculator"
              className="inline-flex justify-center px-6 py-3 rounded-lg border border-[#052638]/20 text-[#052638] font-medium hover:border-[#A8C117] transition-colors"
            >
              {t("soilingPr.linkCalculator")}
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16 bg-[#0a3a4a] px-4 sm:px-6">
        <Container className="max-w-3xl text-center">
          <h2 className="text-white font-semibold text-2xl md:text-3xl mb-4">
            {t("scada.heading")}
          </h2>
          <p className="text-[#A8C117] text-lg md:text-xl font-medium mb-4">
            {t("scada.lead")}
          </p>
          <p className="text-gray-300 text-base leading-relaxed">{t("scada.body")}</p>
        </Container>
      </section>

      <section className="py-14 md:py-20 bg-[#052638] px-4 sm:px-6">
        <Container className="max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
              {t("solution.eyebrow")}
            </p>
            <h2 className="text-white font-semibold text-3xl md:text-4xl">
              {t("solution.heading")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLAR_KEYS.map((key, idx) => (
              <article
                key={key}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8"
              >
                <p className="text-[#A8C117] text-xs font-semibold uppercase tracking-wider mb-2">
                  {t(`solution.pillar${key}.tag`)}
                </p>
                <h3 className="text-white font-semibold text-xl mb-3">
                  {t(`solution.pillar${key}.title`)}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {t(`solution.pillar${key}.body`)}
                </p>
                <Link
                  href={PILLAR_HREFS[idx]}
                  className="brand-inline-link text-sm font-medium"
                >
                  {t(`solution.pillar${key}.link`)}
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20 bg-white px-4 sm:px-6">
        <Container className="max-w-3xl">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
            {t("robotsSeo.eyebrow")}
          </p>
          <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4">
            {t("robotsSeo.heading")}
          </h2>
          <p className="text-[#27415c] text-lg leading-relaxed mb-6">
            {t("robotsSeo.bodyBefore")}{" "}
            <Link
              href="/solar-panel-cleaning-system"
              className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
            >
              {t("robotsSeo.hubLink")}
            </Link>{" "}
            {t("robotsSeo.bodyAfter")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/solar-panel-cleaning-system"
              className="inline-flex justify-center px-6 py-3 rounded-lg bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
            >
              {t("robotsSeo.ctaHub")}
            </Link>
            <Link
              href="/solar-panel-cleaning-robot-price-calculator#calculator"
              className="inline-flex justify-center px-6 py-3 rounded-lg border border-[#052638]/20 text-[#052638] font-medium hover:border-[#A8C117] transition-colors"
            >
              {t("robotsSeo.ctaRoi")}
            </Link>
            <Link
              href={PRICE_GUIDE_PATH}
              className="inline-flex justify-center px-6 py-3 rounded-lg border border-[#052638]/20 text-[#052638] font-medium hover:border-[#A8C117] transition-colors"
            >
              {t("robotsSeo.ctaPriceGuide")}
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-10 bg-[#f4f7f9] px-4 sm:px-6">
        <Container className="max-w-3xl">
          <h2 className="text-[#052638] font-semibold text-xl mb-3">
            {t("sources.heading")}
          </h2>
          <p className="text-[#27415c] text-sm mb-4">{t("sources.body")}</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href={t("sources.link0Href")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
              >
                {t("sources.link0Label")}
              </a>
            </li>
            <li>
              <a
                href={t("sources.link1Href")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
              >
                {t("sources.link1Label")}
              </a>
            </li>
            <li>
              <Link
                href="/performance-and-test-methodology"
                className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
              >
                {t("sources.link2Label")}
              </Link>
            </li>
          </ul>
        </Container>
      </section>

      <FaqSection
        id="utility-operations-faq-heading"
        title={t("faq.heading")}
        subtitle={t("faq.subheading")}
        faqs={faqs}
        tone="white"
      />

      <section className="py-14 md:py-16 bg-[#f4f7f9] px-4 sm:px-6">
        <Container className="max-w-3xl">
          <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-3">
            {t("stateGuides.heading")}
          </h2>
          <p className="text-[#27415c] text-base leading-relaxed mb-5">
            {t("stateGuides.intro")}
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {ALL_STATE_LANDING_IDS.map((stateId) => (
              <li key={stateId}>
                <Link
                  href={statePathById(stateId)}
                  className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
                >
                  {getStateLandingConfig(stateId).addressRegion}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-14 md:py-16 bg-[#052638] px-4 sm:px-6">
        <Container className="max-w-3xl text-center">
          <h2 className="text-white font-semibold text-2xl md:text-3xl mb-4">
            {t("cta.heading")}
          </h2>
          <p className="text-gray-300 mb-6">{t("cta.body")}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex justify-center px-6 py-3 rounded-lg bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
            >
              {t("cta.quote")}
            </Link>
            <Link
              href="/company#investors"
              className="inline-flex justify-center px-6 py-3 rounded-lg border border-white/30 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
            >
              {t("cta.company")}
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-8 bg-white px-4 sm:px-6 border-t border-gray-100">
        <Container className="max-w-3xl">
          <p className="text-[#27415c] text-base">
            {t("related.label")}{" "}
            <Link
              href="/cleaning-technology"
              className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
            >
              {t("related.cleaningTech")}
            </Link>
            ,{" "}
            <Link
              href="/projects"
              className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
            >
              {t("related.projects")}
            </Link>
            ,{" "}
            <Link
              href="/performance-and-test-methodology"
              className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
            >
              {t("related.methodology")}
            </Link>
            ,{" "}
            <Link
              href={PRICE_GUIDE_PATH}
              className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
            >
              {t("related.priceGuide")}
            </Link>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
