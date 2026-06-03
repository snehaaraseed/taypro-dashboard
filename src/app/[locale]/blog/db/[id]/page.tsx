import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { formatLocaleDate } from "@/i18n/format-date";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { BlogImage } from "@/app/components/BlogImage";
import { BlogContent } from "@/app/components/BlogContent";
import { SimilarBlogs } from "@/app/components/SimilarBlogs";
import { getBlogBySlug, listAllBlogs } from "@/lib/cms/blogService";
import { DynamicBlog } from "@/app/api/blog/list/route";
import type { Metadata } from "next";
import {
  blogPostMetadataDescription,
  blogPostMetadataTitle,
  blogPostOpenGraphTitle,
  isRobotCleaningTopic,
} from "@/lib/seo/blog-metadata";
import { getBlogFeaturedImageAlt } from "@/app/utils/imageAlt";
import { socialImagesFromMedia } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { withHreflang } from "@/lib/seo/with-hreflang";

/**
 * Returns the canonical /blog/[slug] path when this post is also published as
 * a file-backed blog. Otherwise null, DB-only posts have no /blog/[slug]
 * page and would 404 there, so we keep them at /blog/db/[id].
 */
async function getPublishedSlug(slug?: string): Promise<string | null> {
  if (!slug) return null;
  const post = await getBlogBySlug(slug);
  return post ? slug : null;
}

interface BlogDbIdParams {
  id: string;
}

interface BlogPostProps {
  params: Promise<{ locale: string; id: string }>;
}

interface BlogData {
  _id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  featuredImage: string;
  featuredImageAlt?: string;
  slug: string;
  publishDate: string;
  createdAt: string;
  updatedAt?: string;
}

