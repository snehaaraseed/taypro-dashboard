import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../utils/auth";
import {
  createProjectFiles,
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

    const { slug } = await createProjectFiles(body);

    return NextResponse.json({
      success: true,
      slug,
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

