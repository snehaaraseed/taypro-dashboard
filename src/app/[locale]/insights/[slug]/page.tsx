import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { CompanyPageHero } from "@/app/components/CompanyPageHero";
import { InsightReportContent } from "@/app/components/InsightReportContent";
import { sanitizeResearchReportHtml } from "@/lib/insights/research-html-sanitize";
import { ArticleSchema } from "@/app/components/StructuredData";
import { getInsightBySlug, listPublishedInsights } from "@/lib/cms/insightService";
import type { CategoryPulseMetrics } from "@/lib/insights/category-pulse-data";
import { INSIGHTS_HUB_PATH } from "@/lib/seo/insights-hub";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { recoveryNotFoundMetadata } from "@/lib/seo/recovery-not-found-metadata";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { formatLocaleDate } from "@/i18n/format-date";
import { SOURCE_LOCALE } from "@/lib/translation/config";

const siteUrl = SITE_URL;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  const insights = await listPublishedInsights(SOURCE_LOCALE);
  return insights.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const insight = await getInsightBySlug(slug, { locale });
  if (!insight) {
    return recoveryNotFoundMetadata({ title: "Insight" });
  }
  const path = `${INSIGHTS_HUB_PATH}/${slug}`;
  return withHreflang(path, locale, {
    title: insight.metadata.title,
    description: insight.metadata.description,
    openGraph: {
      title: `${insight.metadata.title} | Taypro`,
      description: insight.metadata.description,
      type: "article",
    },
  });
}

function MetricsStrip({
  metrics,
  t,
}: {
  metrics: CategoryPulseMetrics;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  const items = [
    { label: t("metrics.queriesTracked"), value: metrics.summary.categoryQueriesTracked },
    { label: t("metrics.totalImpressions"), value: metrics.summary.totalImpressions },
    { label: t("metrics.totalClicks"), value: metrics.summary.totalClicks },
    {
      label: t("metrics.strikingDistance"),
      value: metrics.summary.strikingDistanceCount,
    },
    { label: t("metrics.lookbackDays"), value: metrics.lookbackDays },
  ];

  return (
    <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-gray-200/80 bg-gray-50 px-4 py-4 text-center"
        >
          <p className="text-2xl font-bold text-[#052638]">{item.value}</p>
          <p className="mt-1 text-xs text-gray-600">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

export default async function InsightDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const insight = await getInsightBySlug(slug, { locale });
  if (!insight) notFound();

  const t = await getTranslations({ locale, namespace: "InsightDetailPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const { metadata, content: rawContent } = insight;
  const content = sanitizeResearchReportHtml(rawContent);

  let metrics: CategoryPulseMetrics | null = null;
  try {
    metrics = JSON.parse(insight.metricsJson) as CategoryPulseMetrics;
  } catch {
    metrics = null;
  }

  const path = `${INSIGHTS_HUB_PATH}/${slug}`;

  return (
    <>
      <ArticleSchema
        headline={metadata.title}
        description={metadata.description}
        url={`${siteUrl}${path}`}
        datePublished={metadata.publishDate}
        dateModified={metadata.updatedAt ?? metadata.publishDate}
        author={{ name: "Taypro Team" }}
      />

      <Breadcrumbs
        items={[
          { name: tCommon("breadcrumbHome"), href: "/" },
          { name: t("breadcrumbInsights"), href: INSIGHTS_HUB_PATH },
          { name: metadata.title, href: "" },
        ]}
      />

      <div className="min-h-screen overflow-x-hidden">
        <CompanyPageHero
          eyebrow={
            metadata.reportType === "mini_study"
              ? t("eyebrowResearch")
              : metadata.reportType === "playbook"
                ? "Playbook"
                : metadata.reportType === "category_pulse"
                  ? "Category Pulse"
                  : t("eyebrowResearch")
          }
          title={metadata.title}
          subtitle={metadata.description}
          bodyBeforeLink={t("published", {
            date: formatLocaleDate(locale, metadata.publishDate),
          })}
          bodyLink={t("breadcrumbInsights")}
          bodyLinkHref={INSIGHTS_HUB_PATH}
          bodyAfterLink=""
        />

        <section className="py-12 sm:py-16 bg-[#f4f7f9]">
          <Container size="narrow">
            {metrics && metadata.reportType === "category_pulse" ? (
              <AnimateOnScroll animation="fadeInUp">
                <h2 className="mb-4 text-lg font-semibold text-[#052638]">
                  {t("metricsHeading")}
                </h2>
                <MetricsStrip metrics={metrics} t={t} />
              </AnimateOnScroll>
            ) : null}

            <AnimateOnScroll animation="fadeInUp" delay={60}>
              <InsightReportContent
                content={content}
                className="insight-report prose prose-lg max-w-none prose-headings:text-[#052638] prose-a:text-[#5a8f00] prose-table:text-sm bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8"
              />
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInUp" delay={120}>
              <div className="mt-14 rounded-2xl border border-[#A8C117]/40 bg-[#052638] px-6 py-8 text-white sm:px-8">
                <h2 className="text-xl font-semibold">{t("cta.heading")}</h2>
                <p className="mt-3 text-white/85">{t("cta.body")}</p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    href="/solar-panel-cleaning-robot-price-calculator#calculator"
                    className="inline-flex rounded-lg bg-[#A8C117] px-5 py-2.5 text-sm font-semibold text-[#052638] hover:bg-[#b8d127]"
                  >
                    {t("cta.calculator")}
                  </Link>
                  <Link
                    href="/performance-and-test-methodology"
                    className="inline-flex rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    {t("cta.methodology")}
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    {t("cta.contact")}
                  </Link>
                </div>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>
      </div>
    </>
  );
}
