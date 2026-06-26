import assert from "node:assert/strict";
import {
  buildLocaleAlternates,
  localizedUrl,
  openGraphLocaleForSite,
} from "../src/lib/seo/locale-alternates";
import { formatBrandTitle, normalizePageTitle, trimSerpTitle, SERP_TITLE_MAX } from "../src/lib/seo/page-title";
import {
  SERP_DESCRIPTION_MAX,
  trimSerpDescription,
} from "../src/lib/seo/serp-description";
import { withHreflang } from "../src/lib/seo/with-hreflang";
import { recoveryNotFoundMetadata } from "../src/lib/seo/recovery-not-found-metadata";
import { getSitemapLocalesForPath } from "../src/lib/seo/sitemap-locales";
import { isLocalePageSubstantivelyTranslated } from "../src/lib/seo/locale-page-quality";
import { normalizeHeadingLevels } from "../src/lib/seo/html-toc";
import { isDraftProjectSlug } from "../src/lib/seo/draft-project-slugs";

assert.equal(localizedUrl("/blog/test", "en"), "https://taypro.in/blog/test");
assert.equal(localizedUrl("/blog/test", "hi"), "https://taypro.in/hi/blog/test");
assert.equal(openGraphLocaleForSite("hi"), "hi_IN");
assert.equal(openGraphLocaleForSite("ar"), "ar_AE");
assert.equal(openGraphLocaleForSite("ja"), "ja_JP");
assert.equal(openGraphLocaleForSite("bn"), "bn_BD");
assert.equal(openGraphLocaleForSite("en"), "en_IN");

assert.equal(normalizePageTitle("Press & Media Coverage | Taypro"), "Press & Media Coverage");
assert.equal(
  formatBrandTitle("GLYDE Automatic Solar Panel Cleaning Robot"),
  "GLYDE Automatic Solar Panel Cleaning Robot | Taypro"
);
assert.equal(
  formatBrandTitle("Press & Media Coverage | Taypro"),
  "Press & Media Coverage | Taypro"
);
assert.ok(trimSerpDescription("x".repeat(200)).length <= SERP_DESCRIPTION_MAX + 1);

assert.ok(
  formatBrandTitle("x".repeat(80)).length <= SERP_TITLE_MAX + 1,
  "formatBrandTitle respects SERP_TITLE_MAX"
);
assert.ok(trimSerpTitle("Short title").length <= SERP_TITLE_MAX);

const publishedLocalesAlternates = buildLocaleAlternates(
  "/projects/yavatmal-undarni-7-mw",
  "ja",
  { locales: ["ja", "hi"], canonicalLocale: "ja" }
);
assert.equal(
  publishedLocalesAlternates.languages?.["x-default"],
  "https://taypro.in/ja/projects/yavatmal-undarni-7-mw",
  "x-default follows first published locale when English is absent"
);

const projectsHubCanonical = withHreflang(
  "/projects",
  "en",
  { title: { absolute: "Taypro Solar Projects" }, description: "Desc" },
  { canonicalSuffix: "?page=2" }
);
assert.equal(
  projectsHubCanonical.alternates?.canonical,
  "https://taypro.in/projects?page=2",
  "Projects hub paginated canonical"
);
assert.equal(
  projectsHubPaginationLinks("https://taypro.in", 2, 4).previous,
  "https://taypro.in/projects"
);
assert.equal(
  projectsHubPaginationLinks("https://taypro.in", 2, 4).next,
  "https://taypro.in/projects?page=3"
);

const pressMeta = withHreflang("/press", "en", {
  title: "Press & Media Coverage | Taypro",
  description: "Desc",
});
assert.equal(
  typeof pressMeta.title === "object" && pressMeta.title && "absolute" in pressMeta.title
    ? pressMeta.title.absolute
    : "",
  "Press & Media Coverage | Taypro"
);

const hiBlogMeta = withHreflang("/blog/test-slug", "hi", {
  title: "Test",
  description: "Desc",
  openGraph: {
    title: "Test",
    description: "Desc",
    url: "https://taypro.in/blog/test-slug",
    type: "article",
  },
});

assert.equal(
  hiBlogMeta.alternates?.canonical,
  "https://taypro.in/hi/blog/test-slug"
);
assert.equal(
  hiBlogMeta.openGraph?.url,
  "https://taypro.in/hi/blog/test-slug"
);
assert.equal(hiBlogMeta.openGraph?.locale, "hi_IN");

