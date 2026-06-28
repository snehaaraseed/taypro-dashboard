import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { formatLocaleDate } from "@/i18n/format-date";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { BlogImage } from "@/app/components/BlogImage";
import { BlogContent } from "@/app/components/BlogContent";
import { ProjectDetailHero } from "@/app/components/ProjectDetailHero";
import { ArticleSchema, FAQPageSchema } from "@/app/components/StructuredData";
import { FaqSection } from "@/app/components/FaqSection";
import { SimilarBlogs } from "@/app/components/SimilarBlogs";
import { NewsletterSubscribeCard } from "@/app/components/NewsletterSubscribeCard";
import type { Metadata } from "next";
import { DynamicBlog } from "@/app/api/blog/list/route";
import { getPublishedBlogLocales } from "@/lib/cms/blogService";
import {
  hreflangLocalesOrAll,
  listBlogsForInternalLinking,
  redirectCmsDetailToEnglish,
  resolvePublishedBlog,
} from "@/lib/cms/locale-fallback";
import {
  isRedirectedBlogSlug,
  redirectedBlogTarget,
  canonicalBlogHref,
} from "@/lib/seo/redirected-blog-slugs";
import {
  resolveAuthorSlug,
} from "@/app/data/blogAuthors";
import { getStoredAuthors } from "@/app/utils/blogAuthorsStore";
import {
  blogAuthorProfileUrl,
  blogPostMetadataDescription,
  blogPostMetadataTitle,
  blogPostOpenGraphTitle,
} from "@/lib/seo/blog-metadata";
import { getBlogFeaturedImageAlt } from "@/app/utils/imageAlt";
import { socialImagesFromMedia } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { recoveryNotFoundMetadata } from "@/lib/seo/recovery-not-found-metadata";
import {
  applyRecovery,
  log404Hit,
  recoverBlogSlug,
} from "@/lib/url-recovery";
import { listAllBlogs } from "@/lib/cms/blogService";
import { pickSimilarBlogs } from "@/lib/seo/pick-similar-blogs";
import {
  addHeadingIdsAndExtractToc,
  normalizeHeadingLevels,
} from "@/lib/seo/html-toc";
import { addInternalLinks } from "@/app/utils/internalLinking";
import { rewriteCmsHrefs } from "@/lib/seo/cms-href-rewrites";
import { rewriteCmsImageSrcs } from "@/lib/seo/cms-image-rewrites";

const siteUrl = SITE_URL;

function prepareCmsHtml(html: string): string {
  return rewriteCmsImageSrcs(rewriteCmsHrefs(html));
}

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
  seoKeyword?: string;
}

async function getLocaleBlogMetadata(locale: string): Promise<DynamicBlog[]> {
  const { listAllBlogs } = await import("@/lib/cms/blogService");
  const rows = await listAllBlogs(false, locale);
  return rows.map((metadata) => ({
    ...metadata,
    href: canonicalBlogHref(metadata.slug),
    source: "db" as const,
  }));
}

