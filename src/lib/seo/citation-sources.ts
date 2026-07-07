export const SOURCES_SECTION_HEADING = "Sources and further reading";

/** Whether the HTML body includes a grounded sources / references block. */
export function contentHasSourcesSection(html: string): boolean {
  return new RegExp(SOURCES_SECTION_HEADING, "i").test(html);
}
