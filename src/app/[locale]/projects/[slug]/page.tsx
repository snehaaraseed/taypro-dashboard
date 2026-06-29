import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { formatLocaleDate } from "@/i18n/format-date";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { ArticleSchema, PlaceSchema } from "@/app/components/StructuredData";
import { AllRelatedProjectsSection } from "@/app/components/AllRelatedProjectsSection";
import { BlogContent } from "@/app/components/BlogContent";
import CallbackCard from "@/app/components/CallbackCard";
import { ProjectDetailHero } from "@/app/components/ProjectDetailHero";
import { ProjectDetailSidebar } from "@/app/components/ProjectDetailSidebar";
import { PROJECT_PLACE_BY_SLUG } from "@/app/data/projectPlaceSchema";
import {
  getAllFileProjects,
  getRelatedFileProjects,
} from "@/app/utils/projectFileUtils";
import {
  enrichProjectsForGrid,
  getPublishedProjectLocales,
  listAllProjects,
} from "@/lib/cms/projectService";
import {
  extractProjectHeroStats,
  projectDetailTags,
} from "@/lib/cms/project-detail-display";
import {
  hreflangLocalesOrAll,
  listProjectsForInternalLinking,
  redirectCmsDetailToEnglish,
  resolvePublishedProject,
} from "@/lib/cms/locale-fallback";
import { ProjectStatsTable } from "@/app/components/ProjectStatsTable";
import { stripComposedStatsSection } from "@/lib/cms/compose-project-content";
import { parseFactsJson } from "@/lib/cms/project-facts";
import { getStoredAuthors } from "@/lib/cms/authorService";
import { resolveAuthorSlug } from "@/app/data/blogAuthors";
import { getProjectHeroImageAlt } from "@/app/utils/imageAlt";
import { addInternalLinksToProject } from "@/app/utils/internalLinking";
import { rewriteCmsHrefs } from "@/lib/seo/cms-href-rewrites";
import { rewriteCmsImageSrcs } from "@/lib/seo/cms-image-rewrites";
import { addHeadingIdsAndExtractToc, normalizeHeadingLevels } from "@/lib/seo/html-toc";
import { socialImagesFromMedia } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { recoveryNotFoundMetadata } from "@/lib/seo/recovery-not-found-metadata";
import {
  applyRecovery,
  log404Hit,
  recoverProjectSlug,
} from "@/lib/url-recovery";

const siteUrl = SITE_URL;

function prepareCmsHtml(html: string): string {
  return rewriteCmsImageSrcs(rewriteCmsHrefs(html));
}

const proseClassName =
  "prose prose-lg max-w-none space-y-5 prose-headings:text-[#052638] prose-headings:font-semibold prose-headings:scroll-mt-28 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#5a8f00] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#052638] prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-table:w-full prose-table:border-collapse prose-th:bg-[#052638] prose-th:text-white prose-th:px-4 prose-th:py-3 prose-th:text-left prose-td:border prose-td:border-gray-200 prose-td:px-4 prose-td:py-3 prose-blockquote:border-l-4 prose-blockquote:border-[#A8C117] prose-blockquote:pl-4 prose-blockquote:italic prose-img:rounded-xl prose-img:w-full";

interface ProjectSlugParams {
  slug: string;
}

interface ProjectPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/** ISR with on-demand revalidate from admin project APIs. */
export const revalidate = 3600;

export async function generateStaticParams(): Promise<ProjectSlugParams[]> {
  const { listAllProjects } = await import("@/lib/cms/projectService");
  const { SOURCE_LOCALE } = await import("@/lib/translation/config");
  const projects = await listAllProjects(false, SOURCE_LOCALE);
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const resolved = await resolvePublishedProject(slug, locale);
  const t = await getTranslations({ locale, namespace: "ProjectDetailPage" });

  if (!resolved) {
    return recoveryNotFoundMetadata({
      title: t("notFoundTitle"),
    });
  }

  const { metadata } = resolved.post;
  const publishedLocales = hreflangLocalesOrAll(
    await getPublishedProjectLocales(slug)
  );
  const canonicalLocale = resolved.usesEnglishFallback ? "en" : locale;
  const url = `${siteUrl}/projects/${slug}`;
  const internalPath = `/projects/${slug}`;
  const shareImages = socialImagesFromMedia(
    metadata.image,
    getProjectHeroImageAlt(metadata),
    "projects"
  );

  return withHreflang(internalPath, canonicalLocale, {
    title: metadata.displayTitle,
    description: metadata.description,
    openGraph: {
      title: metadata.displayTitle,
      description: metadata.description,
      url,
      type: "website",
      ...shareImages.openGraph,
    },
    twitter: {
      title: metadata.displayTitle,
      description: metadata.description,
      ...shareImages.twitter,
    },
  }, { locales: publishedLocales });
}