const recoveryMeta = recoveryNotFoundMetadata({
  title: "Blog Post Not Found - Taypro",
});
assert.equal(recoveryMeta.alternates?.canonical, undefined);
assert.equal(
  typeof recoveryMeta.robots === "object" &&
    recoveryMeta.robots !== null &&
    "index" in recoveryMeta.robots
    ? recoveryMeta.robots.index
    : undefined,
  false
);

const alternates = buildLocaleAlternates("/compare/foo", "ja");
assert.equal(alternates.canonical, "https://taypro.in/ja/compare/foo");
assert.equal(alternates.languages?.["ja-JP"], "https://taypro.in/ja/compare/foo");
assert.equal(alternates.languages?.["hi-IN"], "https://taypro.in/hi/compare/foo");
const pressLocales = getSitemapLocalesForPath("/press");
assert.ok(pressLocales.includes("en"));
assert.equal(
  pressLocales.includes("hi"),
  isLocalePageSubstantivelyTranslated("press", "hi")
);
assert.ok(getSitemapLocalesForPath("/").includes("hi"));

const untranslatedHiCapex = withHreflang(
  "/solar-cleaning-capex-vs-opex",
  "hi",
  { title: "Test", description: "Desc" },
  isLocalePageSubstantivelyTranslated("solar-cleaning-capex-vs-opex", "hi")
    ? undefined
    : {
        canonicalLocale: "en",
        locales: ["en"],
      }
);
assert.equal(
  untranslatedHiCapex.alternates?.canonical,
  isLocalePageSubstantivelyTranslated("solar-cleaning-capex-vs-opex", "hi")
    ? "https://taypro.in/hi/solar-cleaning-capex-vs-opex"
    : "https://taypro.in/solar-cleaning-capex-vs-opex"
);

const hiCapexSitemapLocales = getSitemapLocalesForPath(
  "/solar-cleaning-capex-vs-opex"
);
assert.ok(
  hiCapexSitemapLocales.includes("en"),
  "English always in sitemap locales"
);
assert.equal(
  hiCapexSitemapLocales.includes("hi"),
  isLocalePageSubstantivelyTranslated("solar-cleaning-capex-vs-opex", "hi"),
  "hi sitemap inclusion follows translation quality"
);

const blogCanonicalCheck = withHreflang(
  "/blog/top-15-solar-power-plants-in-india",
  "en",
  { title: "Test", description: "Desc" }
);
assert.equal(
  blogCanonicalCheck.alternates?.canonical,
  "https://taypro.in/blog/top-15-solar-power-plants-in-india",
  "Blog posts must self-canonical, not /blog hub"
);

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { buildLayoutClientMessages, buildSpaClientMessages } from "../src/i18n/pick-messages";
import { pickSimilarBlogs } from "../src/lib/seo/pick-similar-blogs";
import { parseProjectsHubPage, projectsHubPagePath, projectsHubPaginationLinks } from "../src/lib/cms/projects-hub-pagination";

const messagesRoot = join(process.cwd(), "messages");
const hiMessages = JSON.parse(
  readFileSync(join(messagesRoot, "hi.json"), "utf8")
) as Record<string, unknown>;
const hiPagesDir = join(messagesRoot, "pages", "hi");
for (const file of readdirSync(hiPagesDir).filter((f) => f.endsWith(".json"))) {
  Object.assign(
    hiMessages,
    JSON.parse(readFileSync(join(hiPagesDir, file), "utf8"))
  );
}

const layoutClientMessages = buildLayoutClientMessages(hiMessages, "/");
for (const ns of [
  "Home",
  "Navigation",
  "Common",
  "ModuleManufacturerTrust",
  "PriceCalculatorPage",
  "ProjectsPage",
]) {
  assert.ok(
    ns in layoutClientMessages,
    `layout client bundle must include ${ns} on home route`
  );
}
const blogPathMessages = buildLayoutClientMessages(hiMessages, "/blog");
for (const ns of ["BlogPage", "Navigation", "Common", "Footer"]) {
  assert.ok(
    ns in blogPathMessages,
    `layout client bundle must include ${ns} on /blog`
  );
}
assert.ok(
  !("Home" in blogPathMessages),
  "pathname-scoped layout bundle must not ship Home on /blog"
);
assert.ok(
  !("StateLandingsPage" in blogPathMessages),
  "pathname-scoped layout bundle must not ship StateLandingsPage on /blog"
);

const spaClientMessages = buildSpaClientMessages(hiMessages);
for (const ns of ["Home", "CompanyPage", "BlogPage", "ContactPage", "Navigation"]) {
  assert.ok(
    ns in spaClientMessages,
    `SPA client catalog must include ${ns} for client navigations`
  );
}
assert.ok(
  !("SolarSystemPage" in spaClientMessages),
  "SPA client catalog must not include server-only page namespaces"
);

