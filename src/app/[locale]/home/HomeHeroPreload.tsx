export const HERO_IMAGE = "/tayproasset/cover-solar-hero.webp";
export const HERO_IMAGE_MOBILE = "/tayproasset/cover-solar-hero-mobile.webp";

/** Hoists hero image preloads into document head. */
export default function HomeHeroPreload() {
  return (
    <>
      <link
        rel="preload"
        href={HERO_IMAGE_MOBILE}
        as="image"
        type="image/webp"
        fetchPriority="high"
        media="(max-width: 828px)"
      />
      <link
        rel="preload"
        href={HERO_IMAGE}
        as="image"
        type="image/webp"
        fetchPriority="high"
        media="(min-width: 829px)"
      />
    </>
  );
}
