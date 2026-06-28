/**
 * Quick check: HTML chunking prefers block boundaries, not mid-paragraph cuts.
 *   npx tsx scripts/test-split-html-for-translation.ts
 */
import {
  splitIntoBlockSegments,
  splitMaskedHtmlForTranslation,
} from "../src/lib/translation/split-html-for-translation";

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(msg);
}

const sample = [
  "<h2>Section A</h2>",
  "<p>First paragraph about solar cleaning robots in India.</p>",
  "<p>Second paragraph with vendor evaluation criteria and TCO models.</p>",
  "<h2>Section B</h2>",
  "<p>Third paragraph on MNRE compliance and field operations.</p>",
].join("");

const segments = splitIntoBlockSegments(sample);
assert(segments.length === 5, `expected 5 block segments, got ${segments.length}`);

const chunks = splitMaskedHtmlForTranslation(sample, 120);
assert(chunks.length > 1, "should produce multiple chunks at size 120");
for (const chunk of chunks) {
  assert(!chunk.startsWith("<p>nd "), "chunk should not start mid-word");
}

const hugeParagraph =
  "<p>" + "Word ".repeat(2_000) + "</p>";
const hugeChunks = splitMaskedHtmlForTranslation(hugeParagraph, 500);
assert(hugeChunks.length > 1, "oversized paragraph should split");
const joined = hugeChunks.join("");
assert(joined === hugeParagraph, "split/join should preserve full HTML");

console.log("split-html-for-translation: OK", {
  sampleChunks: chunks.length,
  hugeChunks: hugeChunks.length,
});
