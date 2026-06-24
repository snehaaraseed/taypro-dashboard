import "server-only";

export interface ProjectMetadata {
  /** Site descriptor (location, MW) — editable in admin. */
  title: string;
  /** Star codename, e.g. Vega; auto-assigned on create. */
  codename?: string | null;
  /** Composed public title: Project {codename} — {title} */
  displayTitle: string;
  description: string;
  image: string;
  imageAlt?: string;
  details: string[];
  slug: string;
  date: string;
  createdAt: string;
  updatedAt?: string;
  published?: boolean;
  author?: string;
}

export interface ProjectData {
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  details: string[];
  date?: string;
  content?: string;
  published?: boolean;
  author?: string;
}

export {
  createSlug,
  createProjectFiles,
  updateProjectFiles,
  deleteProjectFiles,
  getAllFileProjects,
  getFilteredFileProjects,
  getRelatedFileProjects,
  readProjectMetadata,
  readProjectContent,
} from "@/lib/cms/projectService";
