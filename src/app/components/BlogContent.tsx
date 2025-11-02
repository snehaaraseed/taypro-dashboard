"use client";

import { useEffect, useRef } from "react";

interface BlogContentProps {
  content: string;
  className?: string;
}

export function BlogContent({ content, className = "" }: BlogContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Process images in the content
      const images = contentRef.current.querySelectorAll("img");
      images.forEach((img) => {
        // Add error handling for images
        img.addEventListener("error", function () {
          this.style.display = "none";
          const fallback = document.createElement("div");
          fallback.className =
            "w-full h-48 flex items-center justify-center bg-gray-200 text-gray-500 rounded-lg";
          fallback.textContent = "Image not available";
          this.parentNode?.replaceChild(fallback, this);
        });

        // Ensure images load properly
        img.loading = "lazy";
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.display = "block";
        img.style.margin = "1.5rem auto";
      });
    }
  }, [content]);

  return (
    <div
      ref={contentRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

