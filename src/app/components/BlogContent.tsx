"use client";

import { useMemo } from "react";
import { BlogImage } from "@/app/components/BlogImage";
import { repairInlineImgAlts } from "@/lib/seo/blog-inline-img-alt";
import { rewriteCmsImageSrcs } from "@/lib/seo/cms-image-rewrites";
import { parseBlogContentSegments } from "@/lib/seo/parse-blog-content-segments";
import { sanitizeBlogHtml } from "@/lib/security/sanitize-html";

interface BlogContentProps {
  content: string;
  className?: string;
  imageAltContext?: {
    title: string;
    primaryKeyword?: string | null;
  };
}

function wrapCmsTables(html: string): string {
  if (!/<table[\s>]/i.test(html)) return html;
  return html.replace(
    /<table[\s\S]*?<\/table>/gi,
    (table) => `<div class="cms-table-wrap">${table}</div>`
  );
}

export function BlogContent({
  content,
  className = "",
  imageAltContext,
}: BlogContentProps) {
  const segments = useMemo(() => {
    const normalized = rewriteCmsImageSrcs(content);
    const withAlts = imageAltContext
      ? repairInlineImgAlts(normalized, imageAltContext)
      : normalized;
    const sanitized = wrapCmsTables(sanitizeBlogHtml(withAlts));
    return parseBlogContentSegments(sanitized);
  }, [content, imageAltContext]);

  return (
    <div className={className} suppressHydrationWarning>
      {segments.map((segment, index) => {
        if (segment.kind === "html") {
          if (!segment.html.trim()) return null;
          return (
            <div
              key={`html-${index}`}
              dangerouslySetInnerHTML={{ __html: segment.html }}
              suppressHydrationWarning
            />
          );
        }

        if (!segment.src) return null;

        const aspectClass =
          segment.width && segment.height
            ? ""
            : "relative w-full aspect-[16/9] overflow-hidden rounded-lg";

        return (
          <figure
            key={`img-${index}-${segment.src}`}
            className="blog-inline-figure my-8"
          >
            <div className={aspectClass || "relative w-full overflow-hidden rounded-lg"}>
              <BlogImage
                src={segment.src}
                alt={segment.alt}
                fill={!segment.width || !segment.height}
                width={segment.width}
                height={segment.height}
                className={
                  segment.width && segment.height
                    ? `${segment.className} h-auto w-full`
                    : `object-cover ${segment.className}`
                }
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
              />
            </div>
            {segment.caption ? (
              <figcaption className="text-sm text-gray-600 mt-2 text-center">
                {segment.caption}
              </figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}
