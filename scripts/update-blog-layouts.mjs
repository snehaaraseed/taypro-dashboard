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

// Extract content from dangerouslySetInnerHTML or BlogContent
function extractContent(fileContent) {
  // Try to find dangerouslySetInnerHTML content
  const dangerouslyMatch = fileContent.match(
    /dangerouslySetInnerHTML=\{\{\s*__html:\s*`([\s\S]*?)`\s*\}\}/
  );
  if (dangerouslyMatch) {
    return { type: "dangerouslySetInnerHTML", content: dangerouslyMatch[1] };
  }

  // Try to find BlogContent component
  const blogContentMatch = fileContent.match(
    /<BlogContent[\s\S]*?content=\{(.*?)\}[\s\S]*?\/>/
  );
  if (blogContentMatch) {
    return { type: "BlogContent", content: blogContentMatch[1] };
  }

  // Try to find article content
  const articleMatch = fileContent.match(/<article[^>]*>([\s\S]*?)<\/article>/);
  if (articleMatch) {
    return { type: "article", content: articleMatch[1] };
  }

  return null;
}

// Update a blog page file
async function updateBlogPage(filePath, slug) {
  try {
    const content = await fs.readFile(filePath, "utf-8");

    // Skip if already updated (has SimilarBlogs import)
    if (content.includes("SimilarBlogs")) {
      console.log(`⏭️  Skipping ${slug} - already updated`);
      return false;
    }

    // Extract the content type
    const extractedContent = extractContent(content);
    if (!extractedContent) {
      console.log(`⚠️  Could not extract content for ${slug}`);
      return false;
    }

    // Check if it uses BlogContent or dangerouslySetInnerHTML
    const usesBlogContent = content.includes("BlogContent");
    const usesDangerouslySetInnerHTML = content.includes("dangerouslySetInnerHTML");

    // Update imports
    let updatedContent = content;

    // Add Link import if not present
    if (!updatedContent.includes("import Link from")) {
      if (updatedContent.includes('import Image from "next/image"')) {
        updatedContent = updatedContent.replace(
          /import Image from "next\/image";/,
          'import Image from "next/image";\nimport Link from "next/link";'
        );
      } else {
        // If no Image import, add both after first import
        const firstImportMatch = updatedContent.match(/^import .+ from .+;/m);
        if (firstImportMatch) {
          updatedContent = updatedContent.replace(
            firstImportMatch[0],
            firstImportMatch[0] + '\nimport Image from "next/image";\nimport Link from "next/link";'
          );
        }
      }
    }

    // Add SimilarBlogs and getAllBlogsForSimilar imports
    if (!updatedContent.includes("SimilarBlogs")) {
      const breadcrumbsImport = updatedContent.match(/import.*Breadcrumbs.*from.*;/);
      if (breadcrumbsImport) {
        updatedContent = updatedContent.replace(
          breadcrumbsImport[0],
          breadcrumbsImport[0] + '\nimport { SimilarBlogs } from "../../components/SimilarBlogs";\nimport { getAllBlogsForSimilar } from "../../utils/blogUtils";'
        );
      } else {
        // Find any import and add after it
        const firstImportMatch = updatedContent.match(/^import .+ from .+;/m);
        if (firstImportMatch) {
          updatedContent = updatedContent.replace(
            firstImportMatch[0],
            firstImportMatch[0] + '\nimport { SimilarBlogs } from "../../components/SimilarBlogs";\nimport { getAllBlogsForSimilar } from "../../utils/blogUtils";'
          );
        }
      }
    }

    // Make function async and add getAllBlogsForSimilar call
    if (!updatedContent.includes("getAllBlogsForSimilar")) {
      // Check if function is already async
      if (updatedContent.includes("export default async function")) {
        // Add the calls after the opening brace
        updatedContent = updatedContent.replace(
          /export default async function BlogPost\(\) \{/,
          `export default async function BlogPost() {
  const allBlogs = await getAllBlogsForSimilar();
  const currentSlug = "${slug}";`
        );
      } else {
        // Make it async and add the calls
        updatedContent = updatedContent.replace(
          /export default function BlogPost\(\) \{/,
          `export default async function BlogPost() {
  const allBlogs = await getAllBlogsForSimilar();
  const currentSlug = "${slug}";`
        );
      }
    }

    // Update the main content section
    // Replace old layout with new 2-column layout
    // Escape backticks in content for template literal
    let contentSection = extractedContent.content.replace(/`/g, '\\`').replace(/\${/g, '\\${');
    
    const newLayout = `{/* Main Content with Similar Blogs Sidebar */}
      <article className="w-full pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Blog Content */}
            <div className="flex-1 lg:max-w-3xl">
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
                  __html: \`${contentSection}\`,
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
            </div>

            {/* Similar Blogs Sidebar */}
            <SimilarBlogs blogs={allBlogs} currentSlug={currentSlug} />
          </div>
        </div>
      </article>`;

    // Match the entire article section with max-w-4xl
    // Use a more flexible pattern that captures everything between article tags
    const articlePattern = /(\{\/\* Main Content \*\/\}\s*)?<article className="w-full pb-20 bg-white">([\s\S]*?)<\/article>/;
    
    const match = updatedContent.match(articlePattern);
    if (match && match[0].includes('max-w-4xl')) {
      updatedContent = updatedContent.replace(articlePattern, newLayout);
    } else {
      console.log(`⚠️  Could not find article pattern with max-w-4xl in ${slug}`);
      return false;
    }

    // Write the updated content
    await fs.writeFile(filePath, updatedContent, "utf-8");
    console.log(`✅ Updated ${slug}`);
    return true;
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

      try {
        await fs.access(pagePath);
        const slug = dir.name;
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

