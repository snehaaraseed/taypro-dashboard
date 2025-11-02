import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../utils/auth";
import { getAllFileProjects } from "../../../../utils/projectFileUtils";

export async function GET(request: NextRequest) {
  // Check authentication
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const projects = await getAllFileProjects();

    return NextResponse.json({
      success: true,
      projects: projects.map((p) => ({
        slug: p.id,
        title: p.title,
        image: p.img,
        details: p.details,
        date: p.date,
        href: p.href,
      })),
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

