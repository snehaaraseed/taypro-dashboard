"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { formatLocaleDate } from "@/i18n/format-date";
import { getBlogFeaturedImageAlt } from "../utils/imageAlt";
import { DynamicBlog } from "../api/blog/list/route";
import { trackBlogClick } from "@/lib/analytics/track-event";

interface SimilarBlogsProps {
  /** Pre-selected similar posts (server should pass at most 5). */
  blogs: DynamicBlog[];
  layout?: "sidebar" | "bottom";
}

function lastUpdatedDisplayString(blog: DynamicBlog, locale: string): string {
  const iso = blog.updatedAt || blog.publishDate;
  return formatLocaleDate(locale, iso);
}

export function SimilarBlogs({
  blogs,
  layout = "sidebar",
}: SimilarBlogsProps) {
  const t = useTranslations("BlogPage.similar");
  const locale = useLocale();

  if (blogs.length === 0) {
    return null;
  }

  if (layout === "bottom") {
    return (
      <section>
        <h2 className="text-3xl font-semibold text-[#052638] mb-8">
          {t("heading")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {blogs.map((similarBlog) => (
            <Link
              key={similarBlog.slug}
              href={similarBlog.href}
              className="block group"
              onClick={() =>
                trackBlogClick({
                  slug: similarBlog.slug,
                  title: similarBlog.title,
                  location: "blog_similar",
                })
              }
            >
              <div className="h-full border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                <div className="relative w-full h-52 overflow-hidden">
                  <Image
                    src={similarBlog.featuredImage}
                    alt={getBlogFeaturedImageAlt(similarBlog)}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-[#052638] mb-2 line-clamp-2 group-hover:text-[#A8C117] transition-colors">
                    {similarBlog.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {similarBlog.description}
                  </p>
                  <span className="text-xs text-gray-500">
                    {t("lastUpdated", {
                      date: lastUpdatedDisplayString(similarBlog, locale),
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <aside className="lg:w-80 flex-shrink-0">
      <div className="sticky top-24">
        <h2 className="text-2xl font-semibold text-[#052638] mb-6">
          {t("heading")}
        </h2>
        <div className="space-y-6">
          {blogs.map((similarBlog) => (
            <Link
              key={similarBlog.slug}
              href={similarBlog.href}
              className="block group"
              onClick={() =>
                trackBlogClick({
                  slug: similarBlog.slug,
                  title: similarBlog.title,
                  location: "blog_similar",
                })
              }
            >
              <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={similarBlog.featuredImage}
                    alt={getBlogFeaturedImageAlt(similarBlog)}
                    fill
                    sizes="(max-width: 1024px) 100vw, 320px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-[#052638] mb-2 line-clamp-2 group-hover:text-[#A8C117] transition-colors">
                    {similarBlog.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {similarBlog.description}
                  </p>
                  <span className="text-xs text-gray-500">
                    {t("lastUpdated", {
                      date: lastUpdatedDisplayString(similarBlog, locale),
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
