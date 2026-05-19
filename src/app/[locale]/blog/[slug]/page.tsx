import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { formatLocaleDate } from "@/i18n/format-date";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { BlogImage } from "@/app/components/BlogImage";
import { BlogContent } from "@/app/components/BlogContent";
import { ArticleSchema, FAQPageSchema } from "@/app/components/StructuredData";
import { FaqSection } from "@/app/components/FaqSection";
import { SimilarBlogs } from "@/app/components/SimilarBlogs";
import { NewsletterSubscribeCard } from "@/app/components/NewsletterSubscribeCard";
import type { Metadata } from "next";
import { DynamicBlog } from "@/app/api/blog/list/route";
import {
  getBlogBySlug,
  listAllBlogs,
} from "@/lib/cms/blogService";
import { addInternalLinks } from "@/app/utils/internalLinking";
import {
  getAuthorAvatarUrl,
  resolveAuthorSlug,
} from "@/app/data/blogAuthors";
import { getStoredAuthors } from "@/app/utils/blogAuthorsStore";
import {
  blogAuthorProfileUrl,
  blogPostMetadataDescription,
  blogPostMetadataTitle,
  blogPostOpenGraphTitle,
  isRobotCleaningTopic,
} from "@/lib/seo/blog-metadata";
import { getBlogFeaturedImageAlt } from "@/app/utils/imageAlt";
import { socialImagesFromMedia } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { withHreflang } from "@/lib/seo/with-hreflang";

const siteUrl = SITE_URL;

interface BlogSlugParams {
  slug: string;
}

interface BlogPostProps {
  params: Promise<{ locale: string; slug: string }>;
}

interface BlogData {
  _id?: string;
  title: string;
  description: string;
  content: string;
  author: string;
  featuredImage: string;
  featuredImageAlt?: string;
  slug: string;
  publishDate: string;
  updatedAt?: string;
  source?: "db";
  faqs?: { question: string; answer: string }[];
}

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function addHeadingIdsAndExtractToc(html: string): {
  contentWithIds: string;
  toc: TocItem[];
} {
  if (!html) {
    return { contentWithIds: html, toc: [] };
  }

  const toc: TocItem[] = [];
  const usedIds = new Set<string>();

  const contentWithIds = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, levelStr, attrs, innerHtml) => {
      const plainText = innerHtml
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();

      if (!plainText) return match;

      const level = Number(levelStr) as 2 | 3;
      let id = slugifyHeading(plainText) || `section-${toc.length + 1}`;
      let suffix = 2;
      while (usedIds.has(id)) {
        id = `${id}-${suffix}`;
        suffix += 1;
      }
      usedIds.add(id);

      toc.push({ id, text: plainText, level });

      if (/id\s*=\s*["'][^"']+["']/i.test(attrs)) {
        return `<h${level}${attrs}>${innerHtml}</h${level}>`;
      }

      return `<h${level}${attrs} id="${id}">${innerHtml}</h${level}>`;
    }
  );

  return { contentWithIds, toc };
}

// Fetch all blogs for similar blogs section
async function getAllBlogs(locale: string): Promise<DynamicBlog[]> {
  const rows = await listAllBlogs(false, locale);
  return rows.map((metadata) => ({
    ...metadata,
    href: `/blog/${metadata.slug}`,
    source: "db" as const,
  }));
}

async function getBlogData(
  slug: string,
  locale: string
): Promise<BlogData | null> {
  const post = await getBlogBySlug(slug, { locale });
  if (!post) return null;
  return {
    ...post.metadata,
    content: post.content,
    slug,
    source: "db",
  };
}

export async function generateStaticParams(): Promise<BlogSlugParams[]> {
  const { listPublishedBlogSlugs } = await import("@/lib/cms/blogService");
  const { SOURCE_LOCALE } = await import("@/lib/translation/config");
  const slugs = await listPublishedBlogSlugs(SOURCE_LOCALE);
  return slugs.map((slug) => ({ slug }));
}

