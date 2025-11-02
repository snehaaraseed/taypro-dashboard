import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../utils/auth";
import { promises as fs } from "fs";
import path from "path";
import { BlogMetadata } from "../../../../utils/blogFileUtils";

// Fetch database blogs (including drafts) for admin
async function getDatabaseBlogs(): Promise<BlogMetadata[]> {
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
      console.warn(`Failed to fetch database blogs: ${response.status}`);
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
      published?: boolean;
      createdAt?: string;
    }

    return (data.data as DatabaseBlog[]).map((blog) => ({
      title: blog.title,
      description: blog.description,
      featuredImage: blog.featuredImage,
      author: blog.author,
      slug: blog.slug,
      publishDate: blog.publishDate,
      createdAt: blog.createdAt || blog.publishDate,
      published: blog.published !== undefined ? blog.published : true,
    }));
  } catch (error) {
    console.error("Error fetching database blogs:", error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  // Check authentication
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const blogDir = path.join(process.cwd(), "src", "app", "blog");
    const entries = await fs.readdir(blogDir, { withFileTypes: true });

    const blogDirs = entries.filter(
      (entry) =>
        entry.isDirectory() &&
        !["components", "api", "[slug]", "add", "db"].includes(entry.name)
    );

    const fileBlogs: BlogMetadata[] = [];

    // Fetch file-based blogs - INCLUDING DRAFTS (no filtering for admin)
    for (const dir of blogDirs) {
      try {
        const metadataPath = path.join(blogDir, dir.name, "metadata.json");
        const metadataContent = await fs.readFile(metadataPath, "utf-8");
        const metadata = JSON.parse(metadataContent) as BlogMetadata;
        
        // Ensure published field exists (default to true if not set for backward compatibility)
        // But keep published: false if explicitly set
        if (metadata.published === undefined) {
          metadata.published = true;
        }
        
        // IMPORTANT: Include ALL blogs including drafts for admin
        fileBlogs.push(metadata);
      } catch (error) {
        console.warn(`No metadata found for blog: ${dir.name}`, error);
      }
    }

    // Fetch database blogs (INCLUDING drafts)
    const dbBlogs = await getDatabaseBlogs();

    // Combine all blogs - both published and drafts
    const allBlogs = [...fileBlogs, ...dbBlogs];

    // Sort by publishDate descending (most recent first)
    const sortedBlogs = allBlogs.sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

    return NextResponse.json({ blogs: sortedBlogs });
  } catch (error) {
    console.error("Error in GET /api/admin/blog/list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

