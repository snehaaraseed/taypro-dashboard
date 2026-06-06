import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { FaqSection } from "@/app/components/FaqSection";
import { FAQPageSchema } from "@/app/components/StructuredData";
import {
  COMPARISON_PAGE_LIST,
  type ComparisonPageId,
} from "@/lib/seo/comparison-pages-config";

const ROW_KEYS = ["0", "1", "2", "3", "4", "5"] as const;
const FAQ_KEYS = ["0", "1"] as const;

type ColumnKeys = {
  left: string;
  right: string;
  leftLabel: string;
  rightLabel: string;
};

const COLUMN_KEYS: Record<ComparisonPageId, ColumnKeys> = {
  robotVsManual: {
    left: "robot",
    right: "manual",
    leftLabel: "Robotic cleaning",
    rightLabel: "Manual cleaning",
  },
  tayproVsSolabot: {
    left: "taypro",
    right: "competitor",
    leftLabel: "Taypro",
    rightLabel: "Solabot",
  },
  tayproVsSkilancer: {
    left: "taypro",
    right: "competitor",
    leftLabel: "Taypro",
    rightLabel: "Skilancer",
  },
  waterlessVsWater: {
    left: "waterless",
    right: "water",
    leftLabel: "Waterless robotic",
    rightLabel: "Water-based",
  },
};

type ComparisonLandingPageProps = {
  pageId: ComparisonPageId;
  locale: string;
};

export default async function ComparisonLandingPage({
  pageId,
  locale,
}: ComparisonLandingPageProps) {
  const t = await getTranslations({ locale, namespace: "ComparisonsPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const ns = pageId;
  const columns = COLUMN_KEYS[pageId];
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
    { name: t("breadcrumbs.compare"), href: "/compare/solar-panel-cleaning-robot-vs-manual-cleaning" },
    { name: t(`${ns}.hero.title`), href: "" },
  ];

  const siblingLinks = COMPARISON_PAGE_LIST.filter((p) => p.id !== pageId);

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
          <p className="text-[#27415c] text-base md:text-lg leading-relaxed max-w-4xl mb-10">
            {t(`${ns}.intro`)}
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold text-[#052638] mb-6">
            {t(`${ns}.tableHeading`)}
          </h2>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-left text-sm md:text-base">
              <thead className="bg-[#f4f1e9] text-[#052638]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Factor</th>
                  <th className="px-4 py-3 font-semibold">{columns.leftLabel}</th>
                  <th className="px-4 py-3 font-semibold">{columns.rightLabel}</th>
                </tr>
              </thead>
              <tbody>
                {ROW_KEYS.map((key) => (
                  <tr key={key} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-[#052638]">
                      {t(`${ns}.rows.${key}.factor`)}
                    </td>
                    <td className="px-4 py-3 text-[#27415c]">
                      {t(`${ns}.rows.${key}.${columns.left}`)}
                    </td>
                    <td className="px-4 py-3 text-[#27415c]">
                      {t(`${ns}.rows.${key}.${columns.right}`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/solar-panel-cleaning-system"
              className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
            >
              {t("breadcrumbs.hub")}
            </Link>
            <span className="text-gray-300">·</span>
            <Link
              href="/solar-panel-cleaning-robot-price-calculator"
              className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
            >
              {t("cta.calculator")}
            </Link>
            <span className="text-gray-300">·</span>
            <Link
              href="/blog/taypro-wins-historic-patent-for-revolutionary-solar-panel-cleaning-system"
              className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
            >
              Taypro patent news
            </Link>
          </div>
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
                <Link
                  href={link.path}
                  className="text-[#5a8f00] font-medium hover:underline"
                >
                  {t(`${link.id}.hero.title`)}
                </Link>
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
            <Link
              href="/contact"
              className="inline-flex items-center justify-center min-h-[48px] bg-[#A8C117] text-[#052638] font-semibold px-6 py-3 rounded-md hover:bg-[#b8d12a] transition"
            >
              {t("cta.quote")}
            </Link>
            <Link
              href="/solar-panel-cleaning-robot-price-calculator#calculator"
              className="inline-flex items-center justify-center min-h-[48px] border-2 border-white/70 text-white font-medium px-6 py-3 rounded-md hover:bg-white/10 transition"
            >
              {t("cta.calculator")}
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