function toBlogData(
  slug: string,
  resolved: NonNullable<Awaited<ReturnType<typeof resolvePublishedBlog>>>
): BlogData {
  return {
    ...resolved.post.metadata,
    content: resolved.post.content,
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
  if (isRedirectedBlogSlug(slug)) {
    const target = redirectedBlogTarget(slug);
    if (target) permanentRedirect(target);
  }
  const resolved = await resolvePublishedBlog(slug, locale);

  if (!resolved) {
    return recoveryNotFoundMetadata({
      title: "Blog Post Not Found - Taypro",
      description: "The requested blog post could not be found.",
    });
  }

  const blog = toBlogData(slug, resolved);
  const storedAuthors = await getStoredAuthors();
  const metadataAuthorName = blog.author || "Taypro Team";
  const metadataAuthorSlug = resolveAuthorSlug(metadataAuthorName, storedAuthors);
  const displayAuthorName =
    storedAuthors.find((author) => author.slug === metadataAuthorSlug)?.name ??
    metadataAuthorName;
  const publishedLocales = hreflangLocalesOrAll(
    await getPublishedBlogLocales(slug)
  );
  const canonicalLocale = resolved.usesEnglishFallback ? "en" : locale;

  const shareImages = socialImagesFromMedia(
    blog.featuredImage,
    getBlogFeaturedImageAlt(blog),
    "blog"
  );

  return withHreflang(
    canonicalBlogHref(slug),
    canonicalLocale,
    {
      title: blogPostMetadataTitle(blog.title, blog.description),
      description: blogPostMetadataDescription(blog.title, blog.description),
      openGraph: {
        title: blogPostOpenGraphTitle(blog.title),
        description: blog.description,
        url: `${siteUrl}${canonicalBlogHref(slug)}`,
        type: "article",
        ...shareImages.openGraph,
        publishedTime: blog.publishDate,
        modifiedTime: blog.updatedAt || blog.publishDate,
        authors: [displayAuthorName],
      },
      twitter: {
        title: blogPostOpenGraphTitle(blog.title),
        description: blog.description,
        ...shareImages.twitter,
      },
    },
    { locales: publishedLocales }
  );
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug, locale } = await params;
  if (isRedirectedBlogSlug(slug)) {
    const target = redirectedBlogTarget(slug);
    if (target) permanentRedirect(target);
  }
  const t = await getTranslations({ locale, namespace: "BlogPage.post" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const resolved = await resolvePublishedBlog(slug, locale);
  if (!resolved) {
    const blogRows = await listAllBlogs(false, locale);
    const publishedSlugs = blogRows.map((row) => row.slug);
    const recovery = recoverBlogSlug(slug, publishedSlugs);
    applyRecovery(recovery);
    void log404Hit(
      `/blog/${slug}`,
      recovery.kind !== "none" ? recovery.destination : undefined
    );
    notFound();
  }
  if (resolved.usesEnglishFallback) {
    redirectCmsDetailToEnglish("blog", slug);
  }

  const blog = toBlogData(slug, resolved);
  const [localeBlogMetadata, linkableBlogs] = await Promise.all([
    getLocaleBlogMetadata(locale),
    listBlogsForInternalLinking(locale),
  ]);

  const similarBlogs = pickSimilarBlogs(
    {
      slug,
      title: blog.title,
      description: blog.description,
    },
    localeBlogMetadata,
    5
  );

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
    normalizeHeadingLevels(
      prepareCmsHtml(
        addInternalLinks(
          prepareCmsHtml(blog.content),
          linkableBlogs,
          slug,
          8
        )
      )
    )
  );
  const authors = await getStoredAuthors();
  const authorName = blog.author || "Taypro Team";
  const authorSlug = resolveAuthorSlug(authorName, authors);
  const knownAuthor = authors.find(
    (author) => author.slug === authorSlug
  );
  const displayAuthorName = knownAuthor?.name ?? authorName;
  const moreFromAuthor = localeBlogMetadata
    .filter(
      (post) =>
        post.slug !== slug &&
        resolveAuthorSlug(post.author, authors) === authorSlug
    )
    .slice(0, 3);
  const postFaqs = blog.faqs ?? [];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      {postFaqs.length > 0 ? <FAQPageSchema faqs={postFaqs} /> : null}
      <ArticleSchema
        headline={blog.title}
        description={blog.description}
        image={blog.featuredImage?.startsWith("http") ? blog.featuredImage : `${siteUrl}${blog.featuredImage || "/tayproasset/taypro-robotImage.webp"}`}
        imageAlt={getBlogFeaturedImageAlt(blog)}
        url={`${siteUrl}/blog/${slug}`}
        datePublished={blog.publishDate}
        dateModified={lastUpdatedIso}
        author={{
          name: displayAuthorName,
          url: blogAuthorProfileUrl(siteUrl, displayAuthorName, authorSlug),
        }}
        publisher={{
          name: "Taypro",
          logo: `${siteUrl}/tayproasset/taypro-logo.png`,
        }}
        siteUrl={siteUrl}
      />

      {/* Main Layout with TOC + Main Content + Right Sidebar */}
      <div className="w-full bg-white">
        <ProjectDetailHero
          eyebrow={t("labelBlog")}
          title={blog.title}
          description={blog.description}
          lastUpdated={t("lastUpdated", { date: lastUpdatedDisplay })}
          readingMinutes={readingMinutes}
          minReadLabel={t("minRead", { minutes: readingMinutes })}
          image={blog.featuredImage}
          imageAlt={getBlogFeaturedImageAlt(blog)}
          tags={blog.seoKeyword ? [blog.seoKeyword] : []}
          stats={[]}
          authorName={knownAuthor ? displayAuthorName : undefined}
          authorSlug={knownAuthor ? authorSlug : undefined}
          authorRole={knownAuthor?.role}
        />

        <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-10 pb-20">
          <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_320px] gap-10">
            {/* Left TOC */}
            <aside className="hidden xl:block">
              {toc.length > 0 && (
                <div className="sticky top-24 border border-gray-200 rounded-xl p-5 bg-white">
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#052638] mb-4">
                    {t("contents")}
                  </p>
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
              {/* Main Content */}
              <article suppressHydrationWarning>
                <BlogContent
                  content={contentWithIds}
                  imageAltContext={{
                    title: blog.title,
                    primaryKeyword: blog.seoKeyword,
                  }}
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
                  <h2 className="text-2xl font-semibold text-[#052638] mb-6">
                    {t("moreFromAuthor")}
                  </h2>
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
                          <h3 className="text-base font-semibold text-[#052638] line-clamp-2 mb-2">
                            {post.title}
                          </h3>
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
                  <h2 className="text-2xl font-semibold leading-tight mb-3">
                    {t("sidebarTitle")}
                  </h2>
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
            <SimilarBlogs blogs={similarBlogs} layout="bottom" />
          </div>
        </div>
      </div>
    </>
  );
}
