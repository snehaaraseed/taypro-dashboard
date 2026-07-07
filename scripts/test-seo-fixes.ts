import assert from "node:assert/strict";
import {
  buildLocaleAlternates,
  localizedUrl,
  openGraphLocaleForSite,
} from "../src/lib/seo/locale-alternates";
import { expandPathsToLocalizedUrls } from "../src/lib/seo/purge-cloudflare-cache";
import { formatBrandTitle, normalizePageTitle, trimSerpTitle, SERP_TITLE_MAX } from "../src/lib/seo/page-title";
import {
  SERP_DESCRIPTION_MAX,
  trimSerpDescription,
} from "../src/lib/seo/serp-description";
import { withModulePageHreflang } from "../src/lib/seo/localized-module-metadata";
import { withHreflang } from "../src/lib/seo/with-hreflang";
import { BreadcrumbListSchema } from "../src/app/components/StructuredData";
import React from "react";
import { recoveryNotFoundMetadata } from "../src/lib/seo/recovery-not-found-metadata";
import { getSitemapLocalesForPath } from "../src/lib/seo/sitemap-locales";
import { isLocalePageSubstantivelyTranslated } from "../src/lib/seo/locale-page-quality";
import { normalizeHeadingLevels } from "../src/lib/seo/html-toc";
import { isDraftProjectSlug } from "../src/lib/seo/draft-project-slugs";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteGraphSchema } from "../src/app/components/StructuredData";
import {
  blogListQuerySuffix,
  filterBlogsByQuery,
} from "../src/lib/seo/blog-search";
import { pickRepresentativeAuditUrls } from "../src/lib/seo/pagespeed-urls";
import { contentHasSourcesSection } from "../src/lib/seo/citation-sources";

