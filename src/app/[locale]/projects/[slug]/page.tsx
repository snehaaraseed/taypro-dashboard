import Image from "next/image";
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
  hreflangLocalesOrAll,
  listProjectsForInternalLinking,
  redirectCmsDetailToEnglish,
  resolvePublishedProject,
} from "@/lib/cms/locale-fallback";
import {
  extractProjectHeroStats,
  projectDetailTags,
} from "@/lib/cms/project-detail-display";
import { getStoredAuthors } from "@/lib/cms/authorService";
import { resolveAuthorSlug } from "@/app/data/blogAuthors";
import { getProjectHeroImageAlt } from "@/app/utils/imageAlt";
import { addInternalLinksToProject } from "@/app/utils/internalLinking";
import { addHeadingIdsAndExtractToc } from "@/lib/seo/html-toc";
import { socialImagesFromMedia } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { withHreflang } from "@/lib/seo/with-hreflang";

const siteUrl = SITE_URL;

const proseClassName =
  "prose prose-lg max-w-none space-y-5 prose-headings:text-[#052638] prose-headings:font-semibold prose-headings:scroll-mt-28 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#5a8f00] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#052638] prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-table:w-full prose-table:border-collapse prose-th:bg-[#052638] prose-th:text-white prose-th:px-4 prose-th:py-3 prose-th:text-left prose-td:border prose-td:border-gray-200 prose-td:px-4 prose-td:py-3 prose-blockquote:border-l-4 prose-blockquote:border-[#A8C117] prose-blockquote:pl-4 prose-blockquote:italic prose-img:rounded-xl prose-img:w-full";

interface ProjectSlugParams {
  slug: string;
}

interface ProjectPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/** Newly published slugs must render on demand (layout uses headers()). */
export const dynamic = "force-dynamic";

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
    return { title: t("notFoundTitle") };
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
    title: `${metadata.title}${t("metaTitleSuffix")}`,
    description: metadata.description,
    openGraph: {
      title: `${metadata.title}${t("metaTitleSuffix")} | Taypro`,
      description: metadata.description,
      url,
      type: "website",
      ...shareImages.openGraph,
    },
    twitter: {
      title: metadata.title,
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
    { name: metadata.title, href: "" },
  ];

  const datePublished = metadata.date || new Date().toISOString().split("T")[0];
  const dateModified = metadata.updatedAt || metadata.date || datePublished;
  const lastUpdatedDisplay = formatLocaleDate(locale, dateModified);

  const heroStats = extractProjectHeroStats(metadata.details, metadata.title);
  const detailTags = projectDetailTags(metadata.details, metadata.title);
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
    ? addInternalLinksToProject(content, projectLinkSources, slug, 8)
    : "";

  const { contentWithIds, toc } = addHeadingIdsAndExtractToc(
    contentWithInternalLinks
  );

  const heroAlt = getProjectHeroImageAlt({
    title: metadata.title,
    imageAlt: metadata.imageAlt,
    description: metadata.description,
    details: metadata.details,
  });

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <ArticleSchema
        scriptId={`article-schema-${slug}`}
        headline={metadata.title}
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
        <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#052638] border-y border-[#0c3c57]">
          <header className="max-w-4xl mx-auto px-6 md:px-8 py-8 md:py-10">
            <p className="text-sm font-medium text-[#A8C117] mb-3">
              {t("caseStudyLabel")}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight mb-4">
              {metadata.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200 mb-5">
              <span>{t("lastUpdated", { date: lastUpdatedDisplay })}</span>
              {readingMinutes > 0 ? (
                <>
                  <span aria-hidden="true">|</span>
                  <span>{t("minRead", { minutes: readingMinutes })}</span>
                </>
              ) : null}
            </div>
            <p className="text-lg text-slate-100 leading-relaxed">
              {metadata.description}
            </p>
            {detailTags.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {detailTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </header>
        </section>

        {heroStats.length > 0 ? (
          <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#f4f7f9] border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-6 py-6 md:py-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {heroStats.map((stat) => (
                  <div
                    key={`${stat.label}-${stat.value}`}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-4 text-center shadow-sm"
                  >
                    <p className="text-xs uppercase tracking-wide text-[#A8C117] mb-1">
                      {stat.label}
                    </p>
                    <p className="text-lg md:text-xl font-semibold text-[#052638] leading-tight">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-8 pb-20">
          <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_300px] gap-10">
            <aside className="hidden xl:block">
              {toc.length > 0 ? (
                <div className="sticky top-24 border border-gray-200 rounded-xl p-5 bg-white">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#052638] mb-4">
                    {t("contents")}
                  </h3>
                  <nav aria-label={t("tocLabel")}>
                    <ul className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
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
                </div>
              ) : null}
            </aside>

            <div className="min-w-0">
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

              {metadata.image ? (
                <div className="relative w-full aspect-[16/9] mb-8 overflow-hidden rounded-2xl bg-gray-100 shadow-md">
                  <Image
                    src={metadata.image}
                    alt={heroAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 896px, 768px"
                    priority
                  />
                </div>
              ) : null}

              {contentWithIds ? (
                <article suppressHydrationWarning>
                  <BlogContent content={contentWithIds} className={proseClassName} />
                </article>
              ) : (
                <p className="text-[#27415c] text-base leading-relaxed">
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

            <aside className="hidden xl:block">
              <ProjectDetailSidebar />
            </aside>
          </div>

          <div className="xl:hidden mt-10">
            <ProjectDetailSidebar />
          </div>
        </div>

        {relatedGridProjects.length > 0 ? (
          <AllRelatedProjectsSection projects={relatedGridProjects} />
        ) : null}

        <CallbackCard headerText={tHub("callback.header")} />
      </div>
    </>
  );
}
