/**
 * Keep a single <h2>Operations evidence summary</h2> section; drop duplicate top-up blocks.
 */
const HEADING = "<h2>Operations evidence summary</h2>";
const CONCLUSION = "<h2>Conclusion</h2>";

export function countOperationsEvidenceBlocks(html) {
  return (html.match(/<h2>Operations evidence summary<\/h2>/g) || []).length;
}

/**
 * @param {string} html
 * @returns {string}
 */
export function dedupeOperationsEvidenceSummary(html) {
  const count = countOperationsEvidenceBlocks(html);
  if (count <= 1) return html;

  const firstIdx = html.indexOf(HEADING);
  if (firstIdx < 0) return html;

  const conclusionIdx = html.indexOf(CONCLUSION, firstIdx);
  if (conclusionIdx < 0) {
    // No conclusion: remove duplicate headings after the first block (until next h2 or end)
    const afterFirst = html.slice(firstIdx + HEADING.length);
    const nextH2 = afterFirst.search(/<h2>/);
    const firstBlockEnd =
      nextH2 >= 0 ? firstIdx + HEADING.length + nextH2 : html.length;
    const tail = html.slice(firstBlockEnd);
    const tailDeduped = tail.replace(
      /<h2>Operations evidence summary<\/h2>[\s\S]*?(?=<h2>|$)/g,
      ""
    );
    return html.slice(0, firstBlockEnd) + tailDeduped;
  }

  const before = html.slice(0, firstIdx);
  const fromFirst = html.slice(firstIdx, conclusionIdx);
  const after = html.slice(conclusionIdx);

  // First block: from first heading up to (but not including) second duplicate heading
  const secondIdx = fromFirst.indexOf(HEADING, HEADING.length);
  const firstBlock =
    secondIdx >= 0 ? fromFirst.slice(0, secondIdx) : fromFirst;

  return before + firstBlock.trimEnd() + "\n\n" + after;
}
