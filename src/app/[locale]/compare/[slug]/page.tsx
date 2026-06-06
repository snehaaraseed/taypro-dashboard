import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ComparisonLandingPage from "@/app/components/ComparisonLandingPage";
import CompetitorMarketComparisonPage from "@/app/components/CompetitorMarketComparisonPage";
import {
  COMPARISON_PAGE_LIST,
  getComparisonBySlug,
  type ComparisonPageId,
} from "@/lib/seo/comparison-pages-config";

export function generateStaticParams() {
  return COMPARISON_PAGE_LIST.map((page) => ({ slug: page.slug }));
}
import { withHreflang } from "@/lib/seo/with-hreflang";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const config = getComparisonBySlug(slug);
  if (!config) return { title: "Compare" };

  const t = await getTranslations({
    locale,
    namespace: "ComparisonsPage",
  });

  const pageId = config.id as ComparisonPageId;

  return withHreflang(config.path, locale, {
    title: t(`${pageId}.meta.title`),
    description: t(`${pageId}.meta.description`),
    openGraph: {
      title: `${t(`${pageId}.meta.title`)} | Taypro`,
      description: t(`${pageId}.meta.description`),
    },
  });
}

export default async function CompareSlugPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const config = getComparisonBySlug(slug);
  if (!config) notFound();

  if (config.id === "indianCompetitors") {
    return <CompetitorMarketComparisonPage locale={locale} />;
  }

  return (
    <ComparisonLandingPage pageId={config.id} locale={locale} />
  );
}
