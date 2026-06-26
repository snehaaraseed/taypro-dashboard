import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { FaqSection } from "@/app/components/FaqSection";
import OpexPricingTable from "@/app/components/OpexPricingTable";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import ROICalculatorEmbed from "@/app/components/ROICalculatorEmbed";
import SoilingLossCalculator from "@/app/components/SoilingLossCalculator";
import ProjectsCardServer from "@/app/components/ProjectsCardServer";
import {
  FAQPageSchema,
  HowToSchema,
  ProductSchema,
  ServiceSchema,
  SoftwareApplicationSchema,
} from "@/app/components/StructuredData";
import {
  getBuyerIntentConfig,
  type BuyerIntentPageId,
  type BuyerIntentSection,
} from "@/lib/seo/buyer-intent-pages-config";
import {
  ALL_STATE_LANDING_IDS,
  getStateLandingConfig,
  statePathById,
} from "@/lib/seo/state-landing-config";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const STAT_KEYS = ["0", "1", "2", "3"] as const;
const CARD_KEYS = ["0", "1", "2", "3", "4", "5"] as const;
const PILLAR_KEYS = ["0", "1", "2"] as const;
const PRODUCT_KEYS = ["0", "1", "2"] as const;
const FAQ_KEYS = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
] as const;
const HOWTO_KEYS = ["0", "1", "2", "3"] as const;
const COST_ROW_KEYS = ["0", "1", "2", "3", "4", "5"] as const;
const STEP_KEYS = ["0", "1", "2", "3", "4"] as const;
const ELIGIBILITY_FOR_KEYS = ["0", "1", "2", "3"] as const;
const ELIGIBILITY_NOT_KEYS = ["0", "1", "2"] as const;
const RESOURCE_LINK_KEYS = ["0", "1", "2"] as const;
const MODEL_KEYS = ["capex", "opex"] as const;
const PROSE_PARAGRAPH_KEYS = ["p1", "p2", "p3", "p4", "p5", "p6"] as const;

type BuyerIntentLandingPageProps = {
  pageId: BuyerIntentPageId;
  locale: string;
};

function hasSection(
  sections: readonly BuyerIntentSection[],
  section: BuyerIntentSection
): boolean {
  return sections.includes(section);
}

function proseParagraphs(
  t: Awaited<ReturnType<typeof getTranslations>>,
  prefix: "prose" | "proseSecondary"
) {
  return PROSE_PARAGRAPH_KEYS.filter((key) => t.has(`${prefix}.${key}`)).map(
    (key) => <p key={key}>{t(`${prefix}.${key}`)}</p>
  );
}

