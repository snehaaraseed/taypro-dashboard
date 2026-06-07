"use client";

import { useState } from "react";

interface HomeHeroVideoPlayerProps {
  videoId: string;
  title: string;
}

/** Click-to-play overlay; poster on desktop is server-rendered in HomeHeroVideo. */
export default function HomeHeroVideoPlayer({
  videoId,
  title,
}: HomeHeroVideoPlayerProps) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="group absolute inset-0 z-10 cursor-pointer bg-transparent"
      aria-label={`Play video: ${title}`}
    >
      <span
        className="absolute inset-0 bg-[#052638]/25 group-hover:bg-[#052638]/15"
        aria-hidden
      />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#A8C117] text-[#052638] shadow-lg ring-4 ring-white/30 sm:h-[4.5rem] sm:w-[4.5rem]">
        <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}
