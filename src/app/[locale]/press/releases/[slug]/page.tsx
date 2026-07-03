import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { CompanyPageHero } from "@/app/components/CompanyPageHero";
import { ArticleSchema } from "@/app/components/StructuredData";
import {
  getPressReleaseBySlug,
  listPublishedPressReleases,
} from "@/lib/cms/pressReleaseService";
import { PRESS_RELEASES_PATH } from "@/lib/press/press-export";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { recoveryNotFoundMetadata } from "@/lib/seo/recovery-not-found-metadata";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { formatLocaleDate } from "@/i18n/format-date";
import { SOURCE_LOCALE } from "@/lib/translation/config";
import { sanitizePressReleaseHtml } from "@/lib/security/sanitize-html";

const siteUrl = SITE_URL;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  const releases = await listPublishedPressReleases(SOURCE_LOCALE);
  return releases.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const release = await getPressReleaseBySlug(slug, { locale });
  if (!release) {
    return recoveryNotFoundMetadata({ title: "Press Release" });
  }
  const path = `${PRESS_RELEASES_PATH}/${slug}`;
  return withHreflang(path, locale, {
    title: release.title,
    description: release.subhead,
    openGraph: {
      title: `${release.title} | Taypro`,
      description: release.subhead,
      type: "article",
    },
  });
}

export default async function PressReleaseDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const release = await getPressReleaseBySlug(slug, { locale });
  if (!release) notFound();

  const t = await getTranslations({ locale, namespace: "PressReleasePage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const path = `${PRESS_RELEASES_PATH}/${slug}`;

  return (
    <>
      <ArticleSchema
        headline={release.title}
        description={release.subhead}
        url={`${siteUrl}${path}`}
        datePublished={release.publishDate}
        dateModified={release.updatedAt ?? release.publishDate}
        image={release.featuredImage || undefined}
        author={{ name: "Taypro" }}
        schemaType="NewsArticle"
        scriptId="press-release-schema"
      />

      <Breadcrumbs
        items={[
          { name: tCommon("breadcrumbHome"), href: "/" },
          { name: t("breadcrumbPress"), href: "/press" },
          { name: release.title, href: "" },
        ]}
      />

      <div className="min-h-screen overflow-x-hidden">
        <CompanyPageHero
          eyebrow={t("eyebrow")}
          title={release.title}
          subtitle={release.subhead}
          bodyBeforeLink={t("published", {
            date: formatLocaleDate(locale, release.publishDate),
          })}
          bodyLink={t("breadcrumbPress")}
          bodyLinkHref="/press"
          bodyAfterLink=""
        />

        <section className="py-12 sm:py-16 bg-[#f4f7f9]">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <article className="prose prose-lg max-w-none prose-headings:text-[#052638] prose-a:text-[#5a8f00] bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8">
                <p className="text-sm font-medium text-gray-500 not-prose mb-6">
                  {release.dateline}
                </p>
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizePressReleaseHtml(release.content),
                  }}
                />
                {release.quotes.map((q) => (
                  <blockquote key={q.attribution}>
                    <p>&ldquo;{q.text}&rdquo;</p>
                    <cite>— {q.attribution}</cite>
                  </blockquote>
                ))}
                <hr />
                <p className="text-sm text-gray-600">{release.boilerplate}</p>
                <p className="text-sm not-prose mt-6">
                  <strong>{t("mediaContact")}:</strong> {release.contact.name},{" "}
                  <a href={`mailto:${release.contact.email}`}>
                    {release.contact.email}
                  </a>
                  {release.contact.phone ? ` · ${release.contact.phone}` : null}
                </p>
              </article>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInUp" delay={80}>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/press"
                  className="inline-flex rounded-lg border border-[#052638] px-5 py-2.5 text-sm font-semibold text-[#052638] hover:bg-[#052638]/5"
                >
                  {t("backToPress")}
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex rounded-lg bg-[#052638] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0a3a4a]"
                >
                  {t("contactCta")}
                </Link>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>
      </div>
    </>
  );
}
