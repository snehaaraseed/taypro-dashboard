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
        // Ensure all images have alt text - if missing, add descriptive alt
        if (!img.alt || img.alt.trim() === "") {
          // Try to extract meaningful alt from title or generate one
          const title = img.title || "";
          if (title.toLowerCase().includes("robot") || title.toLowerCase().includes("cleaning")) {
            img.alt = `Solar Panel Cleaning Robot ${title}`;
          } else if (img.src) {
            // Extract filename and create descriptive alt
            const filename = img.src.split("/").pop()?.split(".")[0] || "";
            img.alt = `Solar Panel Cleaning Robot and solar energy technology - ${filename.replace(/-/g, " ")}`;
          } else {
            img.alt = "Solar Panel Cleaning Robot technology and solar energy solution by Taypro";
          }
        }

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

