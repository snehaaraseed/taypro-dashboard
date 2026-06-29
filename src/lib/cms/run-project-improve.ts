import "server-only";

import type {
  ProjectEditorialStatus,
  ProjectFactsJson,
  ProjectSectionsJson,
} from "@/lib/cms/project-facts-types";
import {
  buildDetailsFromFacts,
  formatProjectFactsForPrompt,
} from "@/lib/cms/project-facts";
import {
  enrichFactsWithRegionalContext,
  getRegionalContext,
} from "@/lib/cms/project-regional-context";
import {
  composeProjectContent,
  countNarrativeWords,
  extractInlineImagesFromHtml,
} from "@/lib/cms/compose-project-content";
import { expandShortProjectContent } from "@/lib/cms/project-content-expand";
import { parseProjectContentToSections } from "@/lib/cms/parse-project-content";
import { stripHtmlToPlainText } from "@/lib/seo/blog-similarity";
import { backfillProjectEditorFields } from "@/lib/cms/parse-project-content";
import {
  createEmptySectionsJson,
  resolveProjectWordCountPolicy,
} from "@/lib/seo/project-content-outline";
import {
  buildProjectPlanPrompt,
  buildProjectSectionPrompt,
  type ProjectContentPlan,
} from "@/lib/seo/project-section-writer";
import { buildProjectKnowledgeContext } from "@/lib/seo/project-knowledge-context";
import {
  assertGeneratedProjectValid,
  validateGeneratedProject,
} from "@/lib/seo/project-content-validator";
import { assertProjectContentNotTooSimilar } from "@/lib/seo/project-uniqueness";
import {
  generateProjectPlanWithGemini,
  writeProjectSectionWithGemini,
} from "@/lib/cms/project-ai-gemini";
export type ImproveProjectInput = {
  slug: string;
  title: string;
  description: string;
  content: string;
  details: string[];
  image: string;
  imageAlt: string;
  published: boolean;
  facts: ProjectFactsJson | null;
  sections: ProjectSectionsJson | null;
  editorialStatus?: ProjectEditorialStatus;
  seoKeyword?: string | null;
  sectionIds?: string[];
  improvementBrief?: string;
};

export type ImproveProjectResult = {
  title: string;
  description: string;
  details: string[];
  content: string;
  facts: ProjectFactsJson;
  sections: ProjectSectionsJson;
  editorialStatus: ProjectEditorialStatus;
};

