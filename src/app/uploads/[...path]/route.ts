import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { resolvePathInsideRoot } from "@/lib/security";

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

    const uploadsRoot = path.join(getDeploymentRoot(), "public", "uploads");
    const fullPath = resolvePathInsideRoot(uploadsRoot, filePath);

    if (!fullPath || !existsSync(fullPath)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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
    ".ico": "image/x-icon",
  };
  return contentTypes[ext] || "application/octet-stream";
}
