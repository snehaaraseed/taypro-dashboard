import { getAllFileProjects } from "../utils/projectFileUtils";
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
}: ProjectsCardProps) {
  let displayProjects: ProjectItem[] = providedProjects || [];

  if (useFileProjects && !providedProjects) {
    const fileProjects = await getAllFileProjects();
    displayProjects = fileProjects.map((p) => ({
      img: p.img,
      title: p.title,
      details: p.details,
      href: p.href,
    }));
  } else if (!providedProjects && !useFileProjects) {
    displayProjects = normalizeProjectsData(projects);
  }

  return <ProjectsCard showHeader={showHeader} headerText={headerText} projects={displayProjects} />;
}

