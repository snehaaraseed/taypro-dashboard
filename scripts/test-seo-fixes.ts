import assert from "node:assert/strict";
import {
  buildLocaleAlternates,
  localizedUrl,
  openGraphLocaleForSite,
} from "../src/lib/seo/locale-alternates";
import { formatBrandTitle, normalizePageTitle } from "../src/lib/seo/page-title";
import {
  SERP_DESCRIPTION_MAX,
  trimSerpDescription,
} from "../src/lib/seo/serp-description";
import { withHreflang } from "../src/lib/seo/with-hreflang";
import { recoveryNotFoundMetadata } from "../src/lib/seo/recovery-not-found-metadata";
import { getSitemapLocalesForPath } from "../src/lib/seo/sitemap-locales";
import { isLocalePageSubstantivelyTranslated } from "../src/lib/seo/locale-page-quality";

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

console.log("test-seo-fixes: ok");
