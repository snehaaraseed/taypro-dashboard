import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BookOpen, Calculator, Users } from "lucide-react";
import { formatLocaleDateShort } from "@/i18n/format-date";
import { DynamicBlog } from "@/app/api/blog/list/route";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { ProjectsPageHero } from "@/app/components/ProjectsPageHero";
import { Container } from "@/app/components/Container";
import { FaqSection } from "@/app/components/FaqSection";
import { NewsletterSubscribeCard } from "@/app/components/NewsletterSubscribeCard";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";
import {
  FAQPageSchema,
  ItemListSchema,
} from "@/app/components/StructuredData";
import BlogList from "./BlogList";
import { listAllBlogs } from "@/lib/cms/blogService";
import { canonicalBlogHref } from "@/lib/seo/redirected-blog-slugs";
import {
  BLOG_LIST_PAGE_SIZE,
  blogListPagePath,
  blogListPageUrl,
  blogListPaginationLinks,
} from "@/lib/seo/blog-pagination";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { getBlogFeaturedImageAlt } from "@/app/utils/imageAlt";

const PAGE_SIZE = BLOG_LIST_PAGE_SIZE;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

const FEATURED_TOPIC_HREFS = [
  "/blog/the-complete-guide-to-solar-panel-maintenance",
  "/blog/cost-benefit-analysis-of-solar-panel-cleaning-services-in-india",
  "/blog/microfiber-vs-traditional-brushes-why-taypros-patented-dual-pass-solar-panel-cleaning-system-outperforms",
  "/blog/what-are-the-different-methods-used-for-solar-panel-cleaning",
] as const;

const FEATURED_TOPIC_KEYS = [
  { titleKey: "topicMaintenanceTitle", descKey: "topicMaintenanceDescription" },
  { titleKey: "topicEconomicsTitle", descKey: "topicEconomicsDescription" },
  { titleKey: "topicRobotsTitle", descKey: "topicRobotsDescription" },
  { titleKey: "topicMethodsTitle", descKey: "topicMethodsDescription" },
] as const;

const EXPLORE_LINK_KEYS = [
  { labelKey: "exploreSolarRobots", href: "/solar-panel-cleaning-system" },
  {
    labelKey: "exploreRoi",
    href: "/solar-panel-cleaning-robot-price-calculator#calculator",
  },
  { labelKey: "exploreTechnology", href: "/cleaning-technology" },
  { labelKey: "exploreProjects", href: "/projects" },
] as const;

const FAQ_KEYS = ["0", "1", "2"] as const;

async function getPublishedBlogs(locale: string): Promise<DynamicBlog[]> {
  const rows = await listAllBlogs(false, locale);
  return rows.map((metadata) => ({
    ...metadata,
    href: canonicalBlogHref(metadata.slug),
    source: "db" as const,
  }));
}

type BlogPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ page?: string | string[] }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const sp = (await searchParams) ?? {};
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const parsed = parseInt(String(pageRaw || "1"), 10);
  const pageNum = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  const dynamicBlogs = await getPublishedBlogs(locale);
  const totalPages = Math.max(1, Math.ceil(dynamicBlogs.length / PAGE_SIZE));
  const page = Math.min(pageNum, totalPages);
  const t = await getTranslations({ locale, namespace: "BlogPage.index" });

  const canonical = blogListPageUrl(siteUrl, page);
  const pagination = blogListPaginationLinks(siteUrl, page, totalPages);

  const title =
    page <= 1
      ? t("metaTitle")
      : t("metaTitlePaged", { page });

  const description =
    page <= 1
      ? t("metaDescription")
      : t("metaDescriptionPaged", { page });

  const listPath = blogListPagePath(page);
  const querySuffix = listPath.includes("?")
    ? listPath.slice(listPath.indexOf("?"))
    : "";

  return withHreflang(
    "/blog",
    locale,
    {
    title: { absolute: title },
    description,
    ...(pagination.previous || pagination.next
      ? {
          pagination: {
            ...(pagination.previous ? { previous: pagination.previous } : {}),
            ...(pagination.next ? { next: pagination.next } : {}),
          },
        }
      : {}),
    // Advertise the blog RSS feed in <head> for browser/reader auto-discovery (page 1 only).
    ...(page <= 1
      ? {
          alternates: {
            types: {
              "application/rss+xml": `${siteUrl}/feed/blog.xml`,
            },
          },
        }
      : {}),
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
  },
    page <= 1
      ? {}
      : { canonicalSuffix: querySuffix, omitHreflangLanguages: true }
  );
}

