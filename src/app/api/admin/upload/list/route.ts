import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../utils/auth";
import { listUploads } from "@/lib/cms/uploadService";

export async function GET(request: NextRequest) {
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const images = await listUploads(3000);
    return NextResponse.json({
      success: true,
      images,
    });
  } catch (error) {
    console.error("Error listing images:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list images",
      },
      { status: 500 }
    );
  }
}
