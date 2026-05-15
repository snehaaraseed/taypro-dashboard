import { NextRequest, NextResponse } from "next/server";
import { revalidateSitemap } from "@/lib/seo/revalidate-sitemap";
import { requireAuth } from "../../../../utils/auth";
import { deleteAuthor } from "../../../../utils/blogAuthorsStore";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const { slug } = await params;
    const authors = await deleteAuthor(slug);
    revalidateSitemap();
    return NextResponse.json({ success: true, authors });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

