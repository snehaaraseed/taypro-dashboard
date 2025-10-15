import { promises as fs } from "fs";
import path from "path";

export interface BlogMetadata {
  title: string;
  description: string;
  featuredImage: string;
  author: string;
  slug: string;
  publishDate: string;
  createdAt: string;
}

export async function getAllDynamicBlogs(): Promise<BlogMetadata[]> {
  try {
    const blogDir = path.join(process.cwd(), "src", "app", "blog");
    const entries = await fs.readdir(blogDir, { withFileTypes: true });

    const blogDirs = entries.filter(
      (entry) =>
        entry.isDirectory() &&
        !["components", "api", "[slug]", "add"].includes(entry.name)
    );

    const blogs: BlogMetadata[] = [];

    for (const dir of blogDirs) {
      try {
        const metadataPath = path.join(blogDir, dir.name, "metadata.json");
        const metadataContent = await fs.readFile(metadataPath, "utf-8");
        const metadata = JSON.parse(metadataContent);
        blogs.push(metadata);
      } catch (error) {
        console.warn(`No metadata found for blog: ${dir.name}`);
      }
    }

    return blogs.sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
