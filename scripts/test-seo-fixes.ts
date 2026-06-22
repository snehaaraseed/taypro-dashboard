import assert from "node:assert/strict";
import {
  buildLocaleAlternates,
  localizedUrl,
  openGraphLocaleForSite,
} from "../src/lib/seo/locale-alternates";
import { withHreflang } from "../src/lib/seo/with-hreflang";
import { recoveryNotFoundMetadata } from "../src/lib/seo/recovery-not-found-metadata";
import { getSitemapLocalesForPath } from "../src/lib/seo/sitemap-locales";

assert.equal(localizedUrl("/blog/test", "en"), "https://taypro.in/blog/test");
assert.equal(localizedUrl("/blog/test", "hi"), "https://taypro.in/hi/blog/test");
assert.equal(openGraphLocaleForSite("hi"), "hi_IN");
assert.equal(openGraphLocaleForSite("ar"), "ar_AE");
assert.equal(openGraphLocaleForSite("ja"), "ja_JP");
assert.equal(openGraphLocaleForSite("bn"), "bn_BD");
assert.equal(openGraphLocaleForSite("en"), "en_IN");

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
assert.deepEqual(getSitemapLocalesForPath("/press"), ["en"]);
assert.ok(getSitemapLocalesForPath("/").includes("hi"));

console.log("test-seo-fixes: ok");
