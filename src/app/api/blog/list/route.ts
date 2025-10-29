import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export interface DynamicBlog {
  title: string;
  description: string;
  featuredImage: string;
  author: string;
  slug: string;
  publishDate: string;
  href: string;
  source: "file" | "database";
  id?: string;
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

        blogs.push({
          ...metadata,
          href: `/blog/${dir.name}`,
          source: "file",
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Backend returned non-JSON response for blog list");
      return [];
    }

    if (!response.ok) {
      console.error(`Failed to fetch database blogs: ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      console.error("Invalid response format from backend");
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
      href: `/blog/${blog.slug}`, // ✅ Use slug-based URL
      source: "database",
      id: blog._id,
    }));
  } catch (error) {
    console.error("Error fetching database blogs:", error);
    return [];
  }
}

export async function GET() {
  try {
    const [fileBlogs, dbBlogs] = await Promise.all([
      getFileBlogs(),
      getDatabaseBlogs(),
    ]);

    const allBlogs = [...fileBlogs, ...dbBlogs].sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

    return NextResponse.json({ blogs: allBlogs });
  } catch (error) {
    console.error("Error in GET /api/blog/list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
