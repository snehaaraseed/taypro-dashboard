import type {
  ProjectFactsJson,
  ProjectNarrativeSectionId,
  ProjectSectionsJson,
} from "@/lib/cms/project-facts-types";
import { createEmptySectionsJson } from "@/lib/seo/project-content-outline";
import { parseProjectFactsFromCms } from "@/lib/cms/project-facts";

function extractBetweenH2(
  content: string,
  headingPattern: RegExp
): string {
  const h2Re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  const matches: Array<{ heading: string; index: number; end: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = h2Re.exec(content)) !== null) {
    const start = m.index + m[0].length;
    matches.push({
      heading: m[1].replace(/<[^>]+>/g, "").trim(),
      index: start,
      end: start,
    });
  }
  for (let i = 0; i < matches.length; i++) {
    const nextStart =
      i + 1 < matches.length
        ? content.lastIndexOf("<h2", matches[i + 1].index - 1)
        : content.length;
    const body = content.slice(matches[i].index, nextStart).trim();
    if (headingPattern.test(matches[i].heading)) {
      return body;
    }
  }
  return "";
}

const SECTION_PATTERNS: Record<ProjectNarrativeSectionId, RegExp> = {
  environment: /environment|soiling/i,
  challenge: /o&m before|before taypro|challenge/i,
  deployment: /fleet|deployment/i,
  operations: /operations|monitoring/i,
  results: /results|impact/i,
  peers: /peer|checklist|planning/i,
};

export function parseProjectContentToSections(
  content: string,
  facts?: ProjectFactsJson | null
): ProjectSectionsJson {
  const baseFacts = facts ?? { location: "site" };
  const empty = createEmptySectionsJson(baseFacts);

  const exec = extractBetweenH2(
    content,
    /executive summary|overview/i
  );
  if (exec && !/<h2/i.test(exec)) {
    empty.executiveSummary = exec;
  }

  empty.narrative = empty.narrative.map((section) => {
    const pattern = SECTION_PATTERNS[section.id as ProjectNarrativeSectionId];
    const body = pattern ? extractBetweenH2(content, pattern) : "";
    return body
      ? { ...section, bodyHtml: body }
      : section;
  });

  return empty;
}

export function backfillProjectEditorFields(input: {
  title: string;
  description: string;
  details: string[];
  content: string;
  seoKeyword?: string | null;
  factsJson?: string | null;
  sectionsJson?: string | null;
}): {
  facts: ProjectFactsJson;
  sections: ProjectSectionsJson;
} {
  let facts =
    (input.factsJson ? JSON.parse(input.factsJson) : null) as ProjectFactsJson | null;
  if (!facts) {
    facts = parseProjectFactsFromCms({
      title: input.title,
      description: input.description,
      details: input.details,
      content: input.content,
      seoKeyword: input.seoKeyword,
    });
  }

  let sections =
    (input.sectionsJson
      ? (JSON.parse(input.sectionsJson) as ProjectSectionsJson)
      : null) ?? null;
  if (!sections || !sections.narrative?.length) {
    sections = parseProjectContentToSections(input.content, facts);
  }

  return { facts, sections };
}