function demoteH1ToH2(html: string): string {
  return html
    .replace(/<h1\b([^>]*)>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>");
}

function ensurePrimaryKeywordInExecutiveSummary(
  sections: ProjectSectionsJson,
  keyword: string | null | undefined
): void {
  const kw = keyword?.trim();
  if (!kw) return;
  const opening = stripHtmlToPlainText(sections.executiveSummary).slice(0, 600);
  if (opening.toLowerCase().includes(kw.toLowerCase())) return;
  const lead = `<p>${kw}, `;
  const body = sections.executiveSummary.trim();
  if (body.startsWith("<p>")) {
    sections.executiveSummary = body.replace(/^<p>/i, lead);
  } else {
    sections.executiveSummary = `${lead}${body}</p>`;
  }
}

export async function runProjectImprove(
  input: ImproveProjectInput
): Promise<ImproveProjectResult> {
  const backfill = backfillProjectEditorFields({
    title: input.title,
    description: input.description,
    details: input.details,
    content: input.content,
    seoKeyword: input.seoKeyword,
    factsJson: input.facts ? JSON.stringify(input.facts) : null,
    sectionsJson: input.sections ? JSON.stringify(input.sections) : null,
  });

  let facts = enrichFactsWithRegionalContext({
    ...backfill.facts, ...input.facts,
    primaryKeyword: input.seoKeyword ?? backfill.facts.primaryKeyword,
  });

  const policy = resolveProjectWordCountPolicy(
    facts,
    input.editorialStatus,
    input.slug
  );
  const regional = facts.state ? getRegionalContext(facts.state) : null;

  const knowledgeContext = await buildProjectKnowledgeContext({
    topic: input.title,
    seoKeyword: facts.primaryKeyword,
    extraTerms: formatProjectFactsForPrompt(facts).slice(0, 400),
    excludeSlug: input.slug,
  });

  const plan = await generateProjectPlanWithGemini(
    buildProjectPlanPrompt(
      facts,
      regional,
      policy,
      knowledgeContext,
      input.improvementBrief
    )
  );

  let sections = input.sections ?? backfill.sections;
  if (!sections?.narrative?.length) {
    sections = createEmptySectionsJson(facts);
  }

  const preservedImages = extractInlineImagesFromHtml(input.content);
  const idsToWrite = input.sectionIds?.length
    ? sections.narrative
        .filter((s) => input.sectionIds!.includes(s.id))
        .map((s) => s.id)
    : ["executiveSummary", ...sections.narrative.map((s) => s.id)];

  let composedSoFar = "";

  if (idsToWrite.includes("executiveSummary")) {
    sections.executiveSummary = await writeProjectSectionWithGemini(
      buildProjectSectionPrompt(
        "executiveSummary",
        "Executive summary",
        facts,
        regional,
        policy,
        plan,
        knowledgeContext,
        { preservedImageUrls: preservedImages }
      )
    );
    composedSoFar += sections.executiveSummary;
  }

  for (const section of sections.narrative) {
    if (!idsToWrite.includes(section.id)) continue;
    if (section.id === "peers" && policy.tier === "compact") {
      section.bodyHtml = await writeProjectSectionWithGemini(
        buildProjectSectionPrompt(
          "peers",
          section.heading,
          facts,
          regional,
          policy,
          plan,
          knowledgeContext,
          {
            preservedImageUrls: preservedImages,
            previousHtml: composedSoFar,
          }
        )
      );
    } else {
      section.bodyHtml = await writeProjectSectionWithGemini(
        buildProjectSectionPrompt(
          section.id as import("@/lib/cms/project-facts-types").ProjectNarrativeSectionId,
          section.heading,
          facts,
          regional,
          policy,
          plan,
          knowledgeContext,
          {
            preservedImageUrls: preservedImages,
            previousHtml: composedSoFar,
          }
        )
      );
    }
    composedSoFar += section.bodyHtml;
  }

  ensurePrimaryKeywordInExecutiveSummary(
    sections,
    facts.primaryKeyword ?? input.seoKeyword
  );

  let content = composeProjectContent(facts, sections, {
    preservedInlineImages: preservedImages,
  });
  content = demoteH1ToH2(content);

  const details = buildDetailsFromFacts(facts);
  const description = plan.description || input.description;

  const validationInput = {
    title: input.title,
    description,
    content,
    details,
    facts,
    editorialStatus: "editorial_v2" as const,
    slug: input.slug,
    seoKeyword: facts.primaryKeyword ?? input.seoKeyword,
    previousWordCount: input.content
      ? input.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length
      : undefined,
  };

  const maxExpandPasses = 2;
  for (let pass = 0; pass < maxExpandPasses; pass++) {
    const check = validateGeneratedProject(validationInput);
    if (check.ok) break;

    const shortOnly =
      check.issues.length === 1 &&
      check.issues[0].includes("too short");
    if (!shortOnly) break;

    const wordCount = stripHtmlToPlainText(content)
      .split(/\s+/)
      .filter(Boolean).length;
    console.warn(
      `Project draft too short (${wordCount}/${policy.publishMin}), expand pass ${pass + 1}/${maxExpandPasses}`
    );

    const expandedHtml = await expandShortProjectContent({
      content,
      title: input.title,
      facts,
      regional,
      policy,
      knowledgeContext,
      seoKeyword: facts.primaryKeyword ?? input.seoKeyword,
    });

    sections = parseProjectContentToSections(expandedHtml, facts);
    ensurePrimaryKeywordInExecutiveSummary(
      sections,
      facts.primaryKeyword ?? input.seoKeyword
    );
    content = composeProjectContent(facts, sections, {
      preservedInlineImages: preservedImages,
    });
    content = demoteH1ToH2(content);
    validationInput.content = content;
  }

  assertGeneratedProjectValid(validationInput);

  await assertProjectContentNotTooSimilar({
    title: input.title,
    description,
    content,
    slug: input.slug,
  });

  void countNarrativeWords(sections);

  return {
    title: input.title,
    description,
    details,
    content,
    facts,
    sections,
    editorialStatus: "editorial_v2",
  };
}

export type { ProjectContentPlan };
