import { NextRequest, NextResponse } from "next/server";
import { readBlogMetadata, readBlogContent } from "../../../../utils/blogFileUtils";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    // Fetch from file system only (database blogs have been migrated)
    const metadataResult = await readBlogMetadata(slug);
    const contentResult = await readBlogContent(slug);

    if (!metadataResult.success || !metadataResult.metadata) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Check if blog is published
    if (metadataResult.metadata.published === false) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      blog: {
        ...metadataResult.metadata,
        content: contentResult.content || "",
      },
      source: "file",
    });
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
