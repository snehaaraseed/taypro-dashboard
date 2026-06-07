"use client";

import dynamic from "next/dynamic";

const HomeHeroVideoPlayer = dynamic(() => import("./HomeHeroVideoPlayer"), {
  ssr: false,
});

interface HomeHeroVideoClientProps {
  videoId: string;
  title: string;
}

/** Defers hero player JS until after first paint (smaller initial bundle). */
export default function HomeHeroVideoClient({
  videoId,
  title,
}: HomeHeroVideoClientProps) {
  return <HomeHeroVideoPlayer videoId={videoId} title={title} />;
}
