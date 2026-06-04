import { getFilteredFileProjects } from "@/lib/cms/projectService";
import type { ProjectListFilter } from "@/lib/cms/projectService";
import ProjectsCard from "./ProjectsCard";
import { projects } from "../data";

interface ProjectItem {
  img: string;
  title: string;
  details: string | string[];
  href: string;
}

interface ProjectsCardProps {
  showHeader?: boolean;
  headerText?: React.ReactNode;
  projects?: ProjectItem[];
  useFileProjects?: boolean;
  /** When set with `useFileProjects`, only matching CMS projects are shown (newest first). */
  filter?: ProjectListFilter;
  /** Max cards to render; defaults to 6 for filtered file projects. */
  limit?: number;
  locale?: string;
}

function normalizeProjectsData(projectsData: typeof projects): ProjectItem[] {
  return projectsData.map((p) => {
    const detailsValue = p.details;
    const detailsStr = typeof detailsValue === "string" 
      ? detailsValue 
      : Array.isArray(detailsValue) 
        ? (detailsValue as string[]).join(", ") 
        : String(detailsValue);
    return {
      ...p,
      details: detailsStr,
    };
  });
}

// Server component that can fetch file projects
export default async function ProjectsCardServer({
  showHeader = false,
  headerText,
  projects: providedProjects,
  useFileProjects = false,
  filter,
  limit,
  locale,
}: ProjectsCardProps) {
  let displayProjects: ProjectItem[] = providedProjects || [];

  if (useFileProjects && !providedProjects) {
    const cardLimit = limit ?? (filter ? 6 : 6);
    const fileProjects = await getFilteredFileProjects(
      filter ?? {},
      locale,
      cardLimit
    );
    displayProjects = fileProjects.map((p) => ({
      img: p.img,
      title: p.title,
      details: p.details,
      href: p.href,
      description: p.description,
      imageAlt: p.imageAlt,
    }));
  } else if (!providedProjects && !useFileProjects) {
    displayProjects = normalizeProjectsData(projects);
  }

  return <ProjectsCard showHeader={showHeader} headerText={headerText} projects={displayProjects} />;
}

