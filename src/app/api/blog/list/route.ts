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
}

export async function GET() {
  try {
    const blogDir = path.join(process.cwd(), "src", "app", "blog");

    // Read all directories in the blog folder
    const entries = await fs.readdir(blogDir, { withFileTypes: true });

    // Filter for directories and exclude known non-blog directories
    const blogDirs = entries.filter(
      (entry) =>
        entry.isDirectory() &&
        !["components", "api", "[slug]"].includes(entry.name)
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
        });
      } catch (error) {
        console.warn(`No metadata found for blog: ${dir.name}`);
      }
    }

    // Sort by creation date (newest first)
    blogs.sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

    return NextResponse.json({ blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
