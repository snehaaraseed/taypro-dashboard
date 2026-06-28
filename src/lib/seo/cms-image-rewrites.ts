/** Deleted legacy image paths → canonical on-disk assets (matches next.config.ts redirects). */
export const LEGACY_IMAGE_REWRITES: Record<string, string> = {
  "/tayprorobots/taypro-glyde-x-tracker-solar-cleaning-robot.png":
    "/tayprorobots/glyde-x/hero.webp",
  "/tayprorobots/taypro-helyx-semi-automatic-solar-cleaning-robot.png":
    "/tayprorobots/helyx/hero.webp",
  "/tayprorobots/taypro-nyuma-automatic-solar-cleaning-robot.png":
    "/tayprorobots/nyuma/hero-dark.webp",
  "/tayprorobots/taypro-nyuma-x-tracker-solar-cleaning-robot.png":
    "/tayprorobots/nyuma-x/hero.webp",
  "/tayprorobots/taypro-modelA.png": "/tayprorobots/glyde/hero.webp",
  "/tayprorobots/taypro-modelAcopy.png": "/tayprorobots/glyde/hero.webp",
  "/tayprorobots/taypro-modelBcopy.png": "/tayprorobots/helyx/hero.webp",
  "/tayprorobots/taypro-modelT-img.png": "/tayprorobots/glyde-x/hero.webp",
  "/tayprorobots/taypro-modelTcopy.png": "/tayprorobots/glyde-x/hero.webp",
  "/tayprorobots/glyde/glyde-tr150-top-view.png":
    "/tayprorobots/glyde/hero.webp",
  "/tayproasset/taypro-console.png": "/tayproasset/nectyr.webp",
  "/tayprorobots/glyde/glyde-dual-pass-mechanism.png":
    "/tayprorobots/glyde/side-view.webp",
  "/tayprorobots/glyde/dual-pass-mechanism.png":
    "/tayprorobots/glyde/side-view.webp",
  "/tayprorobots/glyde/glyde-docking-power-unit.png":
    "/tayprorobots/glyde/docking-power-unit.webp",
  "/tayprorobots/taypro-opex.jpg": "/tayprorobots/taypro-opex.webp",
  "/tayprorobots/nyuma/hero.png": "/tayprorobots/nyuma/hero-dark.webp",
  "/tayprorobots/nyuma/hero.webp": "/tayprorobots/nyuma/hero-dark.webp",
  "/tayproasset/nectyr.png": "/tayproasset/nectyr.webp",
  "/tayproasset/robots.png": "/tayproasset/robots.webp",
};

const LEGACY_IMAGE_PAIRS = Object.entries(LEGACY_IMAGE_REWRITES).sort(
  (a, b) => b[0].length - a[0].length
);

const NEXT_IMAGE_SRC_RE =
  /(?:https?:\/\/(?:www\.)?taypro\.in)?\/_next\/image\?url=([^&"'\s]+)(?:&amp;|&)[^"'\s]*/gi;

function canonicalImagePath(pathname: string): string {
  const base = pathname.split("?")[0]?.trim() ?? pathname;
  return LEGACY_IMAGE_REWRITES[base] ?? base;
}

/** Normalize a single img src (legacy path or baked `/_next/image` URL). */
export function normalizeCmsImageSrc(src: string): string {
  if (!src) return src;
  const nextImageMatch = src.match(
    /\/_next\/image\?url=([^&"'\s]+)/
  );
  if (nextImageMatch) {
    return canonicalImagePath(decodeImageUrlParam(nextImageMatch[1]!));
  }
  return canonicalImagePath(src);
}

function decodeImageUrlParam(encoded: string): string {
  try {
    return decodeURIComponent(encoded.replace(/&amp;/g, "&"));
  } catch {
    return encoded;
  }
}

/** Rewrite legacy img paths and baked-in `/_next/image?url=…` CMS HTML to canonical assets. */
export function rewriteCmsImageSrcs(html: string): string {
  if (!html || !html.includes("/")) return html;

  let out = html.replace(NEXT_IMAGE_SRC_RE, (_match, encoded: string) => {
    return canonicalImagePath(decodeImageUrlParam(encoded));
  });

  for (const [from, to] of LEGACY_IMAGE_PAIRS) {
    out = out.split(from).join(to);
    out = out.split(encodeURIComponent(from)).join(encodeURIComponent(to));
  }

  return out;
}
