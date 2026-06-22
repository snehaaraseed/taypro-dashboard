"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { formatLocaleDate } from "@/i18n/format-date";
import { getBlogFeaturedImageAlt } from "../utils/imageAlt";
import { DynamicBlog } from "../api/blog/list/route";
import { calculateBlogSimilarity } from "@/lib/seo/blog-similarity-scoring";
import { trackBlogClick } from "@/lib/analytics/track-event";

interface SimilarBlogsProps {
  blogs: DynamicBlog[];
  currentSlug?: string;
  layout?: "sidebar" | "bottom";
}

function lastUpdatedDisplayString(blog: DynamicBlog, locale: string): string {
  const iso = blog.updatedAt || blog.publishDate;
  return formatLocaleDate(locale, iso);
}

// Get similar blogs based on keyword matching
function getSimilarBlogs(
  allBlogs: DynamicBlog[],
  currentSlug?: string
): DynamicBlog[] {
  if (!currentSlug) {
    // If no current slug, return most recent blogs
    return allBlogs.slice(0, 5);
  }

  // Find current blog
  const currentBlog = allBlogs.find((b) => b.slug === currentSlug);
  if (!currentBlog) {
    return allBlogs.filter((b) => b.slug !== currentSlug).slice(0, 5);
  }

  // Calculate similarity scores for all other blogs
  const blogsWithScores = allBlogs
    .filter((b) => b.slug !== currentSlug)
    .map((blog) => ({
      blog,
      score: calculateBlogSimilarity(currentBlog, blog),
      publishDate: new Date(blog.publishDate).getTime(), // For deterministic sorting
    }))
    .sort((a, b) => {
      // Primary sort: by similarity score (highest first)
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Secondary sort: by publish date (most recent first) for deterministic ordering
      return b.publishDate - a.publishDate;
    })
    .slice(0, 5) // Take top 5
    .map((item) => item.blog); // Extract just the blog objects

  // If we don't have enough similar blogs (score > 0), fall back to most recent
  if (blogsWithScores.length < 5) {
    const recentBlogs = allBlogs
      .filter((b) => b.slug !== currentSlug && !blogsWithScores.some((sb) => sb.slug === b.slug))
      .map((blog) => ({
        blog,
        publishDate: new Date(blog.publishDate).getTime(),
      }))
      .sort((a, b) => b.publishDate - a.publishDate)
      .slice(0, 5 - blogsWithScores.length)
      .map((item) => item.blog);

    return [...blogsWithScores, ...recentBlogs].slice(0, 5);
  }

  return blogsWithScores;
}

export function SimilarBlogs({
  blogs,
  currentSlug,
  layout = "sidebar",
}: SimilarBlogsProps) {
  const t = useTranslations("BlogPage.similar");
  const locale = useLocale();
  const similarBlogs = getSimilarBlogs(blogs, currentSlug);

  if (similarBlogs.length === 0) {
    return null;
  }

  if (layout === "bottom") {
    return (
      <section>
        <h3 className="text-3xl font-semibold text-[#052638] mb-8">
          {t("heading")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {similarBlogs.map((similarBlog) => (
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
                  <h4 className="text-xl font-semibold text-[#052638] mb-2 line-clamp-2 group-hover:text-[#A8C117] transition-colors">
                    {similarBlog.title}
                  </h4>
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
        <h3 className="text-2xl font-semibold text-[#052638] mb-6">
          {t("heading")}
        </h3>
        <div className="space-y-6">
          {similarBlogs.map((similarBlog) => (
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
                  <h4 className="text-lg font-semibold text-[#052638] mb-2 line-clamp-2 group-hover:text-[#A8C117] transition-colors">
                    {similarBlog.title}
                  </h4>
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

