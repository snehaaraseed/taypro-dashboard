import { promises as fs } from "fs";
import path from "path";
import { DynamicBlog } from "../api/blog/list/route";

// Fetch all blogs for similar blogs section (shared utility)
export async function getAllBlogsForSimilar(): Promise<DynamicBlog[]> {
  try {
    const [fileBlogs, dbBlogs] = await Promise.all([
      getFileBlogs(),
      getDatabaseBlogs(),
    ]);

    const allBlogs = [...fileBlogs, ...dbBlogs].sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

    return allBlogs;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

async function getFileBlogs(): Promise<DynamicBlog[]> {
  try {
    const blogDir = path.join(process.cwd(), "src", "app", "blog");
    const entries = await fs.readdir(blogDir, { withFileTypes: true });

    const blogDirs = entries.filter(
      (entry) =>
        entry.isDirectory() &&
        !["components", "api", "[slug]", "add", "db"].includes(entry.name)
    );

    const blogs: DynamicBlog[] = [];

    for (const dir of blogDirs) {
      try {
        const metadataPath = path.join(blogDir, dir.name, "metadata.json");
        const metadataContent = await fs.readFile(metadataPath, "utf-8");
        const metadata = JSON.parse(metadataContent);

        if (metadata.published === false) {
          continue;
        }

        blogs.push({
          ...metadata,
          href: `/blog/${dir.name}`,
          source: "file",
        });
      } catch (error) {
        console.warn(`No metadata found for blog: ${dir.name}`);
      }
    }

    return blogs;
  } catch (error) {
    console.error("Error fetching file blogs:", error);
    return [];
  }
}

async function getDatabaseBlogs(): Promise<DynamicBlog[]> {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "https://console.taypro.in";
    const fullUrl = `${backendUrl}/api/v1/blogposts`;

    const response = await fetch(fullUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }

    interface DatabaseBlog {
      _id: string;
      title: string;
      description: string;
      featuredImage: string;
      author: string;
      slug: string;
      publishDate: string;
    }

    return (data.data as DatabaseBlog[]).map((blog) => ({
      title: blog.title,
      description: blog.description,
      featuredImage: blog.featuredImage,
      author: blog.author,
      slug: blog.slug,
      publishDate: blog.publishDate,
      href: `/blog/${blog.slug}`,
      source: "database",
      id: blog._id,
    }));
  } catch (error) {
    console.error("Error fetching database blogs:", error);
    return [];
  }
}
