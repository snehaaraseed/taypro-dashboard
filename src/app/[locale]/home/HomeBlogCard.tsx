"use client";

import Image from "next/image";
import TrackedLink from "@/app/components/TrackedLink";
import { shouldServeImageUnoptimized } from "@/lib/site-images";

type HomeBlogCardProps = {
  href: string;
  title: string;
  description?: string;
  date: string;
  image: string | null;
  imageAlt: string;
};

export function HomeBlogCard({
  href,
  title,
  description,
  date,
  image,
  imageAlt,
}: HomeBlogCardProps) {
  return (
    <TrackedLink
      href={href}
      trackTitle={title}
      trackLocation="home_blog"
      trackType="blog"
      className="group flex flex-col h-full rounded-xl border border-gray-200 overflow-hidden bg-[#f8fafb] hover:border-[#A8C117] hover:shadow-md transition"
    >
      <div className="relative aspect-[16/10] bg-[#eef3f8]">
        {image ? (
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
            loading="lazy"
            unoptimized={shouldServeImageUnoptimized(image)}
          />
        ) : null}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <time className="text-xs text-[#5a8f00] font-medium mb-2">{date}</time>
        <h3 className="text-[#052638] font-semibold text-lg mb-2 line-clamp-2 group-hover:text-[#5a8f00] transition-colors">
          {title}
        </h3>
        {description ? (
          <p className="text-[#27415c] text-sm line-clamp-2 flex-1">{description}</p>
        ) : null}
      </div>
    </TrackedLink>
  );
}
