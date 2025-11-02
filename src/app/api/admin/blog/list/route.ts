import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../utils/auth";
import { promises as fs } from "fs";
import path from "path";
import { BlogMetadata } from "../../../../utils/blogFileUtils";

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

    // All blogs are now file-based (database blogs have been migrated)
    const allBlogs = fileBlogs;

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

