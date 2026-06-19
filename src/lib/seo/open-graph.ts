import { PROJECT_HERO_IMAGE_PATH } from "@/lib/site-images";
import type { Metadata } from "next";
import { SITE_URL } from "./sitemap-config";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export type OgImageSpec = {
  path: string;
  alt: string;
  width?: number;
  height?: number;
};

/** Absolute URL for Open Graph / Twitter crawlers. */
export function absoluteOgUrl(pathOrUrl: string): string {
  const s = pathOrUrl.trim();
  if (!s) return absoluteOgUrl(OG_PRESETS.default.path);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `${SITE_URL}${s.startsWith("/") ? s : `/${s}`}`;
}

export function buildOgImage(spec: OgImageSpec) {
  return {
    url: absoluteOgUrl(spec.path),
    width: spec.width ?? OG_WIDTH,
    height: spec.height ?? OG_HEIGHT,
    alt: spec.alt,
  };
}

export function buildTwitterImageUrls(
  images: ReturnType<typeof buildOgImage>[]
): string[] {
  return images.map((img) => img.url);
}

/** Preset share images, use page-specific art where it exists. */
export const OG_PRESETS = {
  default: {
    path: "/tayproasset/taypro-robotImage.png",
    alt: "Taypro Solar Panel Cleaning Robot",
  },
  blog: {
    path: "/tayproasset/taypro-robotImage.png",
    alt: "Taypro Blog, solar panel cleaning robot insights and O&M guides",
  },
  projects: {
    path: PROJECT_HERO_IMAGE_PATH,
    alt: "Taypro utility-scale solar projects with cleaning robots",
  },
  company: {
    path: "/tayproasset/taypro-robotImage.png",
    alt: "About Taypro, solar panel cleaning robot manufacturer in India",
  },
  cleaningTech: {
    path: "/tayproasset/robots.png",
    alt: "Taypro dual-pass waterless solar panel cleaning technology",
  },
  calculator: {
    path: "/tayproasset/robots.png",
    alt: "Taypro solar panel cleaning robot ROI calculator",
  },
  glyde: {
    path: "/tayprorobots/glyde/hero.png",
    alt: "Taypro GLYDE automatic solar panel cleaning robot operating on a utility-scale solar array",
  },
  helyx: {
    path: "/tayprorobots/helyx/hero.png",
    alt: "Taypro HELYX semi-automatic solar panel cleaning robot",
  },
  glydeX: {
    path: "/tayprorobots/glyde-x/hero.png",
    alt: "Taypro GLYDE-X tracker solar panel cleaning robot",
  },
  nyuma: {
    path: "/tayprorobots/nyuma/brush-detail.png",
    alt: "Taypro NYUMA automatic PBT solar panel cleaning robot, PBT brush detail",
  },
  nyumaX: {
    path: "/tayprorobots/nyuma-x/hero.png",
    alt: "Taypro NYUMA-X tracker PBT solar panel cleaning robot",
  },
  opex: {
    path: "/tayprorobots/taypro-opex.webp",
    alt: "Taypro robotic solar panel cleaning service (Opex)",
  },
  console: {
    path: "/tayproasset/nectyr.webp",
    alt: "NECTYR fleet monitoring for cleaning robots",
  },
} as const satisfies Record<string, OgImageSpec>;

export type OgPresetKey = keyof typeof OG_PRESETS;

export function ogImagesFromPreset(key: OgPresetKey) {
  return [buildOgImage(OG_PRESETS[key])];
}

export function socialImagesFromPreset(key: OgPresetKey): {
  openGraph: { images: ReturnType<typeof buildOgImage>[] };
  twitter: { card: "summary_large_image"; images: string[] };
} {
  const images = ogImagesFromPreset(key);
  return {
    openGraph: { images },
    twitter: {
      card: "summary_large_image",
      images: buildTwitterImageUrls(images),
    },
  };
}

/** CMS featured / hero image with fallback preset and descriptive alt. */
export function socialImagesFromMedia(
  mediaPath: string | null | undefined,
  alt: string,
  fallback: OgPresetKey = "default"
): {
  openGraph: { images: ReturnType<typeof buildOgImage>[] };
  twitter: { card: "summary_large_image"; images: string[] };
} {
  const path = mediaPath?.trim() || OG_PRESETS[fallback].path;
  const images = [
    buildOgImage({
      path,
      alt: mediaPath?.trim() ? alt : OG_PRESETS[fallback].alt,
    }),
  ];
  return {
    openGraph: { images },
    twitter: {
      card: "summary_large_image",
      images: buildTwitterImageUrls(images),
    },
  };
}
