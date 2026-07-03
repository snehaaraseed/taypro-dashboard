import { NextRequest, NextResponse } from "next/server";
import { revalidatePublicContent } from "@/lib/seo/revalidate-public-content";
import { requireAuth } from "../../../../utils/auth";
import {
  createProjectFiles,
  readProjectMetadata,
  ProjectData,
} from "../../../../utils/projectFileUtils";

export async function POST(request: NextRequest) {
  // Check authentication
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const body: ProjectData = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.image) {
      return NextResponse.json(
        { error: "Title, description, and image are required" },
        { status: 400 }
      );
    }

    const { slug } = await createProjectFiles({
      ...body,
      author: body.author?.trim() || "Taypro Team",
    });

    await revalidatePublicContent([`/projects/${slug}`, "/projects"], {
      sitemap: true,
    });

    const metadata = await readProjectMetadata(slug);

    return NextResponse.json({
      success: true,
      slug,
      codename: metadata?.codename ?? null,
      displayTitle: metadata?.displayTitle,
      message: "Project created successfully",
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create project",
      },
      { status: 500 }
    );
  }
}

