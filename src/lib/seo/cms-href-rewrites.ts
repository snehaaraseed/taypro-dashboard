import { LEGACY_STATIC_PATH_REDIRECTS } from "./legacy-path-redirects";
import { REDIRECTED_BLOG_TARGETS } from "./redirected-blog-slugs";

export const CMS_HREF_LOCALES = ["hi", "ar", "ja", "bn"] as const;
export const CMS_HREF_SITE = "https://taypro.in";

/** Extra one-off href fixes not covered by redirect maps. */
const EXTRA_HREF_REWRITES: [string, string][] = [
  [
    "/blog/the-impact-of-weather-on-solar-panel-cleanliness-in-india",
    "/blog/the-impact-of-weather-on-solar-panel-cleanliness-in-india-tips-for-optimal-performance",
  ],
  [
    "/blog/the-importance-of-solar-panel-cleaning-across-different-regions-of-india",
    "/blog/the-importance-of-solar-panel-cleaning-across-different-regions-of-india-tailoring-solutions-for-diverse-climates",
  ],
  ["/projects/yavatmal-undarni-7-mw", "/projects"],
  ["/company/", "/company"],
  ["/cleaning-technology/", "/cleaning-technology"],
  ["/solar-panel-cleaning-system/", "/solar-panel-cleaning-system"],
  [
    "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system/",
    "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers",
  ],
  [
    "/solar-panel-cleaning-system/solar-panel-cleaning-service/",
    "/solar-panel-cleaning-system/solar-panel-cleaning-service",
  ],
  ["/utility-operations", "/utility-scale-solar-operations"],
  [
    "/blog/how-to-calculate-a-performance-ratio-of-%20a-solar-plant",
    "/blog/how-to-calculate-a-performance-ratio-of-a-solar-plant",
  ],
  [
    "/blog/how-to-choose-best-solar-panels",
    "/blog/how-to-choose-best-solar-panels-in-india",
  ],
];

export type HrefRewritePair = [from: string, to: string];

/** Canonical legacy href rewrite pairs (longest match first). */
export function buildCmsHrefRewritePairs(): HrefRewritePair[] {
  const base: HrefRewritePair[] = [
    ...Object.entries(REDIRECTED_BLOG_TARGETS).map(
      ([slug, destination]) => [`/blog/${slug}`, destination] as HrefRewritePair
    ),
    ...Object.entries(LEGACY_STATIC_PATH_REDIRECTS),
    ...EXTRA_HREF_REWRITES,
  ];

  return base
    .flatMap(([from, to]) => [
      [from, to],
      [`${from}/`, to],
    ] as HrefRewritePair[])
    .sort((a, b) => b[0].length - a[0].length);
}

/** Rewrite legacy internal hrefs in CMS HTML (blogs, projects, messages). */
export function rewriteCmsHrefs(html: string): string {
  if (!html || !html.includes("/")) return html;

  let out = html;
  for (const [from, to] of buildCmsHrefRewritePairs()) {
    const replacements: [string, string][] = [
      [`href="${from}"`, `href="${to}"`],
      [`href='${from}'`, `href='${to}'`],
      [`href="${from}/"`, `href="${to}"`],
      [`href='${from}/'`, `href='${to}'`],
      [`"${CMS_HREF_SITE}${from}"`, `"${CMS_HREF_SITE}${to}"`],
      [`'${CMS_HREF_SITE}${from}'`, `'${CMS_HREF_SITE}${to}'`],
      [`"${CMS_HREF_SITE}${from}/"`, `"${CMS_HREF_SITE}${to}"`],
      [`'${CMS_HREF_SITE}${from}/'`, `'${CMS_HREF_SITE}${to}'`],
    ];

    for (const loc of CMS_HREF_LOCALES) {
      replacements.push(
        [`href="/${loc}${from}"`, `href="/${loc}${to}"`],
        [`href='/${loc}${from}'`, `href='/${loc}${to}'`],
        [`"${CMS_HREF_SITE}/${loc}${from}"`, `"${CMS_HREF_SITE}/${loc}${to}"`],
        [`'${CMS_HREF_SITE}/${loc}${from}'`, `'${CMS_HREF_SITE}/${loc}${to}'`]
      );
    }

    for (const [needle, next] of replacements) {
      if (out.includes(needle)) {
        out = out.split(needle).join(next);
      }
    }
  }

  return out;
}
