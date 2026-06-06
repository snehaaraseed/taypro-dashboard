import fs from "fs";
import path from "path";
import {
  PROJECT_HERO_FALLBACK,
  resolveProjectHeroForSlug,
} from "./project-hero-image-map.mjs";

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;
const ASSET_BLOCKLIST =
  /favicon|logo|spiral|dashboard\.png|logoforwhitebg/i;
/** WordPress-style thumbs are not hero images. */
const UPLOAD_THUMB_RE = /-\d{2,4}x\d{2,4}\.(jpe?g|png|webp)$/i;

const OG_PRESETS = [
  { path: PROJECT_HERO_FALLBACK, alt: "Taypro utility-scale solar projects with cleaning robots", tags: ["project", "plant", "farm"] },
  { path: "/tayproasset/taypro-robotImage.png", alt: "Taypro solar panel cleaning robot", tags: ["robot", "clean"] },
  { path: "/tayproasset/robots.png", alt: "Taypro robotic solar cleaning fleet", tags: ["robot", "farm", "plant"] },
  { path: "/tayprorobots/nyuma/hero.webp", alt: "Taypro NYUMA automatic cleaning robot", tags: ["automatic", "nyuma", "glyde"] },
  { path: "/tayprorobots/helyx/hero.webp", alt: "Taypro HELYX semi-automatic cleaning robot", tags: ["semi", "helyx", "helyx"] },
  { path: "/tayprorobots/glyde-x/hero.webp", alt: "Taypro GLYDE-X tracker cleaning robot", tags: ["tracker", "glyde-x", "glyde-x"] },
  { path: "/tayprorobots/nyuma-x/hero.webp", alt: "Taypro NYUMA-X tracker PBT cleaning robot", tags: ["tracker", "nyuma-x", "glyde-x"] },
  { path: "/tayprorobots/cradyl-aerial.png", alt: "Taypro CRADYL aerial transfer system", tags: ["plant", "utility"] },
  { path: "/tayprorobots/cradyl-field.png", alt: "Taypro field deployment", tags: ["project", "plant"] },
];

function scanPublicDir(publicRoot, subdir, source, tag) {
  const dir = path.join(publicRoot, subdir);
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const walk = (relative) => {
    const full = path.join(dir, relative);
    let entries;
    try {
      entries = fs.readdirSync(full, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const rel = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(rel);
        continue;
      }
      if (!IMAGE_EXT.test(entry.name)) continue;
      const url = `/${subdir}/${rel}`.replace(/\\/g, "/");
      if (ASSET_BLOCKLIST.test(url)) continue;
      const name = entry.name.replace(/[-_]/g, " ").replace(/\.\w+$/, "");
      out.push({
        url,
        label: `${tag}: ${name}`,
        source,
        tags: [tag, name, subdir],
      });
    }
  };
  walk("");
  return out;
}

function scanUploads(publicRoot, limit = 80) {
  const uploads = path.join(publicRoot, "uploads");
  if (!fs.existsSync(uploads)) return [];
  const out = [];
  const walk = (dir, depth = 0) => {
    if (out.length >= limit || depth > 6) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (out.length >= limit) break;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, depth + 1);
        continue;
      }
      if (!IMAGE_EXT.test(entry.name)) continue;
      if (UPLOAD_THUMB_RE.test(entry.name)) continue;
      const rel = path.relative(publicRoot, full).replace(/\\/g, "/");
      const url = `/${rel}`;
      out.push({
        url,
        label: `upload: ${entry.name}`,
        source: "upload",
        tags: ["upload", "solar", "robot"],
      });
    }
  };
  walk(uploads);
  return out;
}

let cachedPool = null;

export function collectImageCandidates(publicRoot) {
  if (cachedPool) return cachedPool;
  const merged = [];
  const seen = new Set();
  const add = (items) => {
    for (const item of items) {
      if (seen.has(item.url)) continue;
      seen.add(item.url);
      merged.push(item);
    }
  };
  for (const p of OG_PRESETS) {
    add([{ url: p.path, label: p.alt, source: "product", tags: p.tags }]);
  }
  add(scanPublicDir(publicRoot, "tayproasset", "asset", "brand"));
  add(scanPublicDir(publicRoot, "tayprorobots", "product", "robot"));
  add(scanUploads(publicRoot));
  cachedPool = merged.length ? merged : OG_PRESETS.map((p) => ({
    url: p.path,
    label: p.alt,
    source: "product",
    tags: p.tags,
  }));
  return cachedPool;
}

function scoreCandidate(c, title, seoKeyword, rowIndex) {
  const haystack =
    `${c.url} ${c.label} ${c.tags.join(" ")} ${title} ${seoKeyword}`.toLowerCase();
  let score = c.source === "product" ? 3 : c.source === "upload" ? 2 : 1;
  const terms = [...seoKeyword.split(/\s+/), ...title.split(/\s+/)]
    .map((w) => w.toLowerCase())
    .filter((w) => w.length > 3);
  for (const term of terms) {
    if (haystack.includes(term)) score += 3;
  }
  if (/robot|clean|plant|farm|tracker|waterless|utility/.test(haystack)) score += 2;
  score += (rowIndex % 7) * (c.url.charCodeAt(c.url.length - 5) % 3);
  return score;
}

function fileExists(publicRoot, urlPath) {
  const rel = urlPath.replace(/^\//, "");
  return fs.existsSync(path.join(publicRoot, rel));
}

export function pickProjectHeroImage({
  publicRoot,
  title,
  seoKeyword,
  usedUrls,
  rowIndex = 0,
  slug,
}) {
  const mapped = slug ? resolveProjectHeroForSlug(slug) : null;
  if (mapped && fileExists(publicRoot, mapped)) {
    usedUrls.add(mapped);
    const alt = `${title} - Solar Panel Cleaning Robot Installation Project by Taypro`;
    return { url: mapped, alt: alt.slice(0, 200) };
  }

  const pool = collectImageCandidates(publicRoot).filter((c) =>
    fileExists(publicRoot, c.url)
  );
  const available = pool.filter((c) => !usedUrls.has(c.url));
  const ranked = [...(available.length ? available : pool)].sort(
    (a, b) =>
      scoreCandidate(b, title, seoKeyword, rowIndex) -
      scoreCandidate(a, title, seoKeyword, rowIndex)
  );
  const pick = ranked[0] ?? pool[0];
  usedUrls.add(pick.url);
  const alt = `${title} - Solar Panel Cleaning Robot Installation Project by Taypro`;
  return { url: pick.url, alt: alt.slice(0, 200) };
}
