import Image from "next/image";
import HomeHeroVideoPlayer from "./HomeHeroVideoPlayer";

export const HERO_VIDEO_POSTER = "/tayproasset/taypro-robotFeature.webp";

interface HomeHeroVideoProps {
  videoId: string;
  title: string;
}

/**
 * Server-rendered posters: priority on desktop (LCP), lazy on mobile (H1 is LCP).
 * Client overlay handles click-to-play only — no Image inside client bundle.
 */
export default function HomeHeroVideo({ videoId, title }: HomeHeroVideoProps) {
  const imageProps = {
    src: HERO_VIDEO_POSTER,
    alt: title,
    fill: true as const,
    className: "object-cover object-center",
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 720px",
    quality: 75,
  };

  return (
    <div className="relative h-full min-h-full w-full overflow-hidden bg-[#052638]">
      {/* Desktop: in HTML early, high fetch priority — no `priority` prop (avoids mobile preload) */}
      <Image
        {...imageProps}
        loading="eager"
        fetchPriority="high"
        className={`${imageProps.className} hidden lg:block`}
      />
      {/* Mobile: defer; copy column is LCP */}
      <Image
        {...imageProps}
        loading="lazy"
        className={`${imageProps.className} lg:hidden`}
      />
      <HomeHeroVideoPlayer videoId={videoId} title={title} />
    </div>
  );
}