const similar = pickSimilarBlogs(
  {
    slug: "a",
    title: "Solar panel cleaning robots India",
    description: "Utility-scale robotic cleaning",
  },
  [
    {
      slug: "b",
      title: "Solar panel cleaning cost India",
      description: "Opex pricing for robots",
      featuredImage: "/x.jpg",
      author: "Taypro",
      publishDate: "2026-01-01",
      href: "/blog/b",
      source: "db",
    },
    {
      slug: "c",
      title: "Unrelated topic",
      description: "Something else",
      featuredImage: "/y.jpg",
      author: "Taypro",
      publishDate: "2025-01-01",
      href: "/blog/c",
      source: "db",
    },
  ],
  1
);
assert.equal(similar.length, 1);
assert.equal(similar[0]?.slug, "b");

assert.equal(parseProjectsHubPage(undefined), 1);
assert.equal(parseProjectsHubPage("2"), 2);
assert.equal(projectsHubPagePath(2), "/projects?page=2");

import { getLegacyPathRedirects, buildLegacyAliasMap } from "../src/lib/seo/legacy-path-redirects";
import { DRAFT_PROJECT_PEER_SLUGS } from "../src/lib/seo/draft-project-slugs";

const legacyAliases = buildLegacyAliasMap();
assert.equal(
  legacyAliases["/performance-methodology"],
  "/performance-and-test-methodology"
);
assert.equal(
  legacyAliases["/solar-panel-cleaning-service"],
  "/solar-panel-cleaning-system/solar-panel-cleaning-service"
);
assert.equal(
  legacyAliases["/blog/solar-panel-cleaning-robot-price-calculator"],
  "/solar-panel-cleaning-robot-price-calculator"
);

const legacyRedirects = getLegacyPathRedirects();
assert.ok(
  legacyRedirects.some(
    (r) =>
      r.source === "/performance-methodology" &&
      r.destination === "/performance-and-test-methodology"
  ),
  "performance-methodology redirect"
);
assert.ok(
  legacyRedirects.some(
    (r) =>
      r.source ===
        "/solar-panel-cleaning-system/solar-panel-cleaning-system-for-single-axis-trackers" &&
      r.destination ===
        "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
  ),
  "tracker GLYDE path redirect"
);
assert.equal(DRAFT_PROJECT_PEER_SLUGS.size, 17);

assert.ok(isDraftProjectSlug("yavatmal-undarni-7-mw"));
const normalized = normalizeHeadingLevels("<h2>A</h2><h4>B</h4>");
assert.match(normalized, /<h3>B<\/h3>/);

import { clientNamespacesForPathname } from "../src/i18n/client-message-namespaces";
import { loadMessagesForPath } from "../src/i18n/load-messages";
import { pageModulesForPathname } from "../src/i18n/route-message-modules";

const ROUTE_MESSAGE_SAMPLES = [
  "/",
  "/blog/test-post",
  "/contact",
  "/company",
  "/projects",
  "/projects/automatic",
  "/projects/yavatmal-undarni-7-mw",
  "/solar-panel-cleaning-system",
  "/solar-panel-cleaning-system/nyuma-automatic-cleaning-robot",
  "/solar-panel-cleaning-robot-maharashtra",
  "/solar-panel-cleaning-robot-price-calculator",
  "/utility-scale-solar-operations",
  "/solar-om-services",
];

const SERVER_ONLY_NAMESPACES: Record<string, string[]> = {
  "/": ["SolarSystemPage"],
};

async function assertRouteMessageCoverage() {
  for (const route of ROUTE_MESSAGE_SAMPLES) {
    const modules = pageModulesForPathname(route);
    assert.ok(
      modules.length > 0,
      `${route} must resolve at least one page module`
    );
    const messages = await loadMessagesForPath("en", route);
    for (const ns of clientNamespacesForPathname(route)) {
      assert.ok(
        ns in messages,
        `${route}: loadMessagesForPath missing client namespace ${ns} (modules: ${modules.join(", ")})`
      );
    }
    for (const ns of SERVER_ONLY_NAMESPACES[route] ?? []) {
      assert.ok(
        ns in messages,
        `${route}: loadMessagesForPath missing server namespace ${ns}`
      );
    }
  }

  const contactModules = pageModulesForPathname("/contact");
  assert.ok(
    contactModules.includes("contact.json") && contactModules.length <= 2,
    "contact route should load a minimal page module set"
  );
}

assertRouteMessageCoverage()
  .then(() => {
    console.log("test-seo-fixes: ok");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
