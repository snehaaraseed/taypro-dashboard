import "server-only";

import { readProjectFull, updateProjectFiles } from "@/lib/cms/projectService";
import type { ProjectEditorialStatus } from "@/lib/cms/project-facts-types";
import { runProjectImprove } from "@/lib/cms/run-project-improve";
import { revalidatePublicContent } from "@/lib/seo/revalidate-public-content";
import { translatePublishedProject } from "@/lib/translation/translate-cms";

export type ApplyProjectImproveOptions = {
  sectionIds?: string[];
  improvementBrief?: string;
  /** When true, refresh target locales after improve (default false for automation). */
  retranslate?: boolean;
};

export type ApplyProjectImproveResult = {
  slug: string;
  updatedAt: string;
  editorialStatus: ProjectEditorialStatus;
};

/** Load project, run Gemini improve, persist, optionally retranslate, revalidate. */
export async function applyProjectImprove(
  slug: string,
  options?: ApplyProjectImproveOptions
): Promise<ApplyProjectImproveResult> {
  const project = await readProjectFull(slug);
  if (!project) {
    throw new Error(`Project not found: ${slug}`);
  }

  const improved = await runProjectImprove({
    slug,
    title: project.title,
    description: project.description,
    content: project.content,
    details: project.details,
    image: project.image,
    imageAlt: project.imageAlt ?? "",
    published: project.published !== false,
    facts: project.facts,
    sections: project.sections,
    editorialStatus: project.editorialStatus,
    seoKeyword: project.seoKeyword,
    sectionIds: options?.sectionIds,
    improvementBrief: options?.improvementBrief,
  });

  const { updatedAt } = await updateProjectFiles(slug, {
    title: improved.title,
    description: improved.description,
    image: project.image,
    imageAlt: project.imageAlt,
    details: improved.details,
    content: improved.content,
    facts: improved.facts,
    sections: improved.sections,
    editorialStatus: improved.editorialStatus,
    seoKeyword: project.seoKeyword,
    published: project.published,
    author: project.author,
    date: project.date,
  });

  if (project.published && options?.retranslate === true) {
    await translatePublishedProject(slug, { force: true });
  }

  await revalidatePublicContent([`/projects/${slug}`, "/projects"], {
    sitemap: true,
  });

  return {
    slug,
    updatedAt,
    editorialStatus: improved.editorialStatus,
  };
}
