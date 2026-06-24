import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../utils/auth";
import { listAllProjects } from "@/lib/cms/projectService";

export async function GET(request: NextRequest) {
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const metadataList = await listAllProjects(true);
    const validProjects = metadataList
      .map((metadata) => ({
        slug: metadata.slug,
        title: metadata.title,
        codename: metadata.codename ?? null,
        displayTitle: metadata.displayTitle,
        image: metadata.image,
        details: metadata.details,
        date: metadata.date,
        updatedAt: metadata.updatedAt,
        href: `/projects/${metadata.slug}`,
        published: metadata.published !== undefined ? metadata.published : true,
      }))
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
