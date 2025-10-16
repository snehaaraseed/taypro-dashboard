import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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

    const slug = createSlug(title);
    const blogDir = path.join(process.cwd(), "src", "app", "blog", slug); //folder name

    // Check if blog already exists
    try {
      await fs.access(blogDir);
      return NextResponse.json(
        { error: "Blog with this title already exists" },
        { status: 409 }
      );
    } catch (error) {
      console.log(error);
    }

    // Create directory
    await fs.mkdir(blogDir, { recursive: true }); //creates folder

    // Create page.tsx content
    const pageContent = `import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${title} - Taypro Blog",
  description: "${description}",
  keywords: "solar panel cleaning, maintenance, taypro, solar energy, cleaning robots",
  openGraph: {
    title: "${title} - Taypro Blog",
    description: "${description}",
    url: \`https://yourdomain.com/blog/${slug}\`,
    type: "article",
    images: ${featuredImage ? `["${featuredImage}"]` : "[]"},
  },
};

export default function BlogPost() {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "${title}", href: "" },
  ];

  const publishDate = "${new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}";

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      {/* Hero Section with Featured Image */}
      <section className="w-full pt-20 pb-10 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          ${
            featuredImage
              ? `
          {/* Featured Image */}
          <div className="relative w-full h-96 mb-8 overflow-hidden">
            <Image
              src="${featuredImage}"
              alt="${title}"
              fill
              className="object-cover"
              priority
            />
          </div>`
              : ""
          }

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-semibold text-[#052638] mb-4 leading-tight">
              ${title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm mb-6">
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                {publishDate}
              </span>

              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                ${author}
              </span>
            </div>

            <h2 className="text-lg text-gray-700 leading-relaxed">
              ${description}
            </h2>
          </header>
        </div>
      </section>

      {/* Main Content */}
      <article className="w-full pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div
            className="prose prose-lg max-w-none space-y-5
             prose-headings:text-[#052638]
             prose-headings:font-semibold
             prose-p:text-gray-700
             prose-p:leading-relaxed
             prose-a:text-blue-600
             prose-a:hover:text-blue-800
             prose-strong:text-[#052638]
             prose-ul:text-gray-700
             prose-ol:text-gray-700
             prose-li:text-gray-700
             prose-blockquote:border-l-4
             prose-blockquote:border-blue-500
             prose-blockquote:pl-4
             prose-blockquote:italic
             prose-code:bg-gray-100
             prose-code:px-2
             prose-code:py-1
             prose-code:rounded"
            dangerouslySetInnerHTML={{ __html: \`${content.replace(
              /`/g,
              "\\`"
            )}\` }}
          />
        </div>
      </article>
    </>
  );
}`;

    // Write the page.tsx file
    await fs.writeFile(path.join(blogDir, "page.tsx"), pageContent);

    // Also create a metadata file for easier retrieval
    const metadataContent = JSON.stringify(
      {
        title,
        description,
        featuredImage,
        author,
        slug,
        publishDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      null,
      2
    );

    await fs.writeFile(path.join(blogDir, "metadata.json"), metadataContent);

    return NextResponse.json({
      message: "Blog created successfully",
      slug,
      url: `/blog/${slug}`,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