export default async function Blog({
  params,
  searchParams,
}: BlogPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BlogPage.index" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const tLead = await getTranslations({ locale, namespace: "Forms.leadModal" });

  const sp = (await searchParams) ?? {};
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const parsed = parseInt(String(pageRaw || "1"), 10);
  const pageNum = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbBlog"), href: "" },
  ];

  const blogIndexFaqs = FAQ_KEYS.map((i) => ({
    question: t(`faq${i}Question`),
    answer: t(`faq${i}Answer`),
  }));

  const featuredTopics = FEATURED_TOPIC_KEYS.map((keys, idx) => ({
    title: t(keys.titleKey),
    description: t(keys.descKey),
    href: FEATURED_TOPIC_HREFS[idx],
  }));

  const exploreLinks = EXPLORE_LINK_KEYS.map((link) => ({
    label: t(link.labelKey),
    href: link.href,
  }));

  const dynamicBlogs = await getPublishedBlogs(locale);
  const total = dynamicBlogs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(pageNum, totalPages);

  const start = (page - 1) * PAGE_SIZE;
  const pageSlice = dynamicBlogs.slice(start, start + PAGE_SIZE);

  const allBlogs = pageSlice.map((blog) => ({
    title: blog.title,
    description: blog.description,
    imgSrc:
      blog.featuredImage && blog.featuredImage.trim() !== ""
        ? blog.featuredImage
        : null,
    imgAlt: getBlogFeaturedImageAlt({
      title: blog.title,
      featuredImageAlt: blog.featuredImageAlt,
    }),
    date: formatLocaleDateShort(
      locale,
      blog.updatedAt || blog.publishDate
    ),
    href: blog.href,
    slug: blog.slug,
  }));

  const itemListEntries = pageSlice.map((b) => ({
    name: b.title,
    url: b.href,
  }));

  const rangeStart = total === 0 ? 0 : start + 1;
  const rangeEnd = Math.min(start + PAGE_SIZE, total);

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <FAQPageSchema faqs={blogIndexFaqs} />
      {itemListEntries.length > 0 && (
        <ItemListSchema
          scriptId="item-list-schema-blog-index"
          name={
            page > 1
              ? t("schemaItemListNamePaged", { page })
              : t("schemaItemListName")
          }
          description={t("schemaItemListDescription")}
          items={itemListEntries}
          siteUrl={siteUrl}
        />
      )}

      <div className="min-h-screen overflow-x-hidden bg-white">
        <ProjectsPageHero
          eyebrow={t("heroEyebrow")}
          projectCount={total}
          countBadgeLabel={t("heroCountBadgeLabel")}
          countBadgeUnit={t("heroCountBadgeUnit")}
          waveFill="#052638"
          title={
            <>
              {t("heroTitleLine1")}
              <span className="mt-2 block">{t("heroTitleLine2")}</span>
            </>
          }
          lead={
            <>
              <p className="text-pretty">
                {t("heroBodyBeforeLink")}{" "}
                <Link href="/solar-panel-cleaning-system">{t("heroLinkRobots")}</Link>
                {t("heroBodyAfterLink")}
              </p>
              <p className="mt-4 text-pretty">
                {t("heroBodyAuthorsBefore")}{" "}
                <Link href="/authors">{t("heroLinkAuthors")}</Link>
                {t("heroBodyAuthorsAfter")}
              </p>
            </>
          }
        />

        {/* Quick links */}
        <section className="w-full py-10 md:py-12 bg-[#052638]">
          <Container>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <AnimateOnScroll animation="fadeInUp">
                <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
                  <BookOpen
                    className="w-8 h-8 text-[#A8C117] mx-auto mb-2"
                    aria-hidden
                  />
                  <p className="text-[#A8C117] text-3xl font-semibold mb-1">
                    {total}
                  </p>
                  <p className="text-white/80 text-sm">{t("statsArticles")}</p>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll animation="fadeInUp" delay={80}>
                <Link
                  href="/authors"
                  className="block rounded-xl border border-white/10 bg-white/5 px-5 py-4 hover:border-[#A8C117]/50 hover:bg-white/10 transition h-full"
                >
                  <Users
                    className="w-8 h-8 text-[#A8C117] mx-auto mb-2"
                    aria-hidden
                  />
                  <p className="text-white font-semibold mb-1">
                    {t("statsAuthorsTitle")}
                  </p>
                  <p className="text-white/70 text-sm">
                    {t("statsAuthorsSubtitle")}
                  </p>
                </Link>
              </AnimateOnScroll>
              <AnimateOnScroll animation="fadeInUp" delay={160}>
                <Link
                  href="/solar-panel-cleaning-robot-price-calculator#calculator"
                  className="block rounded-xl border border-white/10 bg-white/5 px-5 py-4 hover:border-[#A8C117]/50 hover:bg-white/10 transition h-full"
                >
                  <Calculator
                    className="w-8 h-8 text-[#A8C117] mx-auto mb-2"
                    aria-hidden
                  />
                  <p className="text-white font-semibold mb-1">
                    {t("statsRoiTitle")}
                  </p>
                  <p className="text-white/70 text-sm">
                    {t("statsRoiSubtitle")}
                  </p>
                </Link>
              </AnimateOnScroll>
            </div>
          </Container>
        </section>

        {/* Featured topics */}
        <section
          className="w-full py-14 md:py-16 bg-white"
          aria-labelledby="topics-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mb-10">
              <h2
                id="topics-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("topicsHeading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("topicsIntro")}
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredTopics.map((topic, idx) => (
                <AnimateOnScroll
                  key={topic.href}
                  animation="fadeInUp"
                  delay={idx * 80}
                >
                  <Link
                    href={topic.href}
                    className="group flex flex-col h-full rounded-xl border border-gray-200 bg-[#f8fafb] p-5 shadow-sm hover:border-[#A8C117] hover:shadow-md transition"
                  >
                    <h3 className="text-[#052638] font-semibold text-lg mb-2 group-hover:text-[#5a8f00] transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-[#27415c] text-sm leading-relaxed flex-1">
                      {topic.description}
                    </p>
                    <span className="mt-4 text-[#5a8f00] text-sm font-medium group-hover:underline inline-flex items-center gap-1">
                      {t("readGuide")}
                      <ArrowRight className="w-4 h-4" aria-hidden />
                    </span>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Article grid */}
        <section
          className="w-full py-14 md:py-16 bg-[#f4f7f9]"
          aria-labelledby="articles-heading"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
            >
              <div>
                <h2
                  id="articles-heading"
                  className="text-[#052638] font-semibold text-3xl md:text-4xl mb-2"
                >
                  {t("articlesHeading")}
                </h2>
                {total > 0 ? (
                  <p className="text-[#27415c]">
                    {t("articlesShowing", {
                      start: rangeStart,
                      end: rangeEnd,
                      total,
                    })}
                    {totalPages > 1
                      ? t("articlesPageOf", { page, totalPages })
                      : ""}
                  </p>
                ) : null}
              </div>
              <Link
                href="/authors"
                className="inline-flex items-center gap-2 text-[#5a8f00] font-medium hover:underline shrink-0"
              >
                {t("viewAllAuthors")}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </AnimateOnScroll>

            {total === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#27415c] text-lg mb-4">
                  {t("emptyMessage")}
                </p>
                <OpenLeadModalButton
                  source="blog_empty"
                  topic={tLead("topic")}
                  title={tLead("title")}
                  subtitle={tLead("subtitle")}
                  leadIntent={tLead("topic")}
                  formPrompt={tLead("formPrompt")}
                  showMessageField
                  analyticsFormType="blog_inquiry"
                  className="inline-flex items-center justify-center min-h-[48px] bg-[#052638] text-white font-medium px-8 py-3 rounded-md hover:bg-[#0a3a4a] transition"
                >
                  {t("contactCta")}
                </OpenLeadModalButton>
              </div>
            ) : (
              <>
                <BlogList blogs={allBlogs} />

                {totalPages > 1 && (
                  <nav
                    className="flex flex-wrap justify-center items-center gap-4 mt-12"
                    aria-label={t("paginationLabel")}
                  >
                    {page > 1 ? (
                      <Link
                        href={blogListPagePath(page - 1)}
                        rel="prev"
                        className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg border border-[#052638] text-[#052638] font-medium hover:bg-[#052638] hover:text-white transition"
                      >
                        {t("paginationPrevious")}
                      </Link>
                    ) : (
                      <span className="inline-flex min-h-[44px] px-5 items-center text-gray-400 border border-gray-200 rounded-lg cursor-not-allowed">
                        {t("paginationPrevious")}
                      </span>
                    )}
                    <span className="text-[#27415c] text-sm sm:text-base font-medium">
                      {t("paginationPageOf", { page, totalPages })}
                    </span>
                    {page < totalPages ? (
                      <Link
                        href={blogListPagePath(page + 1)}
                        rel="next"
                        className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg border border-[#052638] text-[#052638] font-medium hover:bg-[#052638] hover:text-white transition"
                      >
                        {t("paginationNext")}
                      </Link>
                    ) : (
                      <span className="inline-flex min-h-[44px] px-5 items-center text-gray-400 border border-gray-200 rounded-lg cursor-not-allowed">
                        {t("paginationNext")}
                      </span>
                    )}
                  </nav>
                )}

                <div className="max-w-xl mx-auto mt-14">
                  <NewsletterSubscribeCard />
                </div>
              </>
            )}
          </Container>
        </section>

        <FaqSection
          id="blog-faq-heading"
          title={t("faqHeading")}
          faqs={blogIndexFaqs}
        />

        {/* Explore */}
        <section className="w-full py-12 md:py-14 bg-[#f4f7f9] border-t border-gray-200">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-2">
                {t("exploreHeading")}
              </h2>
              <p className="text-[#27415c]">{t("exploreIntro")}</p>
            </AnimateOnScroll>
            <div className="flex flex-wrap justify-center gap-3">
              {exploreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-[#052638] text-sm font-medium hover:border-[#A8C117] hover:text-[#5a8f00] transition shadow-sm"
                >
                  {link.label}
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              ))}
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
