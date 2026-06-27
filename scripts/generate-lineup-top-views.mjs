/**
 * Trims blank margins from product top-view renders for the home lineup section.
 * Sources: public/tayprorobots/{product}/lineup-source.png
 *
 * Export requirements (Figma / design tool):
 * - True PNG (not JPEG saved as .png — check with `file lineup-source.png`)
 * - At least 2048px wide (2×) for full-width desktop lineup (~1200px display)
 * - Tight crop around the product (minimal vertical whitespace)
 *
 * Output: lineup-top-view.webp — trimmed, padded, capped at 2× display width, WebP q92.
 *
 * Usage: node scripts/generate-lineup-top-views.mjs
 */
import sharp from "sharp";
import { statSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PADDING_PX = 16;
const TRIM_THRESHOLD = 15;
/** 2× the ~1280px lineup shell — enough for retina without shipping 4K PNGs. */
const MAX_OUTPUT_WIDTH = 2560;
const WEBP_QUALITY = 92;

const PRODUCTS = [
  { id: "glyde", folder: "glyde" },
  { id: "glydeX", folder: "glyde-x" },
  { id: "nyuma", folder: "nyuma" },
  { id: "nyumaX", folder: "nyuma-x" },
  { id: "helyx", folder: "helyx" },
];

const dimensions = {};

for (const { id, folder } of PRODUCTS) {
  const dir = path.join(ROOT, "public/tayprorobots", folder);
  const input = path.join(dir, "lineup-source.png");
  const output = path.join(dir, "lineup-top-view.webp");
  const metaPath = path.join(dir, "lineup-top-view.json");

  const sourceMeta = await sharp(input).metadata();
  if (sourceMeta.format === "jpeg") {
    console.warn(
      `WARN ${id}: lineup-source.png is JPEG data (lossy, ~${Math.round(
        statSync(input).size / 1024
      )}KB). Re-export from Figma as PNG at 2× scale for sharp lineup art.`
    );
  }
  if ((sourceMeta.width ?? 0) < 1600) {
    console.warn(
      `WARN ${id}: source width is ${sourceMeta.width}px — lineup displays up to ~1200px wide and will upscale/blur. Use 2048px+ exports.`
    );
  }

  const trimmed = await sharp(input).trim({ threshold: TRIM_THRESHOLD }).toBuffer();

  const encoded = await sharp(trimmed)
    .extend({
      top: PADDING_PX,
      bottom: PADDING_PX,
      left: PADDING_PX,
      right: PADDING_PX,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .resize({ width: MAX_OUTPUT_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toBuffer({ resolveWithObject: true });

  writeFileSync(output, encoded.data);
  const entry = {
    width: encoded.info.width,
    height: encoded.info.height,
  };
  writeFileSync(metaPath, `${JSON.stringify(entry, null, 2)}\n`);
  dimensions[id] = entry;
  const kb = Math.round(encoded.data.length / 1024);
  console.log(
    `${id}: ${entry.width}x${entry.height} (${kb}KB) -> ${path.relative(ROOT, output)}`
  );
}

writeFileSync(
  path.join(ROOT, "src/lib/products/lineup-top-view-dimensions.json"),
  `${JSON.stringify(dimensions, null, 2)}\n`
);
console.log("Wrote src/lib/products/lineup-top-view-dimensions.json");
