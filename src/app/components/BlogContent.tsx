"use client";

import { useEffect, useRef } from "react";

interface BlogContentProps {
  content: string;
  className?: string;
}

export function BlogContent({ content, className = "" }: BlogContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    // Mark as mounted after first render
    isMountedRef.current = true;

    // Only add event listeners after hydration (no DOM modifications that affect initial render)
    if (!contentRef.current) return;

    // Add error handling for images (only runs on error, doesn't affect initial render)
    const images = contentRef.current.querySelectorAll("img");
    images.forEach((img) => {
      // Only add error handler if not already added
      if (!img.hasAttribute("data-error-handler")) {
        img.setAttribute("data-error-handler", "true");
        img.addEventListener("error", function () {
          // This only runs on error, so it won't affect hydration
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
      dangerouslySetInnerHTML={{ __html: content }}
      suppressHydrationWarning
    />
  );
}

