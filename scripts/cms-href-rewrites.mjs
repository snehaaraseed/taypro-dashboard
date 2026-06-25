#!/usr/bin/env node
/**
 * Shared legacy href rewrite pairs for CMS + messages fix scripts.
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

export const LOCALES = ["hi", "ar", "ja", "bn"];
export const SITE = "https://taypro.in";

export function loadHrefRewrites() {
  const raw = execSync(
    `npx tsx -e "
import { REDIRECTED_BLOG_TARGETS } from './src/lib/seo/redirected-blog-slugs.ts';
import { LEGACY_STATIC_PATH_REDIRECTS } from './src/lib/seo/legacy-path-redirects.ts';
const pairs = [
  ...Object.entries(REDIRECTED_BLOG_TARGETS).map(([from, to]) => ['/blog/' + from, to]),
  ...Object.entries(LEGACY_STATIC_PATH_REDIRECTS),
  ['/blog/the-impact-of-weather-on-solar-panel-cleanliness-in-india', '/blog/the-impact-of-weather-on-solar-panel-cleanliness-in-india-tips-for-optimal-performance'],
  ['/blog/the-importance-of-solar-panel-cleaning-across-different-regions-of-india', '/blog/the-importance-of-solar-panel-cleaning-across-different-regions-of-india-tailoring-solutions-for-diverse-climates'],
  ['/projects/yavatmal-undarni-7-mw', '/projects'],
  ['/company/', '/company'],
  ['/cleaning-technology/', '/cleaning-technology'],
  ['/solar-panel-cleaning-system/', '/solar-panel-cleaning-system'],
  ['/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system/', '/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers'],
  ['/solar-panel-cleaning-system/solar-panel-cleaning-service/', '/solar-panel-cleaning-system/solar-panel-cleaning-service'],
  ['/utility-operations', '/utility-scale-solar-operations'],
];
console.log(JSON.stringify(pairs));
"`,
    { cwd: root, encoding: "utf8" }
  );
  return JSON.parse(raw)
    .flatMap(([from, to]) => [
      [from, to],
      [`${from}/`, to],
    ])
    .sort((a, b) => b[0].length - a[0].length);
}

export function rewriteText(text, pairs) {
  if (!text || !text.includes("/")) return { text, count: 0 };
  let out = text;
  let count = 0;

  for (const [from, to] of pairs) {
    const replacements = [
      [`href="${from}"`, `href="${to}"`],
      [`href='${from}'`, `href='${to}'`],
      [`href="${from}/"`, `href="${to}"`],
      [`href='${from}/'`, `href='${to}'`],
      [`"${SITE}${from}"`, `"${SITE}${to}"`],
      [`'${SITE}${from}'`, `'${SITE}${to}'`],
      [`"${SITE}${from}/"`, `"${SITE}${to}"`],
      [`'${SITE}${from}/'`, `'${SITE}${to}'`],
    ];

    for (const loc of LOCALES) {
      replacements.push(
        [`href="/${loc}${from}"`, `href="/${loc}${to}"`],
        [`href='/${loc}${from}'`, `href='/${loc}${to}'`],
        [`"${SITE}/${loc}${from}"`, `"${SITE}/${loc}${to}"`],
        [`'${SITE}/${loc}${from}'`, `'${SITE}/${loc}${to}'`]
      );
    }

    for (const [needle, next] of replacements) {
      if (out.includes(needle)) {
        const parts = out.split(needle);
        out = parts.join(next);
        count += parts.length - 1;
      }
    }
  }

  return { text: out, count };
}
