"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  summarizeBlogsBackfillResults,
  summarizeTranslateBlogResults,
  translateBlogAllLocales,
  translateBlogsBackfill,
} from "@/app/admin/utils/translate-blog";

interface Blog {
  title: string;
  description: string;
  featuredImage: string;
  author: string;
  slug: string;
  publishDate: string;
  createdAt: string;
  updatedAt?: string;
  published?: boolean;
  /** True when hi/ar/ja/bn rows match English updatedAt */
  translationsSynced?: boolean;
}

export default function AdminBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [translateLoading, setTranslateLoading] = useState<string | null>(null);
  const [translateAllLoading, setTranslateAllLoading] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/admin/blog/list");
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs);
      } else {
        if (response.status === 401) {
          router.push("/admin/login");
        }
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async (slug: string, title: string) => {
    if (
      !confirm(
        `Translate "${title}" into all site languages (hi, ar, ja, bn) from English? This uses the Gemini API and may take a minute.`
      )
    ) {
      return;
    }
    setTranslateLoading(slug);
    try {
      const data = await translateBlogAllLocales(slug, { force: false });
      alert(
        data.success
          ? `Translation finished.\n\n${summarizeTranslateBlogResults(data)}`
          : `Some locales failed.\n\n${summarizeTranslateBlogResults(data)}`
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setTranslateLoading(null);
      void fetchBlogs();
    }
  };

  const outOfSyncSlugs = blogs
    .filter((b) => b.published !== false && !b.translationsSynced)
    .map((b) => b.slug);

  const handleTranslateAll = async () => {
    if (outOfSyncSlugs.length === 0) {
      alert("All published blogs are already translated for every language.");
      return;
    }
    if (
      !confirm(
        `Translate ${outOfSyncSlugs.length} published blog(s) into hi, ar, ja, and bn using Gemini?\n\nThis can take several minutes. If quota is exceeded, failed locales are queued and retried hourly by the server cron (or run "Translate all" again).`
      )
    ) {
      return;
    }
    setTranslateAllLoading(true);
    try {
      const data = await translateBlogsBackfill({ slugs: outOfSyncSlugs });
      const stillFailed = data.summary.blogs.filter((b) =>
        b.results.some((r) => !r.success)
      );
      alert(
        stillFailed.length === 0
          ? `Bulk translation finished.\n\n${summarizeBlogsBackfillResults(data)}`
          : `Bulk translation finished with errors (often quota). Re-run "Translate all" after the daily limit resets.\n\n${summarizeBlogsBackfillResults(data)}`
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Bulk translation failed");
    } finally {
      setTranslateAllLoading(false);
      void fetchBlogs();
    }
  };

  const handleDelete = async (slug: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleteLoading(slug);
    try {
      const response = await fetch(`/api/admin/blog/${slug}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBlogs(blogs.filter((blog) => blog.slug !== slug));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete blog");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("An error occurred while deleting the blog");
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-[#052638]">Blogs</h1>
        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleTranslateAll}
            disabled={translateAllLoading || outOfSyncSlugs.length === 0}
            className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md transition-colors"
            title={
              outOfSyncSlugs.length === 0
                ? "All published blogs are in sync"
                : `Translate ${outOfSyncSlugs.length} blog(s) missing hi/ar/ja/bn`
            }
          >
            {translateAllLoading
              ? "Translating all…"
              : outOfSyncSlugs.length > 0
                ? `Translate all (${outOfSyncSlugs.length})`
                : "Translate all"}
          </button>
          <button
            onClick={() => router.push("/admin/authors")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Manage Authors
          </button>
          <button
            onClick={() => router.push("/admin/blogs/generate")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Generate with AI
          </button>
          <Link
            href="/admin/blogs/new"
            prefetch
            className="bg-[#A8C117] hover:bg-lime-500 text-white px-6 py-2 rounded-md transition-colors"
          >
            Create New Blog
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredBlogs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">
            {searchQuery
              ? "No blogs found matching your search."
              : "No blogs yet. Create your first blog!"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBlogs.map((blog) => (
                <tr key={blog.slug} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {blog.featuredImage && (
                        <div className="relative w-16 h-16 rounded-md overflow-hidden mr-4 flex-shrink-0">
                          <Image
                            src={blog.featuredImage}
                            alt={blog.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {blog.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {blog.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {blog.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {blog.published === false ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Draft
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Published
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(blog.publishDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {blog.updatedAt
                      ? new Date(blog.updatedAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {blog.published !== false ? (
                        <a
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400 cursor-not-allowed" title="Draft - not viewable on website">
                          View
                        </span>
                      )}
                      <button
                        onClick={() => router.push(`/admin/blogs/${blog.slug}/edit`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      {blog.published !== false && !blog.translationsSynced ? (
                        <button
                          type="button"
                          onClick={() => handleTranslate(blog.slug, blog.title)}
                          disabled={translateLoading === blog.slug}
                          className="text-sky-600 hover:text-sky-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Generate hi, ar, ja, bn from English (Gemini)"
                        >
                          {translateLoading === blog.slug
                            ? "Translating..."
                            : "Translate"}
                        </button>
                      ) : blog.published !== false && blog.translationsSynced ? (
                        <span
                          className="text-gray-400 text-sm"
                          title="All languages match English"
                        >
                          Translated
                        </span>
                      ) : (
                        <span
                          className="text-gray-400 text-sm"
                          title="Publish the post first"
                        >
                          Translate
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(blog.slug, blog.title)}
                        disabled={deleteLoading === blog.slug}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteLoading === blog.slug ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

