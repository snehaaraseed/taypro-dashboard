"use client";

import Image from "next/image";
import { useState } from "react";

interface BlogImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}

export function BlogImage({
  src,
  alt,
  className = "",
  fill = false,
  sizes,
  priority = false,
}: BlogImageProps) {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  if (error) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-200 text-gray-500 rounded-lg">
        <span>Image not available</span>
      </div>
    );
  }

  const isExternal = imgSrc?.startsWith("http") || imgSrc?.startsWith("//");

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
      {...(isExternal ? { unoptimized: true } : {})}
    />
  );
}

