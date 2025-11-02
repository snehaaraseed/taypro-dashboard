import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, "../src/app/blog");
const EXCLUDE_DIRS = ["components", "api", "[slug]", "add", "db"];

// Get the slug from directory name
function getSlugFromPath(filePath) {
  const parts = filePath.split(path.sep);
  const blogIndex = parts.indexOf("blog");
  if (blogIndex !== -1 && blogIndex < parts.length - 1) {
    return parts[blogIndex + 1];
  }
  return null;
}

// Extract content from dangerouslySetInnerHTML
function extractContent(fileContent) {
  const dangerouslyMatch = fileContent.match(
    /dangerouslySetInnerHTML=\{\{\s*__html:\s*`([\s\S]*?)`\s*\}\}/
  );
  if (dangerouslyMatch) {
    return dangerouslyMatch[1];
  }
  return null;
}

// Update a blog page file to have full-height sidebar
async function updateBlogPage(filePath, slug) {
  try {
    const content = await fs.readFile(filePath, "utf-8");

    // Skip if already has the new layout (check for "Main Layout with Similar Blogs Sidebar")
    if (content.includes("Main Layout with Similar Blogs Sidebar")) {
      console.log(`⏭️  Skipping ${slug} - already has full-height sidebar`);
      return false;
    }

    // Extract the HTML content
    const htmlContent = extractContent(content);
    if (!htmlContent) {
      console.log(`⚠️  Could not extract content for ${slug}`);
      return false;
    }

    // Escape backticks in content for template literal
    let escapedContent = htmlContent.replace(/`/g, '\\`').replace(/\${/g, '\\${');

    // Extract hero section (featured image and header)
    const heroMatch = content.match(
      /(\{/\* Hero Section[\s\S]*?<section[\s\S]*?<div className="max-w-4xl[\s\S]*?)(\{/\* Article Header[\s\S]*?<\/header>\s*<\/div>\s*<\/section>)/m
    );

    if (!heroMatch) {
      console.log(`⚠️  Could not find hero section pattern in ${slug}`);
      return false;
    }

    const heroSection = heroMatch[0];

    // Find the featured image src
    const imageMatch = heroSection.match(/src="([^"]+)"/);
    const imageSrc = imageMatch ? imageMatch[1] : "";
    
    // Find the alt text
    const altMatch = heroSection.match(/alt="([^"]+)"/);
    const altText = altMatch ? altMatch[1] : "";

    // Find the title
    const titleMatch = heroSection.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    const title = titleMatch ? titleMatch[1].trim() : "";

    // Find publish date
    const dateMatch = heroSection.match(/<svg[\s\S]*?<\/svg>\s*([^<]+)/);
    const publishDate = dateMatch ? dateMatch[1].trim() : "";

    // Find author
    const authorMatch = heroSection.match(/(?:Taypro Team|[\s\S]*?<svg[\s\S]*?<\/svg>\s*([^<]+))(?:\s*<\/span>|<\/header>)/);
    const author = authorMatch && authorMatch[1] ? authorMatch[1].trim() : "Taypro Team";

    // Find description
    const descMatch = heroSection.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    const description = descMatch ? descMatch[1].trim() : "";

    // Build new layout - wrap everything in a single container with sidebar
    const newLayout = `{/* Main Layout with Similar Blogs Sidebar */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-20">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content Column */}
            <div className="flex-1 lg:max-w-3xl">
              {/* Hero Section with Featured Image */}
              <section className="pb-10">
                ${imageSrc ? `<div className="relative w-full h-96 mb-8 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src="${imageSrc}"
                    alt="${altText}"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>` : ''}

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
                      ${publishDate || '{publishDate}'}
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

                  ${description ? `<h2 className="text-lg text-gray-700 leading-relaxed">
                    ${description}
                  </h2>` : ''}
                </header>
              </section>

              {/* Main Content */}
              <article>
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
                  dangerouslySetInnerHTML={{
                    __html: \`${escapedContent}\`,
                  }}
                />

                {/* Back to Blog Button */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to All Blogs
                  </Link>
                </div>
              </article>
            </div>

            {/* Similar Blogs Sidebar - Full Height */}
            <SimilarBlogs blogs={allBlogs} currentSlug={currentSlug} />
          </div>
        </div>
      </div>`;

    // Replace from Breadcrumbs to end of article (before closing fragment)
    const pattern = /(<Breadcrumbs[\s\S]*?\/>)([\s\S]*?)(<\/>)/;
    const match = content.match(pattern);
    
    if (match) {
      const updated = content.replace(
        pattern,
        `$1\n\n${newLayout}\n    $3`
      );
      
      await fs.writeFile(filePath, updated, "utf-8");
      console.log(`✅ Updated ${slug} with full-height sidebar`);
      return true;
    } else {
      console.log(`⚠️  Could not find pattern to replace in ${slug}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${slug}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    const entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });
    const blogDirs = entries.filter(
      (entry) =>
        entry.isDirectory() &&
        !EXCLUDE_DIRS.includes(entry.name)
    );

    console.log(`Found ${blogDirs.length} blog directories to process\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const dir of blogDirs) {
      const blogPath = path.join(BLOG_DIR, dir.name);
      const pagePath = path.join(blogPath, "page.tsx");
      const slug = dir.name;

      try {
        await fs.access(pagePath);
        const result = await updateBlogPage(pagePath, slug);
        if (result) {
          updatedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.log(`⚠️  No page.tsx found in ${dir.name}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();

