import { NextResponse } from "next/server";
import { listAllBlogs } from "@/lib/cms/blogService";

export interface DynamicBlog {
  title: string;
  description: string;
  featuredImage: string;
  featuredImageAlt?: string;
  author: string;
  slug: string;
  publishDate: string;
  updatedAt?: string;
  href: string;
  source: "db" | "console";
  id?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") ?? undefined;
    const metadataList = await listAllBlogs(false, locale);
    const allBlogs: DynamicBlog[] = metadataList.map((metadata) => ({
      ...metadata,
      href: `/blog/${metadata.slug}`,
      source: "db",
    }));

    return NextResponse.json(
      { blogs: allBlogs },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error in GET /api/blog/list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
