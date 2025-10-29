import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "https://console.taypro.in";
    const fullUrl = `${backendUrl}/api/v1/blogposts/slug/${slug}`;

    const response = await fetch(fullUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Blog not found: ${response.status}`);
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      blog: data.data,
      source: "database",
    });
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
