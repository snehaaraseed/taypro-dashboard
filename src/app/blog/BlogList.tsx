"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimateOnScroll } from "../components/AnimateOnScroll";

interface BlogItem {
  title: string;
  imgSrc?: string | null;
  date: string;
  href: string;
  slug: string;
}

interface BlogListProps {
  blogs: BlogItem[];
}

export default function BlogList({ blogs }: BlogListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  function handleClick(href: string, slug: string) {
    setLoadingSlug(slug);
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <>
      {isPending && loadingSlug && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex space-x-2">
            <span className="dot w-3 h-3 bg-gray-500 rounded-full animate-bounce"></span>
            <span className="dot w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-100"></span>
            <span className="dot w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-200"></span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {blogs.map((blog, idx: number) => (
          <AnimateOnScroll
            key={blog.slug}
            animation="scaleIn"
            delay={Math.min(idx * 50, 300)}
          >
            <div
              onClick={() => handleClick(blog.href, blog.slug)}
              className="cursor-pointer block border border-gray-300 p-4 overflow-hidden group relative"
            >
              {isPending && loadingSlug === blog.slug && (
                <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              )}

              <div className="relative w-full h-64 sm:h-72 md:h-80 overflow-hidden">
                {blog.imgSrc ? (
                  <Image
                    src={blog.imgSrc}
                    alt={`${blog.title} - Solar Panel Cleaning Robot blog article by Taypro`}
                    title={`${blog.title} - Solar Panel Cleaning Robot Blog`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-90 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105 group-hover:translate-x-3"
                    priority={idx < 3}
                  />
                ) : (
                  // Fallback placeholder when no image is provided
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}

                {/* Dark overlay gradient for better title visibility */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 via-black/40 to-transparent pointer-events-none"></div>

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
          </AnimateOnScroll>
        ))}
      </div>
    </>
  );
}
