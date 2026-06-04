import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { ArticleSchema, PlaceSchema } from "@/app/components/StructuredData";
import { AllProjectsOverviewSection } from "@/app/components/AllProjectsOverviewSection";
import { AllRelatedProjectsSection } from "@/app/components/AllRelatedProjectsSection";
import { BlogContent } from "@/app/components/BlogContent";
import CallbackCard from "@/app/components/CallbackCard";
import { PROJECT_PLACE_BY_SLUG } from "@/app/data/projectPlaceSchema";
import {
  getAllFileProjects,
  getRelatedFileProjects,
} from "@/app/utils/projectFileUtils";
import { getProjectBySlug, listAllProjects } from "@/lib/cms/projectService";
import { getStoredAuthors } from "@/lib/cms/authorService";
import { resolveAuthorSlug } from "@/app/data/blogAuthors";
import { getProjectHeroImageAlt } from "@/app/utils/imageAlt";
import { addInternalLinksToProject } from "@/app/utils/internalLinking";
import { socialImagesFromMedia } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { withHreflang } from "@/lib/seo/with-hreflang";

const siteUrl = SITE_URL;

const proseClassName =
  "prose prose-lg max-w-none space-y-5 prose-headings:text-[#052638] prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:hover:text-blue-800 prose-strong:text-[#052638] prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700";

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
  const post = await getProjectBySlug(slug, { locale });
  const t = await getTranslations({ locale, namespace: "ProjectDetailPage" });

  if (!post) {
    return { title: t("notFoundTitle") };
  }

  const { metadata } = post;
  const url = `${siteUrl}/projects/${slug}`;
  const internalPath = `/projects/${slug}`;
  const shareImages = socialImagesFromMedia(
    metadata.image,
    getProjectHeroImageAlt(metadata),
    "projects"
  );

  return withHreflang(internalPath, locale, {
    title: `${metadata.title}${t("metaTitleSuffix")}`,
    description: metadata.description,
    openGraph: {
      title: `${metadata.title} | Taypro`,
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
  });
}

export default async function DynamicProjectPage({ params }: ProjectPageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProjectDetailPage" });
  const tHub = await getTranslations({ locale, namespace: "ProjectsPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const post = await getProjectBySlug(slug, { locale });
  if (!post) {
    notFound();
  }

  const { metadata, content } = post;
  const authorName = metadata.author?.trim() || "Taypro Team";
  const authors = await getStoredAuthors();
  const authorSlug = resolveAuthorSlug(authorName, authors);
  const place = PROJECT_PLACE_BY_SLUG[slug];
  const allProjects = await getAllFileProjects(locale);
  const relatedProjects = await getRelatedFileProjects(
    slug,
    metadata.details ?? [],
    locale,
    3
  );

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbProjects"), href: "/projects" },
    { name: metadata.title, href: "" },
  ];

  const datePublished = metadata.date || new Date().toISOString().split("T")[0];
  const dateModified =
    metadata.updatedAt || metadata.date || datePublished;

  const overviewText =
    metadata.details?.length > 0
      ? metadata.details.join(" · ")
      : metadata.description;

  const projectLinkSources = allProjects.map((p) => ({
    slug: p.id,
    title: p.title,
    href: p.href,
    description: p.description,
  }));

  const contentWithInternalLinks = content
    ? addInternalLinksToProject(content, projectLinkSources, slug, 8)
    : "";

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
          name: authorName,
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
      <div className="min-h-screen">
        <section
          className="bg-white min-h-[50vh] flex flex-col items-center justify-start relative"
          style={{
            background: "url('/tayprobglayout/taypro-project.png') no-repeat",
            backgroundSize: "cover",
          }}
        >
          <div className="pt-10">
            <h1 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-7 text-center">
              {metadata.title}
            </h1>
            <p className="text-[#A8C117] text-center text-[18px] mb-4">
              {t("heroSubtitle")}
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
            <svg
              className="w-full h-24 md:h-40"
              viewBox="0 0 1440 320"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path fill="#052638" d="M0,224L1440,96L1440,320L0,320Z" />
            </svg>
          </div>
        </section>

        <AllProjectsOverviewSection
          image={metadata.image}
          imageAlt={metadata.imageAlt}
          projectTitle={metadata.title}
          overviewText={overviewText}
        />

        {contentWithInternalLinks ? (
          <article className="w-full pb-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <BlogContent
                content={contentWithInternalLinks}
                className={proseClassName}
              />
            </div>
          </article>
        ) : null}

        {relatedProjects.length > 0 ? (
          <AllRelatedProjectsSection projects={relatedProjects} />
        ) : null}

        <CallbackCard headerText={tHub("callback.header")} />
      </div>
    </>
  );
}