// Enable ISR: regenerate pages every hour, but allow stale-while-revalidate
export const revalidate = 3600; // 1 hour in seconds

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogPostProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const blog = await getBlogData(slug, locale);

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
        "taypro",
      ]
    : [
        "solar panel cleaning",
        "Solar Panel Cleaning Robot",
        "solar panel maintenance",
        "solar energy",
        "cleaning robots",
        "taypro",
      ];

  const shareImages = socialImagesFromMedia(
    blog.featuredImage,
    getBlogFeaturedImageAlt(blog),
    "blog"
  );

  return withHreflang(
    `/blog/${slug}`,
    locale,
    {
      title: blogPostMetadataTitle(blog.title, blog.description),
      description: blogPostMetadataDescription(blog.title, blog.description),
      keywords: blogKeywords,
      openGraph: {
        title: blogPostOpenGraphTitle(blog.title),
        description: blog.description,
        url: `${siteUrl}/blog/${slug}`,
        type: "article",
        ...shareImages.openGraph,
        publishedTime: blog.publishDate,
        modifiedTime: blog.updatedAt || blog.publishDate,
        authors: [blog.author || "Taypro Team"],
      },
      twitter: {
        title: blogPostOpenGraphTitle(blog.title),
        description: blog.description,
        ...shareImages.twitter,
      },
    },
    { includeAllLocales: true }
  );
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "BlogPage.post" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const [blog, allBlogs] = await Promise.all([
    getBlogData(slug, locale),
    getAllBlogs(locale),
  ]);

  if (!blog) {
    notFound();
  }

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbBlog"), href: "/blog" },
    { name: blog.title, href: "" },
  ];

  const lastUpdatedIso = blog.updatedAt || blog.publishDate;
  const lastUpdatedDisplay = formatLocaleDate(locale, lastUpdatedIso);
  const readingMinutes = Math.max(
    1,
    Math.ceil(blog.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 220)
  );

  const { contentWithIds, toc } = addHeadingIdsAndExtractToc(
    addInternalLinks(blog.content, allBlogs, slug, 8)
  );
  const authors = await getStoredAuthors();
  const authorName = blog.author || "Taypro Team";
  const authorSlug = resolveAuthorSlug(authorName, authors);
  const knownAuthor = authors.find(
    (author) => author.slug === authorSlug
  );
  const authorAvatarUrl = knownAuthor?.avatarUrl || getAuthorAvatarUrl(blog.author || "Taypro Team");
  const moreFromAuthor = allBlogs
    .filter((post) => post.slug !== slug && post.author === blog.author)
    .slice(0, 3);
  const postFaqs = blog.faqs ?? [];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      {postFaqs.length > 0 ? <FAQPageSchema faqs={postFaqs} /> : null}
      <ArticleSchema
        headline={blog.title}
        description={blog.description}
        image={blog.featuredImage?.startsWith("http") ? blog.featuredImage : `${siteUrl}${blog.featuredImage || "/tayproasset/taypro-robotImage.png"}`}
        imageAlt={getBlogFeaturedImageAlt(blog)}
        url={`${siteUrl}/blog/${slug}`}
        datePublished={blog.publishDate}
        dateModified={lastUpdatedIso}
        author={{
          name: blog.author || "Taypro Team",
          url: blogAuthorProfileUrl(siteUrl, authorName, authorSlug),
        }}
        publisher={{
          name: "Taypro",
          logo: `${siteUrl}/tayproasset/taypro-logo.png`,
        }}
        siteUrl={siteUrl}
      />

      {/* Main Layout with TOC + Main Content + Right Sidebar */}
      <div className="w-full bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-0 pb-20">
          {/* Ahrefs-style Top Article Header */}
          <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#052638] border-y border-[#0c3c57] mb-10">
            <header className="max-w-4xl mx-auto px-6 md:px-8 py-8 md:py-10">
              <p className="text-sm font-medium text-[#A8C117] mb-3">
                {t("labelBlog")}
              </p>
              <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight mb-4">
                {blog.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200 mb-5">
                <Image
                  src={authorAvatarUrl}
                  alt={blog.author}
                  width={36}
                  height={36}
                  sizes="36px"
                  className="w-9 h-9 rounded-full border border-slate-500 object-cover"
                />
                <span className="font-medium text-white">
                  {t("byAuthor")}{" "}
                  <Link
                    href={`/blog/author/${authorSlug}`}
                    className="underline decoration-slate-300/60 underline-offset-2 hover:text-[#A8C117] transition-colors"
                  >
                    {blog.author}
                  </Link>
                  {knownAuthor?.role ? (
                    <span className="ml-2 font-normal text-slate-300">
                      ({knownAuthor.role})
                    </span>
                  ) : null}
                </span>
                <span aria-hidden="true">|</span>
                <span>
                  {t("lastUpdated", { date: lastUpdatedDisplay })}
                </span>
                <span aria-hidden="true">|</span>
                <span>{t("minRead", { minutes: readingMinutes })}</span>
              </div>
              <p className="text-lg text-slate-100 leading-relaxed">{blog.description}</p>
            </header>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_320px] gap-10">
            {/* Left TOC */}
            <aside className="hidden xl:block">
              {toc.length > 0 && (
                <div className="sticky top-24 border border-gray-200 rounded-xl p-5 bg-white">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#052638] mb-4">
                    {t("contents")}
                  </h3>
                  <nav aria-label={t("tocLabel")}>
                    <ul className="space-y-2">
                      {toc.map((item) => (
                        <li key={item.id}>
                          <a
                            href={`#${item.id}`}
                            className={`block text-sm leading-snug hover:text-blue-700 transition-colors ${
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
              )}
            </aside>

            {/* Main Content Column */}
            <div className="min-w-0">
              {/* Hero Section with Featured Image */}
              <section className="pb-8">
                {blog.featuredImage && (
                  <div className="relative w-full h-96 mb-8 overflow-hidden rounded-lg bg-gray-100">
                    <BlogImage
                      src={blog.featuredImage}
                      alt={getBlogFeaturedImageAlt(blog)}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 768px"
                    />
                  </div>
                )}
              </section>

              {/* Main Content */}
              <article suppressHydrationWarning>
                <BlogContent
                  content={contentWithIds}
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
                   prose-code:rounded
                   prose-img:rounded-lg
                   prose-img:w-full
                   prose-figure:my-8"
                />

                {postFaqs.length > 0 ? (
                  <div className="mt-14 -mx-4 sm:mx-0">
                    <FaqSection
                      id="blog-post-faq-heading"
                      title={t("faqHeading")}
                      faqs={postFaqs}
                      className="!py-10 md:!py-12"
                    />
                  </div>
                ) : null}

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
                      aria-hidden="true"
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

              {moreFromAuthor.length > 0 && (
                <section className="mt-12 border-t border-gray-200 pt-10">
                  <h3 className="text-2xl font-semibold text-[#052638] mb-6">
                    {t("moreFromAuthor")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {moreFromAuthor.map((post) => (
                      <Link
                        key={post.slug}
                        href={post.href}
                        className="block rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="relative w-full h-40 bg-gray-100">
                          {post.featuredImage ? (
                            <BlogImage
                              src={post.featuredImage}
                              alt={getBlogFeaturedImageAlt(post)}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 33vw"
                            />
                          ) : null}
                        </div>
                        <div className="p-4">
                          <h4 className="text-base font-semibold text-[#052638] line-clamp-2 mb-2">
                            {post.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {post.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Sidebar */}
            <aside className="xl:w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-[#052638] to-[#0c3c57] p-6 text-white">
                  <p className="text-xs uppercase tracking-wider text-[#A8C117] mb-2">
                    {t("sidebarProduct")}
                  </p>
                  <h3 className="text-2xl font-semibold leading-tight mb-3">
                    {t("sidebarTitle")}
                  </h3>
                  <p className="text-sm text-slate-100 mb-5">
                    {t("sidebarBody")}
                  </p>
                  <Link
                    href="/solar-panel-cleaning-system"
                    className="inline-flex items-center justify-center rounded-md bg-[#A8C117] px-4 py-2 text-sm font-semibold text-[#052638] hover:bg-[#bfd63a] transition-colors"
                  >
                    {t("sidebarCta")}
                  </Link>
                </div>

                <NewsletterSubscribeCard compact />
              </div>
            </aside>
          </div>

          {/* Similar Blogs Bottom Section */}
          <div className="mt-16">
            <SimilarBlogs blogs={allBlogs} currentSlug={slug} layout="bottom" />
          </div>
        </div>
      </div>
    </>
  );
}
