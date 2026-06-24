"use client";

import { useEffect, useRef, useMemo } from "react";
import { repairInlineImgAlts } from "@/lib/seo/blog-inline-img-alt";
import { sanitizeBlogHtml } from "@/lib/security/sanitize-html";
import { nextImageUrl } from "@/lib/images/nextImageUrl";

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
  const contentRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);
  const safeHtml = useMemo(() => {
    const withAlts = imageAltContext
      ? repairInlineImgAlts(content, imageAltContext)
      : content;
    return wrapCmsTables(sanitizeBlogHtml(withAlts));
  }, [content, imageAltContext]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!contentRef.current) return;

    const images = contentRef.current.querySelectorAll("img");
    images.forEach((img) => {
      const src = img.getAttribute("src");
      if (src?.startsWith("/") && !src.startsWith("//")) {
        const optimized = nextImageUrl(src, 1400, 75);
        if (img.getAttribute("src") !== optimized) {
          img.setAttribute("src", optimized);
          img.setAttribute("srcset", "");
        }
      }

      if (!img.hasAttribute("data-error-handler")) {
        img.setAttribute("data-error-handler", "true");
        img.addEventListener("error", function () {
          this.style.display = "none";
          const fallback = document.createElement("div");
          fallback.className =
            "w-full h-48 flex items-center justify-center bg-gray-200 text-gray-500 rounded-lg";
          fallback.textContent = "Image not available";
          this.parentNode?.replaceChild(fallback, this);
        });
      }
    });
  }, [content]);

  return (
    <div
      ref={contentRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
      suppressHydrationWarning
    />
  );
}
