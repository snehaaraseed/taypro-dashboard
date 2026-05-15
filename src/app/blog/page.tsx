import type { Metadata } from "next";
import Link from "next/link";
import { DynamicBlog } from "../api/blog/list/route";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { AnimateOnScroll } from "../components/AnimateOnScroll";
import { NewsletterSubscribeCard } from "../components/NewsletterSubscribeCard";
import BlogList from "./BlogList";
import { listAllBlogs } from "@/lib/cms/blogService";

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Blogs",
    href: "",
  },
];

const PAGE_SIZE = 12;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

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
  const total = dynamicBlogs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(pageNum, totalPages);

  const canonical =
    page <= 1 ? `${siteUrl}/blog` : `${siteUrl}/blog?page=${page}`;

  return {
    alternates: { canonical },
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
    imgSrc:
      blog.featuredImage && blog.featuredImage.trim() !== ""
        ? blog.featuredImage
        : null,
    date: `Updated ${new Date(
      blog.updatedAt || blog.publishDate
    ).toLocaleDateString()}`,
    href: blog.href,
    slug: blog.slug,
  }));

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <section className="w-full min-h-100 pt-20 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-start">
          <AnimateOnScroll animation="fadeInUp" className="mb-8">
            <h1 className="text-[#052638] text-4xl">Blogs</h1>
            <p className="mt-4 text-gray-600 text-base sm:text-lg leading-relaxed max-w-3xl">
              Practical guides on solar panel cleaning, soiling, O&amp;M economics,
              and how robotic cleaning fits utility-scale plants in India.
            </p>
          </AnimateOnScroll>

          {total === 0 ? (
            <div className="text-center flex justify-center align-center text-xl">
              <span className="bg-red-400 text-white px-4 py-2 rounded-full">
                No Blogs Found
              </span>
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
                      className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-md border border-[#052638] text-[#052638] hover:bg-[#052638] hover:text-white transition"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className="inline-flex min-h-[44px] px-5 items-center text-gray-400 border border-gray-200 rounded-md cursor-not-allowed">
                      Previous
                    </span>
                  )}
                  <span className="text-gray-600 text-sm sm:text-base">
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages ? (
                    <Link
                      href={`/blog?page=${page + 1}`}
                      className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-md border border-[#052638] text-[#052638] hover:bg-[#052638] hover:text-white transition"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="inline-flex min-h-[44px] px-5 items-center text-gray-400 border border-gray-200 rounded-md cursor-not-allowed">
                      Next
                    </span>
                  )}
                </nav>
              )}
              <div className="max-w-xl mx-auto mt-6">
                <NewsletterSubscribeCard />
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
