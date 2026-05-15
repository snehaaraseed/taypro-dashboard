import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Calculator, Users } from "lucide-react";
import { DynamicBlog } from "../api/blog/list/route";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { AnimateOnScroll } from "../components/AnimateOnScroll";
import { Container } from "../components/Container";
import { NewsletterSubscribeCard } from "../components/NewsletterSubscribeCard";
import {
  CollectionPageSchema,
  FAQPageSchema,
  ItemListSchema,
} from "../components/StructuredData";
import BlogList from "./BlogList";
import { listAllBlogs } from "@/lib/cms/blogService";
import { BLOG_LIST_PAGE_SIZE } from "@/lib/seo/sitemap-config";
import { getBlogFeaturedImageAlt } from "@/app/utils/imageAlt";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "" },
];

const PAGE_SIZE = BLOG_LIST_PAGE_SIZE;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

const featuredTopics = [
  {
    title: "Maintenance & soiling",
    description:
      "Checklists, seasonal care, and how soiling affects performance ratio on Indian plants.",
    href: "/blog/the-complete-guide-to-solar-panel-maintenance",
  },
  {
    title: "Cleaning economics",
    description:
      "Cost–benefit of robotic vs manual cleaning and when O&M automation pays back.",
    href: "/blog/cost-benefit-analysis-of-solar-panel-cleaning-services-in-india",
  },
  {
    title: "How robots work",
    description:
      "Dry cleaning cycles, dual-pass methodology, and fleet operations at scale.",
    href: "/blog/how-does-a-solar-panel-cleaning-robot-work",
  },
  {
    title: "Cleaning methods",
    description:
      "Compare manual, wet, semi-automatic, and fully autonomous approaches.",
    href: "/blog/what-are-the-different-methods-used-for-solar-panel-cleaning",
  },
] as const;

const exploreLinks = [
  { label: "Solar cleaning robots", href: "/solar-panel-cleaning-system" },
  { label: "ROI calculator", href: "/solar-panel-cleaning-robot-price-calculator" },
  { label: "Cleaning technology", href: "/cleaning-technology" },
  { label: "Projects", href: "/projects" },
] as const;

const blogIndexFaqs = [
  {
    question: "Who writes the Taypro blog?",
    answer:
      "Articles are published by the Taypro Team and field experts—engineers, applications specialists, and O&M practitioners who work on utility-scale robotic cleaning in India. Meet every contributor on the authors directory.",
  },
  {
    question: "What topics does the Taypro blog cover?",
    answer:
      "We focus on solar panel cleaning robots, soiling and performance ratio, waterless O&M, plant economics, installation and maintenance guides, and product news—written for developers, EPC teams, and asset managers operating MW-scale plants.",
  },
  {
    question: "How often is new content published?",
    answer:
      "We add and refresh articles regularly as technology, tariffs, and field learnings evolve. Check back often or subscribe to the newsletter below for updates when new guides go live.",
  },
];

async function getPublishedBlogs(): Promise<DynamicBlog[]> {
  const rows = await listAllBlogs(false);
  return rows.map((metadata) => ({
    ...metadata,
    href: `/blog/${metadata.slug}`,
    source: "db" as const,
  }));
}

type BlogPageProps = {
  searchParams?: Promise<{ page?: string | string[] }>;
};

