import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../utils/auth";
import { getStoredAuthors, upsertAuthor } from "../../../utils/blogAuthorsStore";

export async function GET(request: NextRequest) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  const authors = await getStoredAuthors();
  return NextResponse.json({ authors });
}

export async function POST(request: NextRequest) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const { name, role, bio, avatarUrl, slug } = await request.json();
    if (!name || !role || !bio) {
      return NextResponse.json(
        { error: "Name, role, and bio are required" },
        { status: 400 }
      );
    }

    const authors = await upsertAuthor({ name, role, bio, avatarUrl, slug });
    return NextResponse.json({ success: true, authors });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

