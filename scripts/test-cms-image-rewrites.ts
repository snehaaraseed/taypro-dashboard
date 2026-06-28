/**
 * Unit checks for CMS legacy image rewrites.
 * Run: npx tsx scripts/test-cms-image-rewrites.ts
 */
import assert from "node:assert/strict";
import { rewriteCmsImageSrcs, normalizeCmsImageSrc } from "../src/lib/seo/cms-image-rewrites";

const bakedNextImage =
  'src="https://taypro.in/_next/image?url=%2Ftayproasset%2Ftaypro-console.png&amp;w=1200&amp;q=75"';
const bakedGlyde =
  'src="https://taypro.in/_next/image?url=%2Ftayprorobots%2Fglyde%2Fglyde-tr150-top-view.png&amp;w=1200&amp;q=75"';

assert.equal(
  rewriteCmsImageSrcs(bakedNextImage),
  'src="/tayproasset/nectyr.webp"'
);
assert.equal(
  rewriteCmsImageSrcs(bakedGlyde),
  'src="/tayprorobots/glyde/hero.webp"'
);
assert.equal(
  rewriteCmsImageSrcs('<img src="/tayproasset/taypro-console.png" alt="x">'),
  '<img src="/tayproasset/nectyr.webp" alt="x">'
);

assert.equal(
  normalizeCmsImageSrc(
    "https://taypro.in/_next/image?url=%2Ftayproasset%2Ftaypro-console.png&w=1200&q=75"
  ),
  "/tayproasset/nectyr.webp"
);

console.log("cms-image-rewrites: all checks passed");