// Fetch all blogs for similar blogs section
async function getAllBlogs(): Promise<DynamicBlog[]> {
  try {
    const [cmsBlogs, dbBlogs] = await Promise.all([
      listAllBlogs(false).then((rows) =>
        rows.map((metadata) => ({
          ...metadata,
          href: `/blog/${metadata.slug}`,
          source: "db" as const,
        }))
      ),
      getDatabaseBlogs(),
    ]);

    return [...cmsBlogs, ...dbBlogs].sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

async function getDatabaseBlogs(): Promise<DynamicBlog[]> {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "https://console.taypro.in";
    const fullUrl = `${backendUrl}/api/v1/blogposts`;

    const response = await fetch(fullUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }

    interface DatabaseBlog {
      _id: string;
      title: string;
      description: string;
      featuredImage: string;
      author: string;
      slug: string;
      publishDate: string;
    }

    return (data.data as DatabaseBlog[]).map((blog) => ({
      title: blog.title,
      description: blog.description,
      featuredImage: blog.featuredImage,
      author: blog.author,
      slug: blog.slug,
      publishDate: blog.publishDate,
      href: `/blog/${blog.slug}`,
      source: "console" as const,
      id: blog._id,
    }));
  } catch (error) {
    console.error("Error fetching database blogs:", error);
    return [];
  }
}

// Fetch blog data
async function getBlogData(id: string): Promise<BlogData | null> {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "https://console.taypro.in";
    const response = await fetch(`${backendUrl}/api/v1/blogposts/id/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

const siteUrl = SITE_URL;

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogPostProps): Promise<Metadata> {
  const { id, locale } = await params;
  const blog = await getBlogData(id);

  if (!blog) {
    return {
      title: "Blog Post Not Found - Taypro",
      description: "The requested blog post could not be found.",
    };
  }

  const robotTopic = isRobotCleaningTopic(blog.title, blog.description);
  const blogKeywords = robotTopic
    ? [
        "Solar Panel Cleaning Robot",
        "solar panel cleaning robot",
        "automatic solar panel cleaning robot",
        "solar panel cleaning",
        "solar panel maintenance",
        "solar energy",
        "cleaning robots",
        "Taypro",
      ]
    : [
        "solar panel cleaning",
        "Solar Panel Cleaning Robot",
        "solar panel maintenance",
        "solar energy",
        "cleaning robots",
        "Taypro",
      ];

  const modifiedIso = blog.updatedAt || blog.publishDate;
  const fileBackedSlug = await getPublishedSlug(blog.slug);
  const canonicalPath = fileBackedSlug
    ? `/blog/${fileBackedSlug}`
    : `/blog/db/${id}`;
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  const shareImages = socialImagesFromMedia(
    blog.featuredImage,
    getBlogFeaturedImageAlt(blog),
    "blog"
  );

  return withHreflang(
    canonicalPath,
    locale,
    {
      title: blogPostMetadataTitle(blog.title, blog.description),
      description: blogPostMetadataDescription(blog.title, blog.description),
      keywords: blogKeywords,
      openGraph: {
        title: blogPostOpenGraphTitle(blog.title),
        description: blog.description,
        url: canonicalUrl,
        type: "article",
        publishedTime: blog.publishDate,
        modifiedTime: modifiedIso,
        ...shareImages.openGraph,
      },
      twitter: {
        title: blogPostOpenGraphTitle(blog.title),
        description: blog.description.substring(0, 200),
        ...shareImages.twitter,
      },
    },
    { includeAllLocales: false }
  );
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { id, locale } = await params;
  const t = await getTranslations({ locale, namespace: "BlogPage.post" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const [blog, allBlogs] = await Promise.all([
    getBlogData(id),
    getAllBlogs(),
  ]);

  if (!blog) {
    notFound();
  }

  // SEO: if this post is also published as a file-backed blog, the canonical
  // home is /blog/[slug]. 301-redirect so external links to /blog/db/[id]
  // converge on the single indexable URL.
  const fileBackedSlug = await getPublishedSlug(blog.slug);
  if (fileBackedSlug) {
    permanentRedirect(`/blog/${fileBackedSlug}`);
  }

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbBlog"), href: "/blog" },
    { name: blog.title, href: "" },
  ];

  const lastUpdatedDisplay = formatLocaleDate(
    locale,
    blog.updatedAt || blog.publishDate
  );

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      {/* Main Layout with Similar Blogs Sidebar */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-20">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content Column */}
            <div className="flex-1 lg:max-w-3xl">
              {/* Hero Section with Featured Image */}
              <section className="pb-10">
                {blog.featuredImage && (
                  <div className="relative w-full h-96 mb-8 overflow-hidden rounded-lg bg-gray-100">
                    <BlogImage
                      src={blog.featuredImage}
                      alt={getBlogFeaturedImageAlt({
                        title: blog.title,
                        featuredImageAlt: blog.featuredImageAlt,
                      })}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 768px"
                    />
                  </div>
                )}

                {/* Article Header */}
                <header className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-semibold text-[#052638] mb-4 leading-tight">
                    {blog.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm mb-6">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("lastUpdated", { date: lastUpdatedDisplay })}
                    </span>

                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {blog.author}
                    </span>
                  </div>

                  <h2 className="text-lg text-gray-700 leading-relaxed">
                    {blog.description}
                  </h2>
                </header>
              </section>

              {/* Main Content */}
              <article>
                <BlogContent
                  content={blog.content}
                  className="prose prose-lg max-w-none space-y-5
                   prose-headings:text-[#052638]
                   prose-headings:font-semibold
                   prose-p:text-gray-700
                   prose-p:leading-relaxed
                   prose-a:text-blue-600
                   prose-a:hover:text-blue-800
                   prose-strong:text-[#052638]
                   prose-ul:text-gray-700
                   prose-ol:text-gray-700
                   prose-li:text-gray-700
                   prose-blockquote:border-l-4
                   prose-blockquote:border-blue-500
                   prose-blockquote:pl-4
                   prose-blockquote:italic
                   prose-code:bg-gray-100
                   prose-code:px-2
                   prose-code:py-1
                   prose-code:rounded"
                />

                {/* Back to Blog Button */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    {t("backToAll")}
                  </Link>
                </div>
              </article>
            </div>

            {/* Similar Blogs Sidebar - Full Height */}
            <SimilarBlogs blogs={allBlogs} currentSlug={blog.slug} />
          </div>
        </div>
      </div>
    </>
  );
}
