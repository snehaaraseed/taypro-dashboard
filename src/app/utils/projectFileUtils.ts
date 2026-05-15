import "server-only";

export interface ProjectMetadata {
  title: string;
  description: string;
  image: string;
  details: string[];
  slug: string;
  date: string;
  createdAt: string;
  updatedAt?: string;
  published?: boolean;
}

export interface ProjectData {
  title: string;
  description: string;
  image: string;
  details: string[];
  date?: string;
  content?: string;
  published?: boolean;
}

export {
  createSlug,
  createProjectFiles,
  updateProjectFiles,
  deleteProjectFiles,
  getAllFileProjects,
  readProjectMetadata,
  readProjectContent,
} from "@/lib/cms/projectService";
