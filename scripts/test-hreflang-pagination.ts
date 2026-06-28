import assert from "node:assert/strict";
import { buildLocaleAlternates } from "../src/lib/seo/locale-alternates";
import {
  blogSlugVariants,
  canonicalBlogHref,
  canonicalBlogSlug,
} from "../src/lib/seo/redirected-blog-slugs";

const pageOne = buildLocaleAlternates("/blog", "en");
assert.ok(pageOne.languages?.["en-IN"], "page 1 includes hreflang languages");

const pageFour = buildLocaleAlternates("/blog", "en", {
  canonicalSuffix: "?page=4",
  omitHreflangLanguages: true,
});
assert.equal(
  pageFour.canonical,
  "https://taypro.in/blog?page=4",
  "paginated canonical"
);
assert.equal(pageFour.languages, undefined, "paginated pages omit languages");

assert.equal(
  canonicalBlogSlug("how-to-choose-best-solar-panels"),
  "how-to-choose-best-solar-panels-in-india"
);
assert.equal(
  canonicalBlogHref("how-to-choose-best-solar-panels"),
  "/blog/how-to-choose-best-solar-panels-in-india"
);
assert.ok(
  blogSlugVariants("how-to-choose-best-solar-panels-in-india").includes(
    "how-to-choose-best-solar-panels"
  )
);

const canonicalHreflang = buildLocaleAlternates(
  "/blog/how-to-choose-best-solar-panels-in-india",
  "ja",
  { locales: ["en", "hi", "ja", "bn"] }
);
assert.equal(
  canonicalHreflang.languages?.["ja-JP"],
  "https://taypro.in/ja/blog/how-to-choose-best-solar-panels-in-india"
);
assert.equal(
  canonicalHreflang.languages?.["en-IN"],
  "https://taypro.in/blog/how-to-choose-best-solar-panels-in-india"
);

console.log("test-hreflang-pagination: ok");
