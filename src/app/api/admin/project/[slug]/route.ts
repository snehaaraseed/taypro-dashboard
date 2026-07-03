import { NextRequest, NextResponse } from "next/server";
import { revalidatePublicContent } from "@/lib/seo/revalidate-public-content";
import { requireAuth } from "../../../../utils/auth";
import {
  readProjectMetadata,
  readProjectContent,
  readProjectFull,
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
    const full = await readProjectFull(slug);

    if (!full) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      project: {
        ...full,
        facts: full.facts,
        sections: full.sections,
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
    const body = (await request.json()) as ProjectData & {
      newSlug?: string;
      facts?: ProjectData["facts"];
      sections?: ProjectData["sections"];
      editorialStatus?: ProjectData["editorialStatus"];
      seoKeyword?: string | null;
    };
    const { newSlug: rawNewSlug, ...projectFields } = body;

    // Validate required fields
    if (!projectFields.title || !projectFields.description || !projectFields.image) {
      return NextResponse.json(
        { error: "Title, description, and image are required" },
        { status: 400 }
      );
    }

    let renameTo: string | undefined;
    if (typeof rawNewSlug === "string" && rawNewSlug.trim() !== "") {
      const cleaned = createSlug(rawNewSlug);
      if (!cleaned) {
        return NextResponse.json(
          { error: "Invalid URL slug. Use letters, numbers, or hyphens." },
          { status: 400 }
        );
      }
      renameTo = cleaned;
    }

    const { slug: updatedSlug, updatedAt } = await updateProjectFiles(
      slug,
      projectFields,
      renameTo
    );

    const paths = ["/projects", `/projects/${updatedSlug}`];
    if (renameTo && renameTo !== slug) {
      paths.push(`/projects/${slug}`);
    }
    await revalidatePublicContent(paths, { sitemap: true });

    return NextResponse.json({
      success: true,
      slug: updatedSlug,
      updatedAt,
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

    await revalidatePublicContent([`/projects/${slug}`, "/projects"], {
      sitemap: true,
    });

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