assert.equal(localizedUrl("/blog/test", "en"), "https://taypro.in/blog/test");
assert.equal(localizedUrl("/blog/test", "hi"), "https://taypro.in/hi/blog/test");
assert.deepEqual(expandPathsToLocalizedUrls(["/blog/test"]), [
  "https://taypro.in/blog/test",
  "https://taypro.in/hi/blog/test",
  "https://taypro.in/ar/blog/test",
  "https://taypro.in/ja/blog/test",
  "https://taypro.in/bn/blog/test",
]);
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
  { canonicalSuffix: "?page=2", omitHreflangLanguages: true }
);
assert.equal(
  projectsHubCanonical.alternates?.canonical,
  "https://taypro.in/projects?page=2",
  "Projects hub paginated canonical"
);
assert.equal(
  projectsHubCanonical.alternates?.languages,
  undefined,
  "Paginated list pages omit hreflang languages"
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

const hiCompareMeta = withModulePageHreflang(
  "/compare/taypro-vs-solabot",
  "comparisons",
  "hi",
  { title: "Test", description: "Desc" }
);
assert.equal(
  hiCompareMeta.alternates?.canonical,
  "https://taypro.in/hi/compare/taypro-vs-solabot"
);
assert.equal(
  hiCompareMeta.alternates?.languages?.["hi-IN"],
  "https://taypro.in/hi/compare/taypro-vs-solabot"
);

assert.match(
  renderToStaticMarkup(
    React.createElement(BreadcrumbListSchema, {
      items: [
        { name: "Home", href: "/" },
        { name: "Compare", href: "/compare/taypro-vs-solabot" },
        { name: "Current", href: "" },
      ],
      locale: "hi",
    })
  ),
  /https:\/\/taypro\.in\/hi\/compare\/taypro-vs-solabot/
);
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
import {
  CLIENT_PAGE_NAMESPACES,
  LAYOUT_CLIENT_NAMESPACES,
  SPA_CLIENT_NAMESPACES,
  clientNamespacesForRequest,
} from "../src/i18n/client-message-namespaces";
import { loadMessagesForClient } from "../src/i18n/load-messages";
import { pickSimilarBlogs } from "../src/lib/seo/pick-similar-blogs";
import { parseProjectsHubPage, projectsHubPagePath, projectsHubPortfolioPagePath, projectsHubPaginationLinks } from "../src/lib/cms/projects-hub-pagination";

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

const spaClientMessages = buildSpaClientMessages(hiMessages);
for (const ns of SPA_CLIENT_NAMESPACES) {
  assert.ok(
    ns in spaClientMessages,
    `SPA API catalog must include ${ns}`
  );
}
assert.ok(
  !("StateLandingsPage" in spaClientMessages),
  "SPA API catalog must not ship server-only StateLandingsPage"
);
assert.ok(
  !("ServiceIndiaPage" in spaClientMessages),
  "SPA API catalog must not ship server-only buyer-intent page copy"
);
assert.ok(
  JSON.stringify(spaClientMessages).length < 200 * 1024,
  "full SPA API catalog must stay under 200KB"
);

const hiClientCatalogForLayout = buildSpaClientMessages(
  JSON.parse(JSON.stringify(hiMessages)) as Record<string, unknown>
);
const blogLayoutMessages = buildLayoutClientMessages(hiClientCatalogForLayout, "/blog");
const cookieLayoutMessages = buildLayoutClientMessages(
  hiClientCatalogForLayout,
  "/cookie-policy"
);

for (const ns of LAYOUT_CLIENT_NAMESPACES) {
  assert.ok(
    ns in blogLayoutMessages,
    `layout bundle must always include ${ns}`
  );
}
assert.ok(
  "BlogPage" in blogLayoutMessages,
  "/blog layout bundle must include BlogPage"
);
assert.ok(
  !("Home" in blogLayoutMessages),
  "/blog layout bundle must not include Home"
);
assert.ok(
  JSON.stringify(blogLayoutMessages).length < 40 * 1024,
  "/blog layout bundle must stay under 40KB"
);
assert.ok(
  JSON.stringify(cookieLayoutMessages).length < 20 * 1024,
  "/cookie-policy layout bundle must stay under 20KB"
);

const hubScoped = buildLayoutClientMessages(
  hiClientCatalogForLayout,
  "/solar-panel-cleaning-system"
);
assert.ok(
  "Home" in hubScoped,
  "/solar-panel-cleaning-system layout bundle must include Home (ProductLineupSection)"
);

for (const route of [
  "/blog",
  "/contact",
  "/company",
  "/cookie-policy",
  "/projects",
  "/projects/automatic",
  "/projects/yavatmal-undarni-7-mw",
]) {
  const scoped = buildLayoutClientMessages(hiClientCatalogForLayout, route);
  for (const ns of clientNamespacesForRequest(route)) {
    assert.ok(
      ns in scoped,
      `${route} layout bundle must include ${ns}`
    );
  }
}

const projectsHubScoped = buildLayoutClientMessages(
  hiClientCatalogForLayout,
  "/projects"
);
const projectDetailScoped = buildLayoutClientMessages(
  hiClientCatalogForLayout,
  "/projects/yavatmal-undarni-7-mw"
);
assert.ok(
  JSON.stringify(projectsHubScoped).length < 40 * 1024,
  "/projects layout bundle must stay under 40KB"
);
assert.ok(
  "ProjectDetailPage" in projectDetailScoped,
  "project detail layout bundle must include ProjectDetailPage"
);
assert.ok(
  !("BlogPage" in projectsHubScoped),
  "/projects layout bundle must not include BlogPage"
);

const spaClientMessagesLegacy = spaClientMessages;
for (const ns of ["Home", "CompanyPage", "BlogPage", "ContactPage", "Navigation"]) {
  assert.ok(
    ns in spaClientMessagesLegacy,
    `SPA allowlist must include ${ns}`
  );
}
assert.ok(
  !("StateLandingsPage" in spaClientMessagesLegacy),
  "SPA allowlist must not include server-only StateLandingsPage"
);
assert.ok(
  !("ServiceIndiaPage" in spaClientMessagesLegacy),
  "SPA allowlist must not include server-only buyer-intent page copy"
);
assert.ok(
  !("SolarSystemPage" in spaClientMessagesLegacy),
  "SPA allowlist must not include server-only page namespaces"
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
assert.equal(
  projectsHubPortfolioPagePath(2),
  "/projects?page=2#all-projects"
);
assert.equal(projectsHubPortfolioPagePath(1), "/projects#all-projects");

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

const siteGraphHtml = renderToStaticMarkup(
  React.createElement(SiteGraphSchema, { siteUrl: "https://taypro.in" })
);
const siteGraphJson = siteGraphHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1];
assert.ok(siteGraphJson, "SiteGraphSchema renders JSON-LD");
const siteGraph = JSON.parse(siteGraphJson) as {
  "@graph": Array<Record<string, unknown>>;
};
assert.ok(
  siteGraph["@graph"].some(
    (node) => node["@id"] === "https://taypro.in/#organization"
  ),
  "SiteGraphSchema must include Organization #organization for Article/Product publisher linking"
);
assert.ok(
  siteGraph["@graph"].some(
    (node) => node["@id"] === "https://taypro.in/#localbusiness"
  ),
  "SiteGraphSchema must retain LocalBusiness node"
);

const filteredBlogs = filterBlogsByQuery(
  [
    {
      title: "Solar panel cleaning robot guide",
      description: "Dry O&M for utility plants",
      slug: "robot-guide",
      href: "/blog/robot-guide",
      featuredImage: "",
      author: "Taypro Team",
      publishDate: "2026-01-01",
      source: "db",
    },
    {
      title: "Manual cleaning costs",
      description: "Labor pricing in India",
      slug: "manual-costs",
      href: "/blog/manual-costs",
      featuredImage: "",
      author: "Taypro Team",
      publishDate: "2026-01-01",
      source: "db",
    },
  ],
  "robot cleaning"
);
assert.equal(filteredBlogs.length, 1);
assert.equal(filteredBlogs[0]?.slug, "robot-guide");

assert.equal(blogListQuerySuffix(2, "solar"), "?page=2&q=solar");
assert.equal(blogListQuerySuffix(1, "solar"), "?q=solar");

const representative = pickRepresentativeAuditUrls([
  "https://taypro.in/",
  "https://taypro.in/blog",
  "https://taypro.in/blog/sample-post",
  "https://taypro.in/solar-panel-cleaning-system",
  "https://taypro.in/hi/blog",
]);
assert.ok(representative.includes("https://taypro.in/"));
assert.ok(representative.includes("https://taypro.in/blog/sample-post"));
assert.ok(!representative.some((url) => url.includes("/hi/")));

assert.ok(
  contentHasSourcesSection(
    '<h2>Sources and further reading</h2><ul><li><a href="https://example.com">Example</a></li></ul>'
  )
);

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
  "/site-map",
  "/compare/solar-panel-cleaning-robot-vs-manual-cleaning",
];

const SERVER_ONLY_NAMESPACES: Record<string, string[]> = {
  "/": ["SolarSystemPage"],
  "/blog/test-post": ["Forms"],
  "/site-map": ["ComparisonsPage"],
  "/compare/solar-panel-cleaning-robot-vs-manual-cleaning": ["Forms"],
};

async function assertRouteMessageCoverage() {
  const hiClientCatalog = await loadMessagesForClient("hi");
  const fromLoader = buildSpaClientMessages(hiClientCatalog);
  for (const ns of CLIENT_PAGE_NAMESPACES) {
    assert.ok(
      ns in fromLoader,
      `loadMessagesForClient must include ${ns}`
    );
  }

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
    contactModules.includes("contact.json") && contactModules.length === 1,
    "contact route should load only contact.json"
  );

  const blogModules = pageModulesForPathname("/blog");
  assert.ok(
    blogModules.includes("blog.json") && blogModules.includes("contact.json"),
    "blog route should load blog + contact (Forms.leadModal)"
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
