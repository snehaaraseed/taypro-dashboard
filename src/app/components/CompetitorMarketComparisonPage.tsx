import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { FaqSection } from "@/app/components/FaqSection";
import { FAQPageSchema } from "@/app/components/StructuredData";
import TrackedLink from "@/app/components/TrackedLink";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";
import { ContactLeadInlineLink } from "@/app/components/ContactLeadInlineLink";
import {
  COMPARISON_PAGE_LIST,
  type ComparisonPageId,
} from "@/lib/seo/comparison-pages-config";

const MARKET_ROW_KEYS = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  "10", "11", "12", "13", "14", "15", "16", "17",
] as const;

const MARKET_COL_KEYS = [
  "taypro",
  "solabot",
  "aegeus",
  "skilancer",
  "vayu",
] as const;

const TAYPRO_LEAD_KEYS = ["0", "1", "2", "3", "4", "5", "6"] as const;
const FAQ_KEYS = ["0", "1", "2"] as const;

const PAIR_PAGE_IDS: ComparisonPageId[] = [
  "tayproVsSolabot",
  "tayproVsSkilancer",
  "tayproVsAegeus",
  "tayproVsVayu",
];

type CompetitorMarketComparisonPageProps = {
  locale: string;
};

export default async function CompetitorMarketComparisonPage({
  locale,
}: CompetitorMarketComparisonPageProps) {
  const t = await getTranslations({ locale, namespace: "ComparisonsPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const tLead = await getTranslations({ locale, namespace: "Forms.leadModal" });
  const ns = "indianCompetitors";

  const faqs = FAQ_KEYS.map((key) => ({
    question: t(`${ns}.faq.${key}.q`),
    answer: t(`${ns}.faq.${key}.a`),
  }));

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    {
      name: t("breadcrumbs.hub"),
      href: "/solar-panel-cleaning-system",
    },
    { name: t("breadcrumbs.compare"), href: "/compare/taypro-vs-indian-solar-cleaning-robot-companies" },
    { name: t(`${ns}.hero.title`), href: "" },
  ];

  const siblingLinks = COMPARISON_PAGE_LIST.filter((p) => p.id !== "indianCompetitors");

  return (
    <div className="bg-white min-h-screen">
      <FAQPageSchema faqs={faqs} />
      <Breadcrumbs items={breadcrumbs} />

      <section className="bg-[#052638] text-white py-14 md:py-20">
        <Container>
          <AnimateOnScroll animation="fadeInUp" eager>
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
              {t(`${ns}.hero.eyebrow`)}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight max-w-4xl">
              {t(`${ns}.hero.title`)}
            </h1>
            <p className="mt-5 text-gray-300 text-lg max-w-3xl leading-relaxed">
              {t(`${ns}.hero.lead`)}
            </p>
          </AnimateOnScroll>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <p className="text-[#27415c] text-base md:text-lg leading-relaxed max-w-4xl mb-4">
            {t(`${ns}.intro`)}
          </p>
          <p className="text-[#27415c]/80 text-sm md:text-base leading-relaxed max-w-4xl mb-10 italic">
            {t(`${ns}.sourceNote`)}
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold text-[#052638] mb-6">
            {t(`${ns}.tableHeading`)}
          </h2>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-left text-sm md:text-base">
              <thead className="bg-[#f4f1e9] text-[#052638]">
                <tr>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    {t(`${ns}.columns.criteria`)}
                  </th>
                  {MARKET_COL_KEYS.map((col) => (
                    <th
                      key={col}
                      className={`px-4 py-3 font-semibold whitespace-nowrap ${col === "taypro" ? "bg-[#e8efd4]" : ""}`}
                    >
                      {t(`${ns}.columns.${col}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MARKET_ROW_KEYS.map((key) => (
                  <tr key={key} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-[#052638] whitespace-nowrap">
                      {t(`${ns}.rows.${key}.factor`)}
                    </td>
                    {MARKET_COL_KEYS.map((col) => (
                      <td
                        key={col}
                        className={`px-4 py-3 text-[#27415c] ${col === "taypro" ? "bg-[#f9fbf3] font-medium" : ""}`}
                      >
                        {t(`${ns}.rows.${key}.${col}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16 bg-[#f9fafb]">
        <Container>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#052638] mb-8">
            {t(`${ns}.tayproLeads.heading`)}
          </h2>
          <div className="space-y-8 max-w-4xl">
            {TAYPRO_LEAD_KEYS.map((key) => (
              <div key={key}>
                <h3 className="text-lg md:text-xl font-semibold text-[#052638] mb-2">
                  {t(`${ns}.tayproLeads.items.${key}.title`)}
                </h3>
                <p className="text-[#27415c] leading-relaxed">
                  {t.rich(`${ns}.tayproLeads.items.${key}.body`, {
                    glydeX: (chunks) => (
                      <Link
                        href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                        className="text-[#5a8f00] font-medium hover:underline"
                      >
                        {chunks}
                      </Link>
                    ),
                    nyumaX: (chunks) => (
                      <Link
                        href="/solar-panel-cleaning-system/nyuma-x-single-axis-tracker-cleaning-robot"
                        className="text-[#5a8f00] font-medium hover:underline"
                      >
                        {chunks}
                      </Link>
                    ),
                  })}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16 bg-[#f9fafb]">
        <Container>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#052638] mb-4">
            {t(`${ns}.howToRead.heading`)}
          </h2>
          <p className="text-[#27415c] leading-relaxed max-w-4xl mb-6">
            {t(`${ns}.howToRead.body`)}
          </p>
          <p className="text-[#27415c] leading-relaxed max-w-4xl">
            {t.rich(`${ns}.howToRead.ctaLine`, {
              contact: (chunks) => (
                <ContactLeadInlineLink
                  source="competitor_compare_inline"
                  analyticsFormType="comparison_quote"
                >
                  {chunks}
                </ContactLeadInlineLink>
              ),
              calculator: (chunks) => (
                <Link
                  href="/solar-panel-cleaning-robot-price-calculator#calculator"
                  className="text-[#5a8f00] font-medium hover:underline"
                >
                  {chunks}
                </Link>
              ),
              hub: (chunks) => (
                <Link
                  href="/solar-panel-cleaning-system"
                  className="text-[#5a8f00] font-medium hover:underline"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </Container>
      </section>

      <section className="py-12 border-t border-gray-100">
        <Container>
          <h2 className="text-xl font-semibold text-[#052638] mb-4">
            Head-to-head vendor comparisons
          </h2>
          <ul className="space-y-2">
            {PAIR_PAGE_IDS.map((id) => (
              <li key={id}>
                <TrackedLink
                  href={COMPARISON_PAGE_LIST.find((p) => p.id === id)!.path}
                  trackType="compare"
                  trackTitle={t(`${id}.hero.title`)}
                  trackLocation="compare_page"
                  className="text-[#5a8f00] font-medium hover:underline"
                >
                  {t(`${id}.hero.title`)}
                </TrackedLink>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <FaqSection id="compare-faq" title="FAQ" faqs={faqs} tone="muted" />

      <section className="py-12 border-t border-gray-100">
        <Container>
          <h2 className="text-xl font-semibold text-[#052638] mb-4">
            More comparisons
          </h2>
          <ul className="space-y-2">
            {siblingLinks.map((link) => (
              <li key={link.id}>
                <TrackedLink
                  href={link.path}
                  trackType="compare"
                  trackTitle={t(`${link.id}.hero.title`)}
                  trackLocation="compare_page"
                  className="text-[#5a8f00] font-medium hover:underline"
                >
                  {t(`${link.id}.hero.title`)}
                </TrackedLink>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-14 bg-[#052638] text-white">
        <Container>
          <h2 className="text-2xl font-semibold mb-3">{t("cta.heading")}</h2>
          <p className="text-gray-300 max-w-2xl mb-6">{t("cta.body")}</p>
          <div className="flex flex-wrap gap-4">
            <OpenLeadModalButton
              source="competitor_compare"
              topic={tLead("topic")}
              title={tLead("title")}
              subtitle={tLead("subtitle")}
              leadIntent={tLead("topic")}
              formPrompt={tLead("formPrompt")}
              messageLabel={tLead("messageLabel")}
              messagePlaceholder={tLead("messagePlaceholder")}
              submitLabel={tLead("submitLabel")}
              thankYouTitle={tLead("thankYouTitle")}
              thankYouMessage={tLead("thankYouMessage")}
              showMessageField
              analyticsFormType="comparison_quote"
              className="inline-flex items-center justify-center min-h-[48px] bg-[#A8C117] text-[#052638] font-semibold px-6 py-3 rounded-md hover:bg-[#b8d12a] transition"
            >
              {t("cta.quote")}
            </OpenLeadModalButton>
            <TrackedLink
              href="/solar-panel-cleaning-robot-price-calculator#calculator"
              trackType="calculator"
              trackTitle={t("cta.calculator")}
              trackLocation="compare_page"
              className="inline-flex items-center justify-center min-h-[48px] border-2 border-white/70 text-white font-medium px-6 py-3 rounded-md hover:bg-white/10 transition"
            >
              {t("cta.calculator")}
            </TrackedLink>
          </div>
        </Container>
      </section>
    </div>
  );
}
