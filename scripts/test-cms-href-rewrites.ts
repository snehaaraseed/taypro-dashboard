import assert from "node:assert/strict";
import {
  rewriteCmsHrefs,
  stripInternalHrefTrailingSlashes,
} from "../src/lib/seo/cms-href-rewrites";

const trailing = stripInternalHrefTrailingSlashes(
  '<a href="/blog/foo/">x</a><a href="https://taypro.in/blog/bar/">y</a>'
);
assert.equal(
  trailing,
  '<a href="/blog/foo">x</a><a href="https://taypro.in/blog/bar">y</a>'
);

const legacy = rewriteCmsHrefs(
  '<a href="/blog/how-to-choose-best-solar-panels">panels</a>'
);
assert.equal(
  legacy,
  '<a href="/blog/how-to-choose-best-solar-panels-in-india">panels</a>'
);

const slashAndLegacy = rewriteCmsHrefs(
  '<a href="https://taypro.in/blog/innovations-in-solar-cleaning-systems-what-indias-top-farms-are-using/">innovations</a>'
);
assert.equal(
  slashAndLegacy,
  '<a href="https://taypro.in/blog/innovations-in-solar-cleaning-systems-what-indias-top-farms-are-using">innovations</a>'
);

console.log("test-cms-href-rewrites: ok");
