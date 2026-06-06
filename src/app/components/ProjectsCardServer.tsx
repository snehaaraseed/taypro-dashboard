import {
  enrichProjectsForGrid,
  getFilteredFileProjects,
  getStateLandingProjects,
} from "@/lib/cms/projectService";
import type { ProjectListFilter } from "@/lib/cms/projectService";
import ProjectsCard from "./ProjectsCard";
import type { ProjectGridItem } from "@/lib/cms/project-card-display";
import type { ProjectsGridLayout } from "@/lib/cms/project-card-display";
import { projects } from "../data";

interface ProjectsCardServerProps extends ProjectsGridLayout {
  showHeader?: boolean;
  headerText?: React.ReactNode;
  projects?: ProjectGridItem[];
  useFileProjects?: boolean;
  filter?: ProjectListFilter;
  featuredSlugs?: string[];
  limit?: number;
  locale?: string;
  backgroundClassName?: string;
}

function normalizeStaticProjects(projectsData: typeof projects): ProjectGridItem[] {
  return projectsData.map((project) => {
    const detailsValue = project.details;
    const details = Array.isArray(detailsValue)
      ? detailsValue
      : typeof detailsValue === "string"
        ? detailsValue.split(", ").filter(Boolean)
        : [];

    return {
      id: project.href.replace(/^\/projects\//, "") || project.title,
      img: project.img,
      title: project.title,
      href: project.href,
      details,
    };
  });
}

export default async function ProjectsCardServer({
  showHeader = false,
  headerText,
  projects: providedProjects,
  useFileProjects = false,
  filter,
  featuredSlugs,
  limit,
  locale,
  featuredFirst = false,
  columns = 2,
  backgroundClassName,
}: ProjectsCardServerProps) {
  let displayProjects: ProjectGridItem[] = providedProjects || [];

  if (useFileProjects && !providedProjects) {
    const cardLimit = limit ?? (filter ? 6 : 6);
    const fileProjects =
      featuredSlugs && featuredSlugs.length > 0
        ? await getStateLandingProjects(
            featuredSlugs,
            filter ?? {},
            locale,
            cardLimit
          )
        : await getFilteredFileProjects(filter ?? {}, locale, cardLimit);
    displayProjects = await enrichProjectsForGrid(fileProjects, locale);
  } else if (!providedProjects && !useFileProjects) {
    displayProjects = normalizeStaticProjects(projects);
  }

  return (
    <ProjectsCard
      showHeader={showHeader}
      headerText={headerText}
      projects={displayProjects}
      featuredFirst={featuredFirst}
      columns={columns}
      backgroundClassName={backgroundClassName}
    />
  );
}
