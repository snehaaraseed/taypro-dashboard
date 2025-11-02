import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../utils/auth";
import {
  readProjectMetadata,
  readProjectContent,
  updateProjectFiles,
  deleteProjectFiles,
  createSlug,
  ProjectData,
} from "../../../../utils/projectFileUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Check authentication
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const { slug } = await params;
    const metadata = await readProjectMetadata(slug);
    const content = await readProjectContent(slug);

    if (!metadata) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      project: {
        ...metadata,
        content,
      },
    });
  } catch (error) {
    console.error("Error reading project:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to read project",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Check authentication
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const { slug } = await params;
    const body: ProjectData & { newSlug?: string } = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.image) {
      return NextResponse.json(
        { error: "Title, description, and image are required" },
        { status: 400 }
      );
    }

    const newSlug = body.title ? createSlug(body.title) : undefined;
    const { slug: updatedSlug } = await updateProjectFiles(
      slug,
      body,
      newSlug
    );

    return NextResponse.json({
      success: true,
      slug: updatedSlug,
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update project",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Check authentication
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const { slug } = await params;
    await deleteProjectFiles(slug);

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete project",
      },
      { status: 500 }
    );
  }
}

