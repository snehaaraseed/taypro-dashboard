import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filePath = pathSegments.join("/");

    // Security: only allow safe relative paths under /public/uploads.
    if (
      !filePath ||
      filePath.includes("..") ||
      path.isAbsolute(filePath) ||
      !/^[a-zA-Z0-9/_\-.]+$/.test(filePath)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Route is /uploads/[...path], so params are relative to uploads.
    // In standalone mode, process.cwd() is .next/standalone.
    const fullPath = path.join(process.cwd(), "public", "uploads", filePath);

    // Check if file exists
    if (!existsSync(fullPath)) {
      // Try root public directory as fallback
      const rootPath = path.join(
        process.cwd(),
        "..",
        "..",
        "public",
        "uploads",
        filePath
      );
      if (existsSync(rootPath)) {
        const fileBuffer = await readFile(rootPath);
        const ext = path.extname(filePath).toLowerCase();
        const contentType = getContentType(ext);
        
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read and serve the file
    const fileBuffer = await readFile(fullPath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = getContentType(ext);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving upload file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
  };
  return contentTypes[ext] || "application/octet-stream";
}



