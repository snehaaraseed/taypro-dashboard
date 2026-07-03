import "server-only";

import { demoteBodyH1ToH2, splitHtmlByH2Sections } from "@/lib/seo/blog-body-hygiene";
import { stripPlanningArtifacts } from "@/lib/seo/planning-artifacts";

export { stripPlanningArtifacts };

/**
 * Clean a single section-writer chunk: keep only real H2 sections (drop any
 * planning preamble before the first <h2>) and strip leaked artifacts.
 */
export function cleanResearchSectionHtml(html: string): string {
  const { sections } = splitHtmlByH2Sections(html);
  const body = sections.length
    ? sections.map((s) => s.html).join("\n")
    : /<h2[\s>]/i.test(html)
      ? html
      : "";
  return stripPlanningArtifacts(body);
}

/** Page template renders title as H1: strip/demote any model-emitted H1. */
export function sanitizeResearchReportHtml(html: string): string {
  let out = demoteBodyH1ToH2(html);
  out = out.replace(/<h1(\b[^>]*)>/gi, "<h2$1>");
  out = out.replace(/<\/h1>/gi, "</h2>");
  out = stripPlanningArtifacts(out);
  return out;
}

export function researchHtmlHasH1(html: string): boolean {
  return /<h1[\s>]/i.test(html);
}
