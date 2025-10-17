"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DynamicBlog } from "../api/blog/list/route";
import { Breadcrumbs } from "../components/Breadcrumbs";

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Blogs",
    href: "",
  },
];

export default function Blog() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [dynamicBlogs, setDynamicBlogs] = useState<DynamicBlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDynamicBlogs();
  }, []);

  const fetchDynamicBlogs = async () => {
    try {
      const response = await fetch("/api/blog/list");
      if (response.ok) {
        const data = await response.json();
        setDynamicBlogs(data.blogs);
      }
      console.log(response);
    } catch (error) {
      console.error("Error fetching dynamic blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  function handleClick(slug: string) {
    setLoadingSlug(slug);
    startTransition(() => {
      router.push(`/blog/${slug}`);
    });
  }

  const allBlogs = [
    ...dynamicBlogs.map((blog) => ({
      title: blog.title,
      imgSrc: blog.featuredImage,
      date: new Date(blog.publishDate).toLocaleDateString(),
      href: blog.href,
      slug: blog.slug,
      isDynamic: true,
    })),
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      {isPending && loadingSlug && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex space-x-2">
            <span className="dot w-3 h-3 bg-gray-500 rounded-full animate-bounce"></span>
            <span className="dot w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-100"></span>
            <span className="dot w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-200"></span>
          </div>
        </div>
      )}

      <section className="w-full min-h-100 pt-20 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-start">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-[#052638] text-4xl">Blogs</h1>
            <button
              onClick={() => router.push("/blog/add")}
              className="bg-lime-500 text-dark hover:text-white px-6 py-2 rounded-lg hover:bg-[#0a3a52] transition-colors cursor-pointer"
            >
              <h2>Add Blog</h2>
            </button>
          </div>

          {isLoading ? (
            <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
              <div className="flex space-x-2">
                <span className="dot w-3 h-3 bg-gray-500 rounded-full"></span>
                <span className="dot w-3 h-3 bg-gray-500 rounded-full"></span>
                <span className="dot w-3 h-3 bg-gray-500 rounded-full"></span>
              </div>
            </div>
          ) : allBlogs.length === 0 ? (
            <div className="text-center flex justify-center align-center text-xl">
              <span className="bg-red-400 text-white px-4 py-2 rounded-full">
                No Blogs Found
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {allBlogs.map((blog, idx: number) => (
                <div
                  key={idx}
                  onClick={() => handleClick(blog.slug)}
                  className="cursor-pointer block border border-gray-300 p-4 overflow-hidden group relative"
                >
                  {isPending && loadingSlug === blog.slug && (
                    <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                  )}

                  <div className="relative w-full h-90 overflow-hidden">
                    <Image
                      src={blog.imgSrc}
                      alt={blog.title}
                      title="Blogs"
                      fill
                      sizes="sm"
                      className="object-cover opacity-90 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105 group-hover:translate-x-3"
                      priority
                    />

                    <div className="absolute bottom-4 left-4 text-white flex flex-col transition-all duration-300">
                      <h4 className="text-sm font-semibold px-3 transition-transform duration-300 group-hover:-translate-y-3">
                        {blog.title}
                      </h4>
                      <div className="text-xs bg-opacity-60 px-3 opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-20 transition-all duration-300">
                        {blog.date}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