export default async function BuyerIntentLandingPage({
  pageId,
  locale,
}: BuyerIntentLandingPageProps) {
  const config = getBuyerIntentConfig(pageId);
  const ns = config.namespace;
  const t = await getTranslations({ locale, namespace: ns });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const faqs = FAQ_KEYS.filter((key) => t.has(`faq.q${key}`)).map((key) => ({
    question: t(`faq.q${key}`),
    answer: t(`faq.a${key}`),
  }));

  const pageUrl = `${SITE_URL}${config.path}`;
  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    ...(t.has("breadcrumbHub")
      ? [{ name: t("breadcrumbHub"), href: t("breadcrumbHubHref") }]
      : []),
    { name: t("breadcrumb"), href: "" },
  ];

  const schemaBlock = (() => {
    if (config.schemaType === "service") {
      return (
        <ServiceSchema
          name={t("schema.name")}
          description={t("schema.description")}
          serviceType={t("schema.serviceType")}
          areaServed={t.has("schema.areaServed") ? t("schema.areaServed") : "India"}
          url={pageUrl}
          offerPriceKey={
            pageId === "opexPricing" ? ("opexService" as const) : undefined
          }
        />
      );
    }
    if (config.schemaType === "software") {
      return (
        <SoftwareApplicationSchema
          name={t("schema.name")}
          description={t("schema.description")}
          applicationCategory={
            t.has("schema.applicationCategory")
              ? t("schema.applicationCategory")
              : "BusinessApplication"
          }
          url={pageUrl}
        />
      );
    }
    return (
      <ProductSchema
        name={t("schema.name")}
        description={t("schema.description")}
        sku={t.has("schema.sku") ? t("schema.sku") : undefined}
      />
    );
  })();

  const howToSteps =
    pageId === "opexPricing"
      ? HOWTO_KEYS.map((key) => ({
          name: t(`howTo.step${key}Name`),
          text: t(`howTo.step${key}Text`),
        }))
      : [];

  return (
    <>
      {schemaBlock}
      {faqs.length > 0 ? <FAQPageSchema faqs={faqs} /> : null}
      {howToSteps.length > 0 ? (
        <HowToSchema
          name={t("howTo.name")}
          description={t("howTo.description")}
          steps={howToSteps}
        />
      ) : null}

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
              href={t("hero.ctaPrimaryHref")}
              className="inline-flex justify-center px-6 py-3 rounded-lg bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
            >
              {t("hero.ctaPrimary")}
            </Link>
            {t.has("hero.ctaSecondary") ? (
              <Link
                href={t("hero.ctaSecondaryHref")}
                className="inline-flex justify-center px-6 py-3 rounded-lg border border-white/30 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
              >
                {t("hero.ctaSecondary")}
              </Link>
            ) : null}
          </div>
        </Container>
      </section>

      {hasSection(config.sections, "stats") ? (
        <section className="py-14 md:py-20 bg-white px-4 sm:px-6">
          <Container className="max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("stats.eyebrow")}
              </p>
              <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl">
                {t("stats.heading")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {STAT_KEYS.map((key) =>
                t.has(`stats.card${key}.label`) ? (
                  <article
                    key={key}
                    className="rounded-2xl border border-gray-200 bg-[#f8fafb] p-6 md:p-8"
                  >
                    <p className="text-[#A8C117] text-xs font-semibold uppercase tracking-wider mb-2">
                      {t(`stats.card${key}.tag`)}
                    </p>
                    <p className="text-[#052638] font-semibold text-3xl mb-2">
                      {t(`stats.card${key}.stat`)}
                    </p>
                    <h3 className="text-[#052638] font-semibold text-lg mb-3">
                      {t(`stats.card${key}.label`)}
                    </h3>
                    <p className="text-[#27415c] text-sm leading-relaxed">
                      {t(`stats.card${key}.body`)}
                    </p>
                  </article>
                ) : null
              )}
            </div>
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "cards") ? (
        <section className="py-14 md:py-20 bg-[#f4f7f9] px-4 sm:px-6">
          <Container className="max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("cards.eyebrow")}
              </p>
              <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl">
                {t("cards.heading")}
              </h2>
              {t.has("cards.subheading") ? (
                <p className="text-[#27415c] mt-4 text-base leading-relaxed">
                  {t("cards.subheading")}
                </p>
              ) : null}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CARD_KEYS.map((key) =>
                t.has(`cards.card${key}.title`) ? (
                  <article
                    key={key}
                    className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8"
                  >
                    <h3 className="text-[#052638] font-semibold text-xl mb-3">
                      {t(`cards.card${key}.title`)}
                    </h3>
                    <p className="text-[#27415c] text-sm leading-relaxed">
                      {t(`cards.card${key}.body`)}
                    </p>
                  </article>
                ) : null
              )}
            </div>
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "models") ? (
        <section className="py-14 md:py-20 bg-white px-4 sm:px-6">
          <Container className="max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("models.eyebrow")}
              </p>
              <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl">
                {t("models.heading")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MODEL_KEYS.map((key) => (
                <article
                  key={key}
                  className="rounded-2xl border border-gray-200 bg-[#f8fafb] p-6 md:p-8"
                >
                  <h3 className="text-[#052638] font-semibold text-xl mb-3">
                    {t(`models.${key}.title`)}
                  </h3>
                  <p className="text-[#27415c] text-sm leading-relaxed mb-4">
                    {t(`models.${key}.body`)}
                  </p>
                  <Link
                    href={t(`models.${key}.href`)}
                    className="brand-inline-link text-sm font-medium"
                  >
                    {t(`models.${key}.link`)}
                  </Link>
                </article>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "pillars") && !config.pillarHrefs ? (
        <section className="py-14 md:py-20 bg-[#052638] px-4 sm:px-6">
          <Container className="max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("pillars.eyebrow")}
              </p>
              <h2 className="text-white font-semibold text-3xl md:text-4xl">
                {t("pillars.heading")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PILLAR_KEYS.map((key) =>
                t.has(`pillars.pillar${key}.title`) ? (
                  <article
                    key={key}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8"
                  >
                    {t.has(`pillars.pillar${key}.tag`) ? (
                      <p className="text-[#A8C117] text-xs font-semibold uppercase tracking-wider mb-2">
                        {t(`pillars.pillar${key}.tag`)}
                      </p>
                    ) : null}
                    <h3 className="text-white font-semibold text-xl mb-3">
                      {t(`pillars.pillar${key}.title`)}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {t(`pillars.pillar${key}.body`)}
                    </p>
                  </article>
                ) : null
              )}
            </div>
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "pillars") && config.pillarHrefs ? (
        <section className="py-14 md:py-20 bg-[#052638] px-4 sm:px-6">
          <Container className="max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("pillars.eyebrow")}
              </p>
              <h2 className="text-white font-semibold text-3xl md:text-4xl">
                {t("pillars.heading")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PILLAR_KEYS.map((key, idx) =>
                t.has(`pillars.pillar${key}.title`) ? (
                  <article
                    key={key}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8"
                  >
                    {t.has(`pillars.pillar${key}.tag`) ? (
                      <p className="text-[#A8C117] text-xs font-semibold uppercase tracking-wider mb-2">
                        {t(`pillars.pillar${key}.tag`)}
                      </p>
                    ) : null}
                    <h3 className="text-white font-semibold text-xl mb-3">
                      {t(`pillars.pillar${key}.title`)}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      {t(`pillars.pillar${key}.body`)}
                    </p>
                    {t.has(`pillars.pillar${key}.link`) ? (
                      <Link
                        href={config.pillarHrefs![idx] ?? "#"}
                        className="brand-inline-link text-sm font-medium"
                      >
                        {t(`pillars.pillar${key}.link`)}
                      </Link>
                    ) : null}
                  </article>
                ) : null
              )}
            </div>
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "prose") ? (
        <section className="py-14 md:py-20 bg-white px-4 sm:px-6">
          <Container className="max-w-3xl">
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
              {t("prose.eyebrow")}
            </p>
            <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-6">
              {t("prose.heading")}
            </h2>
            <div className="space-y-4 text-[#27415c] text-base leading-relaxed mb-6">
              {proseParagraphs(t, "prose")}
            </div>
            {t.has("prose.linkPrimary") ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={t("prose.linkPrimaryHref")}
                  className="inline-flex justify-center px-6 py-3 rounded-lg bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
                >
                  {t("prose.linkPrimary")}
                </Link>
                {t.has("prose.linkSecondary") ? (
                  <Link
                    href={t("prose.linkSecondaryHref")}
                    className="inline-flex justify-center px-6 py-3 rounded-lg border border-[#052638]/20 text-[#052638] font-medium hover:border-[#A8C117] transition-colors"
                  >
                    {t("prose.linkSecondary")}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "costComparison") ? (
        <section className="py-14 md:py-20 bg-[#f4f7f9] px-4 sm:px-6">
          <Container className="max-w-4xl">
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
              {t("costComparison.eyebrow")}
            </p>
            <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-6">
              {t("costComparison.heading")}
            </h2>
            <p className="text-[#27415c] text-base leading-relaxed mb-8">
              {t("costComparison.intro")}
            </p>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full min-w-[520px] text-sm text-left">
                <thead>
                  <tr className="bg-[#052638] text-white">
                    <th className="px-4 py-3 font-semibold">
                      {t("costComparison.colFactor")}
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      {t("costComparison.colManual")}
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      {t("costComparison.colRobotic")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COST_ROW_KEYS.filter((key) =>
                    t.has(`costComparison.row${key}.factor`)
                  ).map((key) => (
                    <tr
                      key={key}
                      className="border-t border-gray-100 even:bg-[#f8fafb]"
                    >
                      <td className="px-4 py-3 font-medium text-[#052638]">
                        {t(`costComparison.row${key}.factor`)}
                      </td>
                      <td className="px-4 py-3 text-[#27415c]">
                        {t(`costComparison.row${key}.manual`)}
                      </td>
                      <td className="px-4 py-3 text-[#27415c]">
                        {t(`costComparison.row${key}.robotic`)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "procurementComparison") ? (
        <section className="py-14 md:py-20 bg-[#f4f7f9] px-4 sm:px-6">
          <Container className="max-w-4xl">
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
              {t("procurementComparison.eyebrow")}
            </p>
            <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-6">
              {t("procurementComparison.heading")}
            </h2>
            <p className="text-[#27415c] text-base leading-relaxed mb-8">
              {t("procurementComparison.intro")}
            </p>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full min-w-[520px] text-sm text-left">
                <thead>
                  <tr className="bg-[#052638] text-white">
                    <th className="px-4 py-3 font-semibold">
                      {t("procurementComparison.colFactor")}
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      {t("procurementComparison.colCapex")}
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      {t("procurementComparison.colOpex")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COST_ROW_KEYS.filter((key) =>
                    t.has(`procurementComparison.row${key}.factor`)
                  ).map((key) => (
                    <tr
                      key={key}
                      className="border-t border-gray-100 even:bg-[#f8fafb]"
                    >
                      <td className="px-4 py-3 font-medium text-[#052638]">
                        {t(`procurementComparison.row${key}.factor`)}
                      </td>
                      <td className="px-4 py-3 text-[#27415c]">
                        {t(`procurementComparison.row${key}.capex`)}
                      </td>
                      <td className="px-4 py-3 text-[#27415c]">
                        {t(`procurementComparison.row${key}.opex`)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "proseSecondary") ? (
        <section className="py-14 md:py-20 bg-[#f4f7f9] px-4 sm:px-6">
          <Container className="max-w-3xl">
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
              {t("proseSecondary.eyebrow")}
            </p>
            <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-6">
              {t("proseSecondary.heading")}
            </h2>
            <div className="space-y-4 text-[#27415c] text-base leading-relaxed mb-6">
              {proseParagraphs(t, "proseSecondary")}
            </div>
            {t.has("proseSecondary.linkPrimary") ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={t("proseSecondary.linkPrimaryHref")}
                  className="inline-flex justify-center px-6 py-3 rounded-lg bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
                >
                  {t("proseSecondary.linkPrimary")}
                </Link>
                {t.has("proseSecondary.linkSecondary") ? (
                  <Link
                    href={t("proseSecondary.linkSecondaryHref")}
                    className="inline-flex justify-center px-6 py-3 rounded-lg border border-[#052638]/20 text-[#052638] font-medium hover:border-[#A8C117] transition-colors"
                  >
                    {t("proseSecondary.linkSecondary")}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "highlight") ? (
        <section className="py-12 md:py-16 bg-[#0a3a4a] px-4 sm:px-6">
          <Container className="max-w-3xl text-center">
            <h2 className="text-white font-semibold text-2xl md:text-3xl mb-4">
              {t("highlight.heading")}
            </h2>
            <p className="text-[#A8C117] text-lg md:text-xl font-medium mb-4">
              {t("highlight.lead")}
            </p>
            <p className="text-gray-300 text-base leading-relaxed">
              {t("highlight.body")}
            </p>
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "steps") ? (
        <section className="py-14 md:py-20 bg-white px-4 sm:px-6">
          <Container className="max-w-4xl">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("steps.eyebrow")}
              </p>
              <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl">
                {t("steps.heading")}
              </h2>
              {t.has("steps.subheading") ? (
                <p className="text-[#27415c] mt-4 text-base leading-relaxed">
                  {t("steps.subheading")}
                </p>
              ) : null}
            </div>
            <ol className="space-y-6">
              {STEP_KEYS.filter((key) => t.has(`steps.step${key}Title`)).map(
                (key, idx) => (
                  <li
                    key={key}
                    className="flex gap-4 rounded-2xl border border-gray-200 bg-[#f8fafb] p-6 md:p-8"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#052638] text-[#A8C117] font-semibold"
                      aria-hidden
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-[#052638] font-semibold text-lg mb-2">
                        {t(`steps.step${key}Title`)}
                      </h3>
                      <p className="text-[#27415c] text-sm leading-relaxed">
                        {t(`steps.step${key}Body`)}
                      </p>
                    </div>
                  </li>
                )
              )}
            </ol>
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "eligibility") ? (
        <section className="py-14 md:py-20 bg-[#f4f7f9] px-4 sm:px-6">
          <Container className="max-w-5xl">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("eligibility.eyebrow")}
              </p>
              <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl">
                {t("eligibility.title")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-2xl border border-[#A8C117]/30 bg-white p-6 md:p-8">
                <h3 className="text-[#052638] font-semibold text-lg mb-4">
                  {t("eligibility.forTitle")}
                </h3>
                <ul className="space-y-3 text-[#27415c] text-sm leading-relaxed">
                  {ELIGIBILITY_FOR_KEYS.filter((key) =>
                    t.has(`eligibility.for${key}`)
                  ).map((key) => (
                    <li key={key} className="flex gap-2">
                      <span className="text-[#A8C117] font-bold" aria-hidden>
                        ✓
                      </span>
                      {t(`eligibility.for${key}`)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
                <h3 className="text-[#052638] font-semibold text-lg mb-4">
                  {t("eligibility.notForTitle")}
                </h3>
                <ul className="space-y-3 text-[#27415c] text-sm leading-relaxed">
                  {ELIGIBILITY_NOT_KEYS.filter((key) =>
                    t.has(`eligibility.not${key}`)
                  ).map((key) => (
                    <li key={key} className="flex gap-2">
                      <span className="text-[#5c6f82] font-bold" aria-hidden>
                        —
                      </span>
                      {t(`eligibility.not${key}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "resources") ? (
        <section className="py-14 md:py-16 bg-white px-4 sm:px-6 border-t border-gray-100">
          <Container className="max-w-5xl">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("resources.eyebrow")}
              </p>
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl">
                {t("resources.heading")}
              </h2>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {RESOURCE_LINK_KEYS.filter((key) =>
                t.has(`resources.link${key}Title`)
              ).map((key) => (
                <li key={key}>
                  <Link
                    href={t(`resources.link${key}Href`)}
                    className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-[#f8fafb] p-5 transition hover:border-[#A8C117]/50 hover:bg-white hover:shadow-md"
                  >
                    <BookOpen
                      className="mb-3 h-5 w-5 text-[#5a8f00]"
                      aria-hidden
                    />
                    <span className="text-[#052638] font-semibold text-sm leading-snug group-hover:text-[#5a8f00]">
                      {t(`resources.link${key}Title`)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "opexTable") ? (
        <section className="py-14 md:py-20 bg-white px-4 sm:px-6">
          <Container className="max-w-5xl">
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
              {t("opexTable.eyebrow")}
            </p>
            <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4">
              {t("opexTable.heading")}
            </h2>
            <p className="text-[#27415c] text-base leading-relaxed mb-8">
              {t("opexTable.intro")}
            </p>
            <OpexPricingTable />
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "products") && config.productHrefs ? (
        <section className="py-14 md:py-20 bg-white px-4 sm:px-6">
          <Container className="max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("products.eyebrow")}
              </p>
              <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl">
                {t("products.heading")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PRODUCT_KEYS.map((key, idx) =>
                t.has(`products.product${key}.title`) &&
                config.productHrefs![idx] ? (
                  <article
                    key={key}
                    className="rounded-2xl border border-gray-200 bg-[#f8fafb] p-6 md:p-8 flex flex-col"
                  >
                    <h3 className="text-[#052638] font-semibold text-xl mb-3">
                      {t(`products.product${key}.title`)}
                    </h3>
                    <p className="text-[#27415c] text-sm leading-relaxed mb-4 flex-1">
                      {t(`products.product${key}.body`)}
                    </p>
                    <Link
                      href={config.productHrefs![idx]}
                      className="text-[#5a8f00] font-medium text-sm hover:underline underline-offset-4"
                    >
                      {t(`products.product${key}.link`)}
                    </Link>
                  </article>
                ) : null
              )}
            </div>
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "projects") &&
      t.has("projects.eyebrow") &&
      t.has("projects.heading") ? (
        <ProjectsCardServer
          showHeader
          headerText={
            <div className="text-center max-w-3xl mx-auto mb-2">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("projects.eyebrow")}
              </p>
              <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl">
                {t("projects.heading")}
              </h2>
              {t.has("projects.subheading") ? (
                <p className="text-[#27415c] mt-4 text-base leading-relaxed">
                  {t("projects.subheading")}
                </p>
              ) : null}
            </div>
          }
          filter={config.projectFilter}
          featuredSlugs={config.featuredProjectSlugs}
          limit={6}
          locale={locale}
          columns={3}
        />
      ) : null}

      {hasSection(config.sections, "roiCalculator") ? (
        <section className="py-14 md:py-20 bg-[#f4f7f9] px-4 sm:px-6" id="calculator">
          <Container className="max-w-5xl">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("calculator.eyebrow")}
              </p>
              <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl">
                {t("calculator.heading")}
              </h2>
              <p className="text-[#27415c] mt-4 text-base leading-relaxed">
                {t("calculator.subheading")}
              </p>
            </div>
            <ROICalculatorEmbed showDisclaimer />
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "soilingCalculator") ? (
        <section className="py-14 md:py-20 bg-[#f4f7f9] px-4 sm:px-6" id="soiling-calculator">
          <Container className="max-w-5xl">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("soilingCalculator.eyebrow")}
              </p>
              <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl">
                {t("soilingCalculator.heading")}
              </h2>
              <p className="text-[#27415c] mt-4 text-base leading-relaxed">
                {t("soilingCalculator.subheading")}
              </p>
            </div>
            <SoilingLossCalculator />
            {t.has("soilingCalculator.disclaimer") ? (
              <p className="mt-4 text-center text-[#5c6f82] text-sm max-w-2xl mx-auto leading-relaxed">
                {t("soilingCalculator.disclaimer")}
              </p>
            ) : null}
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "stateGrid") ? (
        <section className="py-14 md:py-16 bg-[#f4f7f9] px-4 sm:px-6">
          <Container className="max-w-3xl">
            <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-3">
              {t("stateGrid.heading")}
            </h2>
            <p className="text-[#27415c] text-base leading-relaxed mb-5">
              {t("stateGrid.intro")}
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
      ) : null}

      {faqs.length > 0 ? (
        <FaqSection
          id={`${pageId}-faq`}
          title={t("faq.heading")}
          subtitle={t("faq.subheading")}
          faqs={faqs}
          tone="white"
        />
      ) : null}

      {hasSection(config.sections, "cta") ? (
        <section className="py-14 md:py-16 bg-[#052638] px-4 sm:px-6">
          <Container className="max-w-3xl text-center">
            <h2 className="text-white font-semibold text-2xl md:text-3xl mb-4">
              {t("cta.heading")}
            </h2>
            <p className="text-gray-300 mb-6">{t("cta.body")}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href={t("cta.primaryHref")}
                className="inline-flex justify-center px-6 py-3 rounded-lg bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
              >
                {t("cta.primary")}
              </Link>
              {t.has("cta.secondary") ? (
                <Link
                  href={t("cta.secondaryHref")}
                  className="inline-flex justify-center px-6 py-3 rounded-lg border border-white/30 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
                >
                  {t("cta.secondary")}
                </Link>
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "related") ? (
        <section className="py-8 bg-white px-4 sm:px-6 border-t border-gray-100">
          <Container className="max-w-3xl">
            <p className="text-[#27415c] text-base">
              {t("related.label")}{" "}
              <Link
                href={t("related.link0Href")}
                className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
              >
                {t("related.link0")}
              </Link>
              ,{" "}
              <Link
                href={t("related.link1Href")}
                className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
              >
                {t("related.link1")}
              </Link>
              ,{" "}
              <Link
                href={t("related.link2Href")}
                className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
              >
                {t("related.link2")}
              </Link>
              {t.has("related.link3") ? (
                <>
                  ,{" "}
                  <Link
                    href={t("related.link3Href")}
                    className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
                  >
                    {t("related.link3")}
                  </Link>
                </>
              ) : null}
              .
            </p>
          </Container>
        </section>
      ) : null}

      {hasSection(config.sections, "requestForm") ? (
        <RequestEstimateForm
          variant="fullPage"
          eyebrow={t("quoteForm.eyebrow")}
          title={t("quoteForm.title")}
          messagePlaceholder={t("quoteForm.placeholder")}
          showMessageField
          analyticsFormType="buyer_intent_landing"
          analyticsSource={config.path}
          leadIntent={`Quote request — ${config.path}`}
        />
      ) : null}
    </>
  );
}
