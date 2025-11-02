import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://console.taypro.in";

// Helper function to escape strings for template literals
function escapeForTemplate(str) {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\${/g, "\\${")
    .replace(/\n/g, "\\n");
}

// Generate page.tsx file content for a blog
function generatePageTSX(metadata, content) {
  const publishDate = new Date(metadata.publishDate);
  const publishDateFormatted = publishDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

export const metadata: Metadata = {
  title: ${JSON.stringify(metadata.title + " - Taypro Blog")},
  description: ${JSON.stringify(metadata.description)},
  keywords:
    "solar panel cleaning, maintenance, taypro, solar energy, cleaning robots",
  openGraph: {
    title: ${JSON.stringify(metadata.title + " - Taypro Blog")},
    description: ${JSON.stringify(metadata.description)},
    url: \`https://taypro.in/blog/${slugEscaped}\`,
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
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                ${authorEscaped}
              </span>
            </div>
          </header>
        </div>
      </section>

      {/* Article Content */}
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
        </div>
      </article>
    </>
  );
}
`;
}

// Create slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Fetch all blogs from database
async function fetchDatabaseBlogs() {
  try {
    console.log(`📡 Fetching blogs from ${BACKEND_URL}/api/v1/blogposts`);
    const response = await fetch(`${BACKEND_URL}/api/v1/blogposts`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blogs: ${response.status}`);
    }

    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error("Invalid response format");
    }

    console.log(`✅ Found ${data.data.length} blogs in database`);
    return data.data;
  } catch (error) {
    console.error("❌ Error fetching database blogs:", error.message);
    throw error;
  }
}

// Fetch full blog content by slug
async function fetchBlogContent(slug) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/blogposts/slug/${slug}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blog content: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`❌ Error fetching blog content for ${slug}:`, error.message);
    throw error;
  }
}

// Migrate a single blog
async function migrateBlog(blog) {
  try {
    // CRITICAL: Use the exact slug from database to preserve SEO/URLs
    if (!blog.slug) {
      console.log(`⚠️  Skipping "${blog.title}" - no slug found`);
      return { success: false, slug: null, reason: "no_slug" };
    }

    const slug = blog.slug; // Use exact slug from database, don't regenerate
    const blogDir = path.join(projectRoot, "src", "app", "blog", slug);

    // Check if blog already exists
    try {
      await fs.access(blogDir);
      console.log(`⏭️  Skipping "${blog.title}" - already exists at ${slug}`);
      return { success: false, slug, reason: "already_exists" };
    } catch {
      // Directory doesn't exist, continue with migration
    }

    // Fetch full content using the exact slug
    console.log(`📥 Fetching full content for "${blog.title}" (slug: ${slug})...`);
    const fullBlog = await fetchBlogContent(slug);

    // Create directory
    await fs.mkdir(blogDir, { recursive: true });

    // Prepare metadata - use exact values from database to preserve SEO
    const metadata = {
      title: fullBlog?.title || blog.title,
      description: fullBlog?.description || blog.description || "",
      featuredImage: fullBlog?.featuredImage || blog.featuredImage || "",
      author: fullBlog?.author || blog.author || "Taypro Team",
      slug: slug, // CRITICAL: Use exact slug from database
      publishDate: fullBlog?.publishDate || blog.publishDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      published: true, // All migrated blogs are published
    };

    // Get content (try from fullBlog first, then from blog)
    const content = fullBlog?.content || blog.content || "";

    if (!content) {
      console.log(`⚠️  Warning: No content found for "${blog.title}"`);
    }

    // Write metadata.json
    const metadataPath = path.join(blogDir, "metadata.json");
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");

    // Generate and write page.tsx
    const pageContent = generatePageTSX(metadata, content);
    const pagePath = path.join(blogDir, "page.tsx");
    await fs.writeFile(pagePath, pageContent, "utf-8");

    console.log(`✅ Migrated "${blog.title}" → ${slug}`);
    return { success: true, slug };
  } catch (error) {
    console.error(`❌ Error migrating blog "${blog.title}":`, error.message);
    return { success: false, slug: blog.slug, error: error.message };
  }
}

// Main migration function
async function main() {
  console.log("🚀 Starting database blog migration...\n");

  try {
    // Fetch all blogs
    const blogs = await fetchDatabaseBlogs();

    if (blogs.length === 0) {
      console.log("ℹ️  No blogs to migrate.");
      return;
    }

    console.log(`\n📝 Migrating ${blogs.length} blogs...\n`);

    const results = {
      success: [],
      skipped: [],
      failed: [],
    };

    // Migrate each blog
    for (let i = 0; i < blogs.length; i++) {
      const blog = blogs[i];
      console.log(`[${i + 1}/${blogs.length}] Processing "${blog.title}"...`);

      // Add a small delay to avoid overwhelming the API
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const result = await migrateBlog(blog);
      if (result.success) {
        results.success.push(result.slug);
      } else if (result.reason === "already_exists") {
        results.skipped.push(result.slug);
      } else {
        results.failed.push({ slug: result.slug, error: result.error });
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary");
    console.log("=".repeat(60));
    console.log(`✅ Successfully migrated: ${results.success.length}`);
    console.log(`⏭️  Skipped (already exists): ${results.skipped.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);

    if (results.success.length > 0) {
      console.log("\n✅ Successfully migrated blogs:");
      results.success.forEach((slug) => console.log(`   - ${slug}`));
    }

    if (results.skipped.length > 0) {
      console.log("\n⏭️  Skipped blogs (already exist):");
      results.skipped.forEach((slug) => console.log(`   - ${slug}`));
    }

    if (results.failed.length > 0) {
      console.log("\n❌ Failed migrations:");
      results.failed.forEach(({ slug, error }) =>
        console.log(`   - ${slug}: ${error}`)
      );
    }

    console.log("\n✨ Migration complete!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    process.exit(1);
  }
}

// Run migration
main().catch(console.error);

