import Image from "next/image";
import HomeHeroVideoClient from "./HomeHeroVideoClient";

export const HERO_VIDEO_POSTER = "/tayproasset/taypro-robotFeature.webp";

interface HomeHeroVideoProps {
  videoId: string;
  title: string;
}

/**
 * Desktop: poster is LCP (eager, high priority).
 * Mobile: no poster fetch — solid bg + play control; H1 in copy column stays LCP.
 */
export default function HomeHeroVideo({ videoId, title }: HomeHeroVideoProps) {
  return (
    <div className="relative h-full min-h-full w-full overflow-hidden bg-[#052638]">
      <Image
        src={HERO_VIDEO_POSTER}
        alt={title}
        fill
        className="hidden lg:block object-cover object-center"
        sizes="(max-width: 1024px) 90vw, 720px"
        quality={75}
        loading="eager"
        fetchPriority="high"
      />
      <HomeHeroVideoClient videoId={videoId} title={title} />
    </div>
  );
}
