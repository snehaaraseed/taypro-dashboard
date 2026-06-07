"use client";

import Image from "next/image";
import { useState } from "react";

export const HERO_VIDEO_POSTER = "/tayproasset/taypro-robotFeature.webp";

interface HomeHeroVideoProps {
  videoId: string;
  title: string;
}

/** Click-to-play facade; poster is lazy-loaded so mobile LCP stays on the H1. */
export default function HomeHeroVideo({ videoId, title }: HomeHeroVideoProps) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="group relative block h-full min-h-full w-full cursor-pointer overflow-hidden bg-[#052638]"
      aria-label={`Play video: ${title}`}
    >
      <Image
        src={HERO_VIDEO_POSTER}
        alt={title}
        fill
        className="object-cover object-center transition group-hover:scale-[1.02]"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 720px"
        quality={75}
        loading="lazy"
      />
      <span
        className="absolute inset-0 bg-[#052638]/25 transition group-hover:bg-[#052638]/15"
        aria-hidden
      />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#A8C117] text-[#052638] shadow-lg ring-4 ring-white/30 transition group-hover:scale-105 sm:h-[4.5rem] sm:w-[4.5rem]">
        <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}
