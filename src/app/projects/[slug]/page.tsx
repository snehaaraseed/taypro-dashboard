import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { ArticleSchema, PlaceSchema } from "@/app/components/StructuredData";
import { AllProjectsOverviewSection } from "@/app/components/AllProjectsOverviewSection";
import { AllRelatedProjectsSection } from "@/app/components/AllRelatedProjectsSection";
import { BlogContent } from "@/app/components/BlogContent";
import { PROJECT_PLACE_BY_SLUG } from "@/app/data/projectPlaceSchema";
import { getAllFileProjects } from "@/app/utils/projectFileUtils";
import { getProjectBySlug, listAllProjects } from "@/lib/cms/projectService";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

const proseClassName =
  "prose prose-lg max-w-none space-y-5 prose-headings:text-[#052638] prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:hover:text-blue-800 prose-strong:text-[#052638] prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700";

interface PageParams {
  slug: string;
}

interface ProjectPageProps {
  params: Promise<PageParams>;
}

export const revalidate = 3600;

export async function generateStaticParams(): Promise<PageParams[]> {
  const projects = await listAllProjects(false);
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getProjectBySlug(slug);
  if (!post) {
    return { title: "Project Not Found | Taypro" };
  }

  const { metadata } = post;
  const url = `${siteUrl}/projects/${slug}`;

  return {
    title: `${metadata.title} - Solar Panel Cleaning Robot Installation | Taypro`,
    description: metadata.description,
    openGraph: {
      title: `${metadata.title} | Taypro`,
      description: metadata.description,
      images: metadata.image ? [metadata.image] : undefined,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
      images: metadata.image ? [metadata.image] : undefined,
    },
    alternates: { canonical: url },
  };
}

export default async function DynamicProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const post = await getProjectBySlug(slug);
  if (!post) {
    notFound();
  }

  const { metadata, content } = post;
  const place = PROJECT_PLACE_BY_SLUG[slug];
  const allProjects = await getAllFileProjects();
  const relatedProjects = allProjects
    .filter((p) => p.id !== slug && p.href !== `/projects/${slug}`)
    .slice(0, 3);

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Projects", href: "/projects" },
    { name: metadata.title, href: "" },
  ];

  const datePublished = metadata.date || new Date().toISOString().split("T")[0];
  const dateModified =
    metadata.updatedAt || metadata.date || datePublished;

  const overviewText =
    metadata.details?.length > 0
      ? metadata.details.join(" · ")
      : metadata.description;

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
        author={{ name: "Taypro Team", url: `${siteUrl}/authors` }}
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
              Solar Panel Cleaning Robot Installation Project
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
          overviewText={overviewText}
        />

        {content ? (
          <article className="w-full pb-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <BlogContent content={content} className={proseClassName} />
            </div>
          </article>
        ) : null}

        {relatedProjects.length > 0 ? (
          <AllRelatedProjectsSection projects={relatedProjects} />
        ) : null}
      </div>
    </>
  );
}
