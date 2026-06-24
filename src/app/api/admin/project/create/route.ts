import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidateSitemap } from "@/lib/seo/revalidate-sitemap";
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

    // Revalidate the new project page and projects list page immediately
    revalidatePath(`/projects/${slug}`);
    revalidatePath("/projects");
    revalidateSitemap();

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