export async function generateMetadata({
  searchParams,
}: BlogPageProps): Promise<Metadata> {
  const sp = (await searchParams) ?? {};
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const parsed = parseInt(String(pageRaw || "1"), 10);
  const pageNum = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  const dynamicBlogs = await getPublishedBlogs();
  const totalPages = Math.max(1, Math.ceil(dynamicBlogs.length / PAGE_SIZE));
  const page = Math.min(pageNum, totalPages);

  const canonical =
    page <= 1 ? `${siteUrl}/blog` : `${siteUrl}/blog?page=${page}`;

  const title =
    page <= 1
      ? "Taypro Blog — Solar Panel Cleaning Robot Insights & O&M Guides"
      : `Taypro Blog — Page ${page} | Solar Cleaning & O&M Articles`;

  const description =
    page <= 1
      ? "Expert articles on solar panel cleaning robots, soiling, dry O&M, plant economics, and utility-scale automation in India—written by Taypro engineers and field teams."
      : `Browse page ${page} of Taypro's solar panel cleaning and O&M articles for developers, EPC teams, and asset managers.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
  };
}

export default async function Blog({ searchParams }: BlogPageProps) {
  const sp = (await searchParams) ?? {};
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const parsed = parseInt(String(pageRaw || "1"), 10);
  const pageNum = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  const dynamicBlogs = await getPublishedBlogs();
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
    date: new Date(blog.updatedAt || blog.publishDate).toLocaleDateString(
      "en-IN",
      { year: "numeric", month: "short", day: "numeric" }
    ),
    href: blog.href,
    slug: blog.slug,
  }));

  const itemListEntries = pageSlice.map((b) => ({
    name: b.title,
    url: b.href,
    description: b.description,
    image: b.featuredImage || undefined,
  }));

  const rangeStart = total === 0 ? 0 : start + 1;
  const rangeEnd = Math.min(start + PAGE_SIZE, total);

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <CollectionPageSchema
        name="Taypro Blog — Solar Panel Cleaning Robot Articles"
        description="Expert articles on solar panel cleaning robots, soiling, O&M economics, and utility-scale automation for Indian solar plants."
        url={`${siteUrl}/blog${page > 1 ? `?page=${page}` : ""}`}
        siteUrl={siteUrl}
      />
      <FAQPageSchema faqs={blogIndexFaqs} />
      {itemListEntries.length > 0 && (
        <ItemListSchema
          scriptId="item-list-schema-blog-index"
          name={`Taypro blog articles${page > 1 ? ` — page ${page}` : ""}`}
          description="Solar panel cleaning robot guides, O&M insights, and field notes from Taypro."
          items={itemListEntries}
          siteUrl={siteUrl}
        />
      )}

      <div className="min-h-screen overflow-x-hidden">
        {/* Hero */}
        <section className="relative flex flex-col items-center justify-start overflow-x-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/tayprobglayout/taypro-bg.png')" }}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-white/92 sm:bg-white/88"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/55 to-[#f4f7f9]"
            aria-hidden
          />

          <AnimateOnScroll
            animation="fadeInUp"
            className="relative z-20 pt-10 px-4 sm:px-6 max-w-4xl mx-auto pb-12 md:pb-16 text-center"
          >
            <p className="text-[#A8C117] text-[16px] mb-4 uppercase tracking-wide font-medium">
              Insights for solar O&amp;M teams
            </p>
            <h1 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-6 leading-tight">
              Solar panel cleaning
              <br />
              robot blog &amp; guides
            </h1>
            <p className="text-[#22405a] text-lg md:text-xl leading-relaxed max-w-3xl mx-auto text-pretty">
              Practical articles on soiling, dry cleaning,{" "}
              <Link
                href="/solar-panel-cleaning-system"
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                autonomous robots
              </Link>
              , and plant economics—written for developers, EPC teams, and O&amp;M
              leads running utility-scale PV in India.
            </p>
            <p className="text-[#22405a] text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mt-4 text-pretty">
              Written by the{" "}
              <Link
                href="/authors"
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                Taypro authors
              </Link>
              ; refreshed as field learnings evolve.
            </p>
          </AnimateOnScroll>
        </section>

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
                  <p className="text-white/80 text-sm">Published articles</p>
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
                  <p className="text-white font-semibold mb-1">Meet authors</p>
                  <p className="text-white/70 text-sm">
                    Engineers &amp; field experts →
                  </p>
                </Link>
              </AnimateOnScroll>
              <AnimateOnScroll animation="fadeInUp" delay={160}>
                <Link
                  href="/solar-panel-cleaning-robot-price-calculator"
                  className="block rounded-xl border border-white/10 bg-white/5 px-5 py-4 hover:border-[#A8C117]/50 hover:bg-white/10 transition h-full"
                >
                  <Calculator
                    className="w-8 h-8 text-[#A8C117] mx-auto mb-2"
                    aria-hidden
                  />
                  <p className="text-white font-semibold mb-1">ROI calculator</p>
                  <p className="text-white/70 text-sm">
                    Estimate robot payback →
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
                Start with a popular topic
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                Jump into guides our readers use most when evaluating robotic
                cleaning—or browse the full archive below.
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
                      Read guide
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
                  All articles
                </h2>
                {total > 0 ? (
                  <p className="text-[#27415c]">
                    Showing {rangeStart}–{rangeEnd} of {total}
                    {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
                  </p>
                ) : null}
              </div>
              <Link
                href="/authors"
                className="inline-flex items-center gap-2 text-[#5a8f00] font-medium hover:underline shrink-0"
              >
                View all authors
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </AnimateOnScroll>

            {total === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#27415c] text-lg mb-4">
                  No articles published yet. Check back soon.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center min-h-[48px] bg-[#052638] text-white font-medium px-8 py-3 rounded-md hover:bg-[#0a3a4a] transition"
                >
                  Contact Taypro
                </Link>
              </div>
            ) : (
              <>
                <BlogList blogs={allBlogs} />

                {totalPages > 1 && (
                  <nav
                    className="flex flex-wrap justify-center items-center gap-4 mt-12"
                    aria-label="Blog pagination"
                  >
                    {page > 1 ? (
                      <Link
                        href={page === 2 ? "/blog" : `/blog?page=${page - 1}`}
                        rel={page === 2 ? undefined : "prev"}
                        className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg border border-[#052638] text-[#052638] font-medium hover:bg-[#052638] hover:text-white transition"
                      >
                        Previous
                      </Link>
                    ) : (
                      <span className="inline-flex min-h-[44px] px-5 items-center text-gray-400 border border-gray-200 rounded-lg cursor-not-allowed">
                        Previous
                      </span>
                    )}
                    <span className="text-[#27415c] text-sm sm:text-base font-medium">
                      Page {page} of {totalPages}
                    </span>
                    {page < totalPages ? (
                      <Link
                        href={`/blog?page=${page + 1}`}
                        rel="next"
                        className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg border border-[#052638] text-[#052638] font-medium hover:bg-[#052638] hover:text-white transition"
                      >
                        Next
                      </Link>
                    ) : (
                      <span className="inline-flex min-h-[44px] px-5 items-center text-gray-400 border border-gray-200 rounded-lg cursor-not-allowed">
                        Next
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

        {/* FAQ */}
        <section
          className="w-full py-14 md:py-16 bg-white"
          aria-labelledby="blog-faq-heading"
        >
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <h2
                id="blog-faq-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3"
              >
                About this blog
              </h2>
            </AnimateOnScroll>
            <div className="space-y-6">
              {blogIndexFaqs.map((faq, idx) => (
                <AnimateOnScroll
                  key={faq.question}
                  animation="fadeInUp"
                  delay={idx * 80}
                >
                  <article className="bg-[#f8fafb] rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-[#052638] font-semibold text-lg mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-[#27415c] leading-relaxed">{faq.answer}</p>
                  </article>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Explore */}
        <section className="w-full py-12 md:py-14 bg-[#f4f7f9] border-t border-gray-200">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-2">
                Explore Taypro
              </h2>
              <p className="text-[#27415c]">
                Products, tools, and field deployments beyond the blog.
              </p>
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