export default async function DynamicProjectPage({ params }: ProjectPageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProjectDetailPage" });
  const tHub = await getTranslations({ locale, namespace: "ProjectsPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const resolved = await resolvePublishedProject(slug, locale);
  if (!resolved) {
    const publishedSlugs = (await listAllProjects(false, locale)).map(
      (row) => row.slug
    );
    const recovery = recoverProjectSlug(slug, publishedSlugs);
    applyRecovery(recovery);
    void log404Hit(
      `/projects/${slug}`,
      recovery.kind !== "none" ? recovery.destination : undefined
    );
    notFound();
  }
  if (resolved.usesEnglishFallback) {
    redirectCmsDetailToEnglish("project", slug);
  }

  const { metadata, content } = resolved.post;
  const authorName = metadata.author?.trim() || "Taypro Team";
  const authors = await getStoredAuthors();
  const authorSlug = resolveAuthorSlug(authorName, authors);
  const knownAuthor = authors.find((author) => author.slug === authorSlug);
  const displayAuthorName = knownAuthor?.name ?? authorName;
  const place = PROJECT_PLACE_BY_SLUG[slug];
  const relatedProjects = await getRelatedFileProjects(
    slug,
    metadata.details ?? [],
    locale,
    3
  );
  const relatedGridProjects = await enrichProjectsForGrid(relatedProjects, locale);

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbProjects"), href: "/projects" },
    { name: metadata.displayTitle, href: "" },
  ];

  const datePublished = metadata.date || new Date().toISOString().split("T")[0];
  const dateModified = metadata.updatedAt || metadata.date || datePublished;
  const lastUpdatedDisplay = formatLocaleDate(locale, dateModified);

  const heroStats = extractProjectHeroStats(
    metadata.details,
    metadata.title,
    parseFactsJson(metadata.factsJson)
  );
  const detailTags = projectDetailTags(metadata.details, metadata.title);
  const projectFacts = parseFactsJson(metadata.factsJson);
  const readingMinutes = content
    ? Math.max(
        1,
        Math.ceil(
          content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length /
            220
        )
      )
    : 0;

  const projectLinkSources = await listProjectsForInternalLinking(locale);

  const contentWithInternalLinks = content
    ? prepareCmsHtml(
        addInternalLinksToProject(prepareCmsHtml(content), projectLinkSources, slug, 8)
      )
    : "";

  const contentForDisplay = projectFacts
    ? stripComposedStatsSection(contentWithInternalLinks)
    : contentWithInternalLinks;

  const { contentWithIds, toc } = addHeadingIdsAndExtractToc(
    normalizeHeadingLevels(contentForDisplay)
  );

  const heroAlt = getProjectHeroImageAlt({
    title: metadata.displayTitle,
    imageAlt: metadata.imageAlt,
    description: metadata.description,
    details: metadata.details,
  });

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <ArticleSchema
        scriptId={`article-schema-${slug}`}
        headline={metadata.displayTitle}
        description={metadata.description}
        image={metadata.image}
        url={`${siteUrl}/projects/${slug}`}
        datePublished={datePublished}
        dateModified={dateModified}
        author={{
          name: displayAuthorName,
          url: `${siteUrl}/authors/${authorSlug}`,
        }}
        siteUrl={siteUrl}
      />
      {place ? (
        <PlaceSchema
          schemaId={place.schemaId}
          name={place.name}
          description={metadata.description}
          addressLocality={place.addressLocality}
          addressRegion={place.addressRegion}
          latitude={place.latitude}
          longitude={place.longitude}
        />
      ) : null}

      <div className="w-full bg-white">
        <ProjectDetailHero
          eyebrow={t("caseStudyLabel")}
          title={metadata.displayTitle}
          description={metadata.description}
          lastUpdated={t("lastUpdated", { date: lastUpdatedDisplay })}
          readingMinutes={readingMinutes}
          minReadLabel={t("minRead", { minutes: readingMinutes })}
          image={metadata.image}
          imageAlt={heroAlt}
          tags={detailTags}
          stats={heroStats}
          authorName={knownAuthor ? displayAuthorName : undefined}
          authorSlug={knownAuthor ? authorSlug : undefined}
          authorRole={knownAuthor?.role}
        />

        <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-10 pb-20">
          <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_300px] gap-10">
            <div className="min-w-0 xl:col-start-2 xl:row-start-1">
              {toc.length > 0 ? (
                <details className="xl:hidden mb-8 rounded-xl border border-gray-200 bg-[#f8fafb] p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-[#052638]">
                    {t("contents")}
                  </summary>
                  <nav aria-label={t("tocLabel")} className="mt-4">
                    <ul className="space-y-2">
                      {toc.map((item) => (
                        <li key={item.id}>
                          <a
                            href={`#${item.id}`}
                            className={`block text-sm leading-snug hover:text-[#5a8f00] transition-colors ${
                              item.level === 3
                                ? "text-gray-600 pl-4"
                                : "text-[#052638] font-medium"
                            }`}
                          >
                            {item.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </details>
              ) : null}

              {projectFacts ? (
                <section className="mb-10">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#A8C117]">
                    {t("statsEyebrow")}
                  </p>
                  <h2 className="mb-5 text-2xl font-semibold text-[#052638] md:text-3xl">
                    {t("statsHeading")}
                  </h2>
                  <ProjectStatsTable
                    facts={projectFacts}
                    metricLabel={t("statsTableMetric")}
                    valueLabel={t("statsTableValue")}
                    disclaimer={t("statsTableDisclaimer")}
                  />
                </section>
              ) : null}

              {contentWithIds ? (
                <article
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8 lg:p-10"
                  suppressHydrationWarning
                >
                  <BlogContent
                    content={contentWithIds}
                    imageAltContext={{ title: metadata.title }}
                    className={proseClassName}
                  />
                </article>
              ) : (
                <p className="text-base leading-relaxed text-[#27415c]">
                  {metadata.description}
                </p>
              )}

              <div className="mt-12 pt-8 border-t border-gray-200 xl:hidden">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 text-[#5a8f00] hover:text-[#052638] transition-colors font-medium"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  {t("backToProjects")}
                </Link>
              </div>
            </div>

            <aside className="hidden xl:block xl:col-start-1 xl:row-start-1">
              {toc.length > 0 ? (
                <div className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-100 bg-[#f8fafb] px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#052638]">
                      {t("contents")}
                    </p>
                  </div>
                  <nav aria-label={t("tocLabel")} className="p-4">
                    <ul className="max-h-[70vh] space-y-1 overflow-y-auto pr-1">
                      {toc.map((item) => (
                        <li key={item.id}>
                          <a
                            href={`#${item.id}`}
                            className={`block rounded-lg px-3 py-2 text-sm leading-snug transition-colors hover:bg-[#f4f7f9] hover:text-[#5a8f00] ${
                              item.level === 3
                                ? "text-[#27415c]/80 pl-6"
                                : "font-medium text-[#052638]"
                            }`}
                          >
                            {item.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              ) : null}
            </aside>

            <aside className="xl:col-start-3 xl:row-start-1">
              <ProjectDetailSidebar />
            </aside>
          </div>
        </div>

        {relatedGridProjects.length > 0 ? (
          <AllRelatedProjectsSection projects={relatedGridProjects} />
        ) : null}

        <CallbackCard
          headerText={tHub("callback.header")}
          leadIntent={tHub("callback.header")}
        />
      </div>
    </>
  );
}
