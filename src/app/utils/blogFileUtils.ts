import { promises as fs } from "fs";
import path from "path";

export interface BlogMetadata {
  title: string;
  description: string;
  featuredImage: string;
  author: string;
  slug: string;
  publishDate: string;
  createdAt: string;
  /** ISO timestamp; bumped on every save. Omitted on older posts until next edit. */
  updatedAt?: string;
  published?: boolean; // Defaults to true for backward compatibility
}

export interface BlogData {
  title: string;
  description: string;
  featuredImage: string;
  author: string;
  content: string;
  publishDate?: string;
  published?: boolean; // Defaults to true for backward compatibility
}

export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Generate page.tsx file content for a blog
 */
export function generatePageTSX(
  metadata: BlogMetadata,
  content: string
): string {
  const publishDateFormatted = new Date(
    metadata.publishDate
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Escape strings for use in template literals
  const escapeForTemplate = (str: string): string => {
    return str
      .replace(/\\/g, "\\\\")
      .replace(/`/g, "\\`")
      .replace(/\${/g, "\\${")
      .replace(/\n/g, "\\n");
  };

  const titleEscaped = escapeForTemplate(metadata.title);
  const descEscaped = escapeForTemplate(metadata.description);
  const authorEscaped = escapeForTemplate(metadata.author);
  const imageEscaped = metadata.featuredImage
    ? escapeForTemplate(metadata.featuredImage)
    : "";
  const contentEscaped = escapeForTemplate(content);
  const slugEscaped = escapeForTemplate(metadata.slug);

  const imageSection = metadata.featuredImage
    ? `{/* Featured Image */}
          <div className="relative w-full h-96 mb-8 overflow-hidden rounded-lg bg-gray-100">
            <Image
              src="${imageEscaped}"
              alt="${titleEscaped}"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>`
    : "";

  return `import Image from "next/image";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { BlogContent } from "../../components/BlogContent";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: ${JSON.stringify(metadata.title + " - Taypro Blog")},
  description: ${JSON.stringify(metadata.description)},
  keywords:
    "solar panel cleaning, maintenance, taypro, solar energy, cleaning robots",
  openGraph: {
    title: ${JSON.stringify(metadata.title + " - Taypro Blog")},
    description: ${JSON.stringify(metadata.description)},
    url: \`\${siteUrl}/blog/${slugEscaped}\`,
    type: "article",
    images: ${metadata.featuredImage ? JSON.stringify([metadata.featuredImage]) : "[]"},
  },
};

export default function BlogPost() {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: ${JSON.stringify(metadata.title)}, href: "" },
  ];

  const publishDate = ${JSON.stringify(publishDateFormatted)};

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      {/* Hero Section with Featured Image */}
      <section className="w-full pt-20 pb-10 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          ${imageSection}

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-semibold text-[#052638] mb-4 leading-tight">
              ${titleEscaped}
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
                    fillRule="evenodd"
                  />
                </svg>
                ${authorEscaped}
              </span>
            </div>

            <h2 className="text-lg text-gray-700 leading-relaxed">
              ${descEscaped}
            </h2>
          </header>
        </div>
      </section>

      {/* Main Content */}
      <article className="w-full pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <BlogContent
            content={\`${contentEscaped}\`}
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
          />

          {/* Back to Blog Button */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <a
              href="/blog"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to All Blogs
            </a>
          </div>
        </div>
      </article>
    </>
  );
}
`;
}

/**
 * Create blog files (metadata.json and page.tsx)
 */
export async function createBlogFiles(
  blogData: BlogData,
  slug?: string
): Promise<{
  success: boolean;
  slug: string;
  updatedAt?: string;
  error?: string;
}> {
  try {
    const finalSlug = slug || createSlug(blogData.title);

    // Validate slug uniqueness
    const blogDir = path.join(process.cwd(), "src", "app", "blog");
    const targetDir = path.join(blogDir, finalSlug);

    // Check if directory already exists
    try {
      await fs.access(targetDir);
      return {
        success: false,
        slug: finalSlug,
        error: `Blog with slug "${finalSlug}" already exists`,
      };
    } catch {
      // Directory doesn't exist, which is what we want
    }

    // Create directory
    await fs.mkdir(targetDir, { recursive: true });

    // Prepare metadata
    const now = new Date().toISOString();
    const metadata: BlogMetadata = {
      title: blogData.title,
      description: blogData.description,
      featuredImage: blogData.featuredImage || "",
      author: blogData.author || "Taypro Team",
      slug: finalSlug,
      publishDate: blogData.publishDate || now,
      createdAt: now,
      updatedAt: now,
      published: blogData.published !== undefined ? blogData.published : true,
    };

    // Write metadata.json
    const metadataPath = path.join(targetDir, "metadata.json");
    await fs.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      "utf-8"
    );

    // Generate and write page.tsx
    const pageContent = generatePageTSX(metadata, blogData.content);
    const pagePath = path.join(targetDir, "page.tsx");
    await fs.writeFile(pagePath, pageContent, "utf-8");

    // Persist raw HTML content for reliable runtime rendering.
    const contentHtmlPath = path.join(targetDir, "content.html");
    await fs.writeFile(contentHtmlPath, blogData.content || "", "utf-8");

    return { success: true, slug: finalSlug, updatedAt: now };
  } catch (error) {
    console.error("Error creating blog files:", error);
    return {
      success: false,
      slug: slug || createSlug(blogData.title),
      error:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update blog files
 */
export async function updateBlogFiles(
  oldSlug: string,
  blogData: BlogData,
  newSlug?: string
): Promise<{
  success: boolean;
  slug: string;
  updatedAt?: string;
  error?: string;
}> {
  try {
    const blogDir = path.join(process.cwd(), "src", "app", "blog");
    const oldDir = path.join(blogDir, oldSlug);
    const finalSlug = newSlug || oldSlug;

    // Check if old directory exists
    try {
      await fs.access(oldDir);
    } catch {
      return {
        success: false,
        slug: finalSlug,
        error: `Blog with slug "${oldSlug}" does not exist`,
      };
    }

    // If slug changed, check if new slug is available
    if (finalSlug !== oldSlug) {
      const newDir = path.join(blogDir, finalSlug);
      try {
        await fs.access(newDir);
        return {
          success: false,
          slug: finalSlug,
          error: `Blog with slug "${finalSlug}" already exists`,
        };
      } catch {
        // New slug is available
      }
    }

    // Read existing metadata to preserve createdAt
    let existingMetadata: BlogMetadata | null = null;
    try {
      const metadataPath = path.join(oldDir, "metadata.json");
      const metadataContent = await fs.readFile(metadataPath, "utf-8");
      existingMetadata = JSON.parse(metadataContent);
    } catch {
      // If metadata doesn't exist, we'll create it
    }

    // Prepare updated metadata
    const now = new Date().toISOString();
    const metadata: BlogMetadata = {
      title: blogData.title,
      description: blogData.description,
      featuredImage: blogData.featuredImage || "",
      author: blogData.author || "Taypro Team",
      slug: finalSlug,
      publishDate: blogData.publishDate || existingMetadata?.publishDate || now,
      createdAt: existingMetadata?.createdAt || now,
      updatedAt: now,
      published: blogData.published !== undefined ? blogData.published : (existingMetadata?.published !== undefined ? existingMetadata.published : true),
    };

    // If slug changed, rename directory first
    if (finalSlug !== oldSlug) {
      const newDir = path.join(blogDir, finalSlug);
      await fs.rename(oldDir, newDir);
    }

    const targetDir =
      finalSlug !== oldSlug
        ? path.join(blogDir, finalSlug)
        : oldDir;

    // Update metadata.json
    const metadataPath = path.join(targetDir, "metadata.json");
    await fs.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      "utf-8"
    );

    // Update page.tsx
    const pageContent = generatePageTSX(metadata, blogData.content);
    const pagePath = path.join(targetDir, "page.tsx");
    await fs.writeFile(pagePath, pageContent, "utf-8");

    // Keep content.html in sync with the latest editor content.
    const contentHtmlPath = path.join(targetDir, "content.html");
    await fs.writeFile(contentHtmlPath, blogData.content || "", "utf-8");

    return { success: true, slug: finalSlug, updatedAt: now };
  } catch (error) {
    console.error("Error updating blog files:", error);
    return {
      success: false,
      slug: newSlug || oldSlug,
      error:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete blog files
 */
export async function deleteBlogFiles(
  slug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const blogDir = path.join(process.cwd(), "src", "app", "blog");
    const targetDir = path.join(blogDir, slug);

    // Check if directory exists
    try {
      await fs.access(targetDir);
    } catch {
      return {
        success: false,
        error: `Blog with slug "${slug}" does not exist`,
      };
    }

    // Remove directory recursively
    await fs.rm(targetDir, { recursive: true, force: true });

    return { success: true };
  } catch (error) {
    console.error("Error deleting blog files:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Read blog metadata
 */
export async function readBlogMetadata(
  slug: string
): Promise<{ success: boolean; metadata?: BlogMetadata; error?: string }> {
  try {
    const blogDir = path.join(process.cwd(), "src", "app", "blog");
    const targetDir = path.join(blogDir, slug);
    const metadataPath = path.join(targetDir, "metadata.json");

    const metadataContent = await fs.readFile(metadataPath, "utf-8");
    const metadata = JSON.parse(metadataContent) as BlogMetadata;

    return { success: true, metadata };
  } catch (error) {
    console.error("Error reading blog metadata:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Read blog HTML for admin editing. Prefer `content.html` (same source as the public
 * blog page) so the editor matches what visitors see; fall back to extracting from `page.tsx`.
 */
export async function readBlogContent(
  slug: string
): Promise<{ success: boolean; content?: string; error?: string }> {
  const blogDir = path.join(process.cwd(), "src", "app", "blog", slug);
  const contentHtmlPath = path.join(blogDir, "content.html");
  const pagePath = path.join(blogDir, "page.tsx");

  try {
    const fromHtml = await fs.readFile(contentHtmlPath, "utf-8");
    if (fromHtml.trim().length > 0) {
      return { success: true, content: fromHtml };
    }
  } catch {
    // No content.html yet — fall through to page.tsx
  }

  let pageContent: string;
  try {
    pageContent = await fs.readFile(pagePath, "utf-8");
  } catch (error) {
    console.error("Error reading blog page.tsx:", error);
    return { success: true, content: "" };
  }

  const unescapeTemplate = (raw: string) =>
    raw
      .replace(/\\n/g, "\n")
      .replace(/\\`/g, "`")
      .replace(/\\\$/g, "$")
      .replace(/\\\\/g, "\\");

  const patterns = [
    /content=\{\s*`([\s\S]*?)`\s*\}/,
    /content=\{\\?`([\s\S]*?)\\?`\}/,
    /__html:\s*`([\s\S]*?)\\\\?`\s*,\s*\}\s*\}\s*\/>/,
    /__html:\s*`([\s\S]*?)\\\\?`\s*\}\s*\}\s*\/>/,
  ];

  for (const pattern of patterns) {
    const match = pageContent.match(pattern);
    if (match?.[1]) {
      return { success: true, content: unescapeTemplate(match[1]) };
    }
  }

  const startPattern = /__html:\s*`/;
  const endPattern = /\\\`,\s*\}\s*\}\s*\/>/;
  const startMatch = pageContent.match(startPattern);
  const endMatch = pageContent.match(endPattern);
  if (
    startMatch &&
    endMatch &&
    startMatch.index !== undefined &&
    endMatch.index !== undefined
  ) {
    const startPos = startMatch.index + startMatch[0].length;
    const endPos = endMatch.index;
    const slice = pageContent.substring(startPos, endPos);
    return {
      success: true,
      content: slice
        .replace(/\\`/g, "`")
        .replace(/\\\$/g, "$")
        .replace(/\\\\/g, "\\"),
    };
  }

  const articleMatch = pageContent.match(/<article[^>]*>([\s\S]*?)<\/article>/);
  if (articleMatch?.[1]) {
    return { success: true, content: articleMatch[1] };
  }

  const innerHTMLMatch = pageContent.match(
    /dangerouslySetInnerHTML=\{\{\s*__html:\s*['"`]([\s\S]*?)['"`]\s*\}\}/
  );
  if (innerHTMLMatch?.[1]) {
    return { success: true, content: innerHTMLMatch[1] };
  }

  return { success: true, content: "" };
}

