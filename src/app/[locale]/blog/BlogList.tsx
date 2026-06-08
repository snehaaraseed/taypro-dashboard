"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";

export interface BlogItem {
  title: string;
  description?: string;
  imgSrc?: string | null;
  imgAlt: string;
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
        <div
          className="fixed inset-0 bg-white/80 flex items-center justify-center z-50"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex space-x-2">
            <span className="w-3 h-3 bg-[#052638] rounded-full animate-bounce" />
            <span className="w-3 h-3 bg-[#052638] rounded-full animate-bounce [animation-delay:100ms]" />
            <span className="w-3 h-3 bg-[#052638] rounded-full animate-bounce [animation-delay:200ms]" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {blogs.map((blog, idx) => (
          <AnimateOnScroll
            key={blog.slug}
            animation="fadeInUp"
            delay={Math.min(idx * 60, 300)}
          >
            <article
              onClick={() => handleClick(blog.href, blog.slug)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick(blog.href, blog.slug);
                }
              }}
              role="link"
              tabIndex={0}
              className="group cursor-pointer flex flex-col h-full rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:border-[#A8C117] hover:shadow-md transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C117] focus-visible:ring-offset-2"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#eef3f8]">
                {isPending && loadingSlug === blog.slug && (
                  <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#052638] border-t-transparent" />
                  </div>
                )}

                {blog.imgSrc ? (
                  <Image
                    src={blog.imgSrc}
                    alt={blog.imgAlt}
                    title={blog.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={idx === 0}
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#5c6f82] text-sm">
                    Taypro blog
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#052638]/90 via-[#052638]/50 to-transparent pointer-events-none" />
              </div>

              <div className="flex flex-col flex-1 p-5">
                <time className="text-xs font-medium text-[#5a8f00] uppercase tracking-wide mb-2">
                  {blog.date}
                </time>
                <h2 className="text-[#052638] font-semibold text-lg leading-snug mb-2 group-hover:text-[#5a8f00] transition-colors line-clamp-3">
                  {blog.title}
                </h2>
                {blog.description ? (
                  <p className="text-[#27415c] text-sm leading-relaxed line-clamp-3 flex-1">
                    {blog.description}
                  </p>
                ) : null}
                <span className="mt-4 text-sm font-medium text-[#5a8f00] group-hover:underline">
                  Read article →
                </span>
              </div>
            </article>
          </AnimateOnScroll>
        ))}
      </div>
    </>
  );
}
