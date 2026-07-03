import { NextRequest, NextResponse } from "next/server";
import { revalidatePublicContent } from "@/lib/seo/revalidate-public-content";
import { requireAuth } from "../../../utils/auth";
import { normalizeLinkedInUrl } from "../../../data/blogAuthors";
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
    const body = await request.json();
    const { name, role, bio, avatarUrl, slug, previousSlug, expertiseTags } = body;
    let { linkedInUrl } = body;

    if (!name || !role || !bio) {
      return NextResponse.json(
        { error: "Name, role, and bio are required" },
        { status: 400 }
      );
    }

    const rawLinkedIn =
      typeof linkedInUrl === "string" ? linkedInUrl.trim() : "";
    if (rawLinkedIn) {
      const normalized = normalizeLinkedInUrl(rawLinkedIn);
      if (!normalized) {
        return NextResponse.json(
          {
            error:
              "Invalid LinkedIn URL. Use a full https link on linkedin.com (e.g. https://www.linkedin.com/in/your-profile).",
          },
          { status: 400 }
        );
      }
      linkedInUrl = normalized;
    } else {
      linkedInUrl = undefined;
    }

    const { authors, propagated, slugChange } = await upsertAuthor({
      name,
      role,
      bio,
      avatarUrl,
      linkedInUrl,
      slug,
      previousSlug:
        typeof previousSlug === "string" ? previousSlug : undefined,
      expertiseTags: Array.isArray(expertiseTags) ? expertiseTags : undefined,
    });
    if (slugChange) {
      await revalidatePublicContent(
        [
          `/blog/author/${slugChange.from}`,
          `/blog/author/${slugChange.to}`,
          "/authors",
        ],
        { sitemap: true }
      );
    } else {
      await revalidatePublicContent([], { sitemap: true });
    }
    return NextResponse.json({ success: true, authors, propagated, slugChange });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

