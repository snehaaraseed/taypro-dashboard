import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  GitCompare,
  ClipboardCheck,
  Scale,
} from "lucide-react";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { ProjectsPageHero } from "@/app/components/ProjectsPageHero";
import {
  ItemListSchema,
} from "@/app/components/StructuredData";
import { listPublishedInsights } from "@/lib/cms/insightService";
import type { InsightMetadata } from "@/lib/cms/insightService";
import { RESEARCH_TOPIC_QUEUE } from "@/lib/insights/research-topics-config";
import { COMPARISON_PAGES } from "@/lib/seo/comparison-pages-config";
import { INSIGHTS_HUB_PATH } from "@/lib/seo/insights-hub";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { formatLocaleDateShort } from "@/i18n/format-date";

const siteUrl = SITE_URL;

const QUESTION_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "InsightsHubPage" });
  return withHreflang(INSIGHTS_HUB_PATH, locale, {
    title: t("meta.title"),
    description: t("meta.description"),
    openGraph: {
      title: `${t("meta.title")} | Taypro`,
      description: t("meta.description"),
      type: "website",
    },
  });
}

function InsightCard({
  insight,
  featured,
  locale,
  t,
}: {
  insight: InsightMetadata;
  featured?: boolean;
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  return (
    <article
      className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
        featured
          ? "border-[#A8C117]/60 ring-1 ring-[#A8C117]/30"
          : "border-gray-200/80"
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-[#052638]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#052638]">
          {t("badges.miniStudy")}
        </span>
        {insight.period ? (
          <span className="text-xs text-gray-500">
            {t("card.period", { period: insight.period })}
          </span>
        ) : null}
      </div>
      <h3
        className={`font-semibold text-[#052638] leading-snug ${
          featured ? "text-2xl" : "text-lg"
        }`}
      >
        {insight.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">
        {insight.description}
      </p>
      <p className="mt-3 text-xs text-gray-400">
        {formatLocaleDateShort(locale, insight.publishDate)}
      </p>
      <Link
        href={`${INSIGHTS_HUB_PATH}/${insight.slug}`}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#5a8f00] hover:underline"
      >
        {t("card.readReport")}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </article>
  );
}

function HubIntro({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  return (
    <div className="mb-12 max-w-3xl">
      <h2 className="text-2xl font-semibold text-[#052638]">{t("intro.title")}</h2>
      <p className="mt-4 text-base leading-relaxed text-gray-700">{t("intro.p1")}</p>
      <p className="mt-4 text-base leading-relaxed text-gray-700">{t("intro.p2")}</p>
    </div>
  );
}

function QuestionsBlock({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  return (
    <div className="mb-12 rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-[#052638]">{t("questions.title")}</h2>
      <ul className="mt-6 space-y-4">
        {QUESTION_KEYS.map((key) => (
          <li key={key} className="flex gap-3 text-sm leading-relaxed text-gray-700">
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#A8C117]"
              aria-hidden
            />
            {t(`questions.${key}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TopicAreasGrid({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold text-[#052638]">{t("topics.title")}</h2>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">{t("topics.subtitle")}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RESEARCH_TOPIC_QUEUE.map((topic) => (
          <div
            key={topic.id}
            className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm"
          >
            <h3 className="text-sm font-semibold leading-snug text-[#052638]">
              {topic.titleStem}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {topic.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsSection({
  insights,
  featured,
  rest,
  locale,
  t,
}: {
  insights: InsightMetadata[];
  featured: InsightMetadata | null;
  rest: InsightMetadata[];
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  if (insights.length === 0) {
    return (
      <div className="mb-12 rounded-2xl border border-dashed border-gray-300 bg-white px-8 py-10 text-center">
        <BarChart3 className="mx-auto h-10 w-10 text-gray-300" aria-hidden />
        <h2 className="mt-4 text-lg font-semibold text-[#052638]">{t("empty.title")}</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-gray-600">{t("empty.body")}</p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold text-[#052638]">{t("reports.title")}</h2>
      {featured ? (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#5a8f00]">
            {t("reports.featuredLabel")}
          </p>
          <InsightCard insight={featured} featured locale={locale} t={t} />
        </div>
      ) : null}
      {rest.length > 0 ? (
        <div className="mt-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {t("reports.archiveLabel")}
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((insight) => (
              <InsightCard key={insight.slug} insight={insight} locale={locale} t={t} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ToolsGrid({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  const tools = [
    {
      href: "/solar-panel-cleaning-robot-price-calculator#calculator",
      icon: Calculator,
      title: t("tools.calculatorTitle"),
      body: t("tools.calculatorBody"),
    },
    {
      href: COMPARISON_PAGES.robotVsManual.path,
      icon: GitCompare,
      title: t("tools.compareTitle"),
      body: t("tools.compareBody"),
    },
    {
      href: "/performance-and-test-methodology",
      icon: ClipboardCheck,
      title: t("tools.methodologyTitle"),
      body: t("tools.methodologyBody"),
    },
    {
      href: "/solar-cleaning-capex-vs-opex",
      icon: Scale,
      title: t("tools.capexTitle"),
      body: t("tools.capexBody"),
    },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold text-[#052638]">{t("tools.title")}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {tools.map(({ href, icon: Icon, title, body }) => (
          <Link
            key={href}
            href={href}
            className="group flex gap-4 rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm transition-shadow hover:border-[#A8C117]/40 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#052638]/8 text-[#052638]">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#052638] group-hover:text-[#5a8f00]">
                {title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{body}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function InsightsHubPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "InsightsHubPage" });

  const insights = (await listPublishedInsights(locale)).filter(
    (i) => i.reportType === "mini_study"
  );
  const featured = insights[0] ?? null;
  const rest = featured ? insights.slice(1) : insights;

  const itemList = insights.map((i) => ({
    name: i.title,
    url: `${siteUrl}${INSIGHTS_HUB_PATH}/${i.slug}`,
  }));

  return (
    <>
      {itemList.length > 0 ? (
        <ItemListSchema name={t("meta.title")} items={itemList} />
      ) : null}

      <Breadcrumbs items={[{ name: t("breadcrumb"), href: INSIGHTS_HUB_PATH }]} />

      <div className="min-h-screen overflow-x-hidden bg-white">
        <ProjectsPageHero
          eyebrow={t("hero.eyebrow")}
          title={t("hero.title")}
          lead={<p className="text-pretty">{t("hero.subtitle")}</p>}
          waveFill="#f4f7f9"
        />
        <section className="bg-[#f4f7f9] py-12 sm:py-16">
          <Container>
            <AnimateOnScroll animation="fadeInUp">
              <ReportsSection
                insights={insights}
                featured={featured}
                rest={rest}
                locale={locale}
                t={t}
              />
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInUp" delay={40}>
              <HubIntro t={t} />
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInUp" delay={80}>
              <QuestionsBlock t={t} />
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInUp" delay={120}>
              <TopicAreasGrid t={t} />
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInUp" delay={160}>
              <ToolsGrid t={t} />
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInUp" delay={200}>
              <div className="rounded-2xl border border-[#A8C117]/40 bg-[#052638] px-6 py-8 text-white sm:px-8">
                <h2 className="text-xl font-semibold">{t("cta.heading")}</h2>
                <p className="mt-3 max-w-2xl text-white/85">{t("cta.body")}</p>
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
