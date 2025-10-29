import { NextRequest, NextResponse } from "next/server";

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, featuredImage, author, content } =
      await request.json();

    if (!title || !description || !content) {
      return NextResponse.json(
        { error: "Title, description, and content are required" },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "https://console.taypro.in";
    const fullUrl = `${backendUrl}/api/v1/blogposts`;

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        featuredImage: featuredImage || "",
        author: author || "Taypro Team",
        content,
      }),
    });

    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("❌ Backend returned non-JSON response:");
      console.error("Response preview:", textResponse.substring(0, 500));

      return NextResponse.json(
        { error: "Backend server error - not returning JSON" },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to create blog" },
        { status: response.status }
      );
    }

    // ✅ Get slug from backend or generate from title
    const slug = data.data?.slug || createSlug(title);
    const redirectUrl = `/blog/${slug}`; // ✅ Use slug-based URL

    return NextResponse.json({
      success: true,
      message: "Blog created successfully",
      id: data.data?._id || data.data?.id,
      slug: slug,
      url: redirectUrl,
    });
  } catch (error) {
    console.error("❌ Error in /api/blog/create:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        { error: "Cannot connect to backend server" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: `Server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
