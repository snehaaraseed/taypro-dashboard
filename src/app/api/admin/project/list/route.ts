import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../utils/auth";
import { readProjectMetadata } from "../../../../utils/projectFileUtils";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  // Check authentication
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const projectsDir = path.join(process.cwd(), "src", "app", "projects");
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });

    const projects = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          try {
            const metadata = await readProjectMetadata(entry.name);
            if (!metadata) return null;

            return {
              slug: metadata.slug,
              title: metadata.title,
              image: metadata.image,
              details: metadata.details,
              date: metadata.date,
              href: `/projects/${metadata.slug}`,
              published: metadata.published !== undefined ? metadata.published : true,
            };
          } catch (error) {
            console.error(`Error reading project ${entry.name}:`, error);
            return null;
          }
        })
    );

    // Filter out nulls and sort by date (newest first)
    const validProjects = projects
      .filter((p) => p !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      projects: validProjects,
    });
  } catch (error) {
    console.error("Error listing projects:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list projects",
      },
      { status: 500 }
    );
  }
}

