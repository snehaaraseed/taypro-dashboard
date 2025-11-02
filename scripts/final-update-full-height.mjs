import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, "../src/app/blog");
const EXCLUDE_DIRS = ["components", "api", "[slug]", "add", "db"];

async function updateBlogPage(filePath, slug) {
  try {
    let content = await fs.readFile(filePath, "utf-8");

    // Skip if already has merged layout
    if (content.includes("Main Layout with Similar Blogs Sidebar")) {
      console.log(`⏭️  Skipping ${slug} - already updated`);
      return false;
    }

    // Skip if doesn't have separate hero section
    if (!content.includes("Hero Section with Featured Image") && !content.includes('{/* Hero Section')) {
      console.log(`⚠️  ${slug} doesn't have separate hero section`);
      return false;
    }

    // Find the actual HTML content (innermost dangerouslySetInnerHTML)
    const contentMatches = content.matchAll(/dangerouslySetInnerHTML=\{\{\s*__html:\s*`([\s\S]*?)`\s*\}\}/g);
    let actualHtmlContent = null;
    let deepestMatch = null;
    let deepestLevel = 0;

    for (const match of contentMatches) {
      const nestedMatches = match[1].match(/dangerouslySetInnerHTML/g);
      const level = nestedMatches ? nestedMatches.length : 0;
      if (level >= deepestLevel) {
        deepestLevel = level;
        deepestMatch = match;
      }
    }

    if (deepestMatch) {
      // Extract the innermost content
      let htmlContent = deepestMatch[1];
      // If nested, extract the innermost
      while (htmlContent.includes('dangerouslySetInnerHTML')) {
        const innerMatch = htmlContent.match(/dangerouslySetInnerHTML=\{\{\s*__html:\s*`([\s\S]*?)`\s*\}\}/);
        if (innerMatch) {
          htmlContent = innerMatch[1];
        } else {
          break;
        }
      }
      actualHtmlContent = htmlContent;
    }

    if (!actualHtmlContent) {
      console.log(`⚠️  Could not extract HTML content for ${slug}`);
      return false;
    }

    // Escape backticks and template literals
    const escapedContent = actualHtmlContent.replace(/`/g, '\\`').replace(/\${/g, '\\${');

    // Extract image src
    const imageMatch = content.match(/<Image[\s\S]*?src="([^"]+)"/);
    const imageSrc = imageMatch ? imageMatch[1] : "";
    
    // Extract alt text
    const altMatch = content.match(/alt="([^"]+)"/);
    const altText = altMatch ? altMatch[1] : "";

    // Extract title (from h1)
    const titleMatch = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    const title = titleMatch ? titleMatch[1].trim().replace(/\{[^}]*\}/g, '').replace(/\n\s*/g, ' ') : "";

    // Extract publish date
    const datePattern = /<svg[\s\S]*?date[\s\S]*?<\/svg>\s*\{?([^}<>]+)\}?/;
    const dateMatch = content.match(datePattern);
    const publishDate = dateMatch ? dateMatch[1].trim() : "{publishDate}";

    // Extract author  
    const authorMatch = content.match(/Taypro Team|author[\s\S]*?\{?([^}<>]+)\}?/);
    const author = (authorMatch && authorMatch[1] && !authorMatch[1].includes('svg')) ? authorMatch[1].trim() : "Taypro Team";

    // Extract description
    const descMatch = content.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    const description = descMatch ? descMatch[1].trim().replace(/\{[^}]*\}/g, '').replace(/\n\s*/g, ' ') : "";

    // Replace from Breadcrumbs to end, wrapping hero + content in new layout
    // Match pattern: Breadcrumbs -> separate hero section -> separate article section -> closing
    const breadcrumbsMatch = content.match(/(<Breadcrumbs[\s\S]*?\/>)/);
    const closingMatch = content.match(/(<\/>)/);
    
    if (!breadcrumbsMatch || !closingMatch) {
      console.log(`⚠️  Could not find breadcrumbs or closing tag for ${slug}`);
      return false;
    }

    const newLayout = `${breadcrumbsMatch[1]}

      {/* Main Layout with Similar Blogs Sidebar */}
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
                      ${publishDate}
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
      </div>
    ${closingMatch[1]}`;

    // Replace everything from Breadcrumbs to closing fragment
    const pattern = /<Breadcrumbs[\s\S]*?\/>[\s\S]*?<\/>/;
    const updated = content.replace(pattern, newLayout);

    await fs.writeFile(filePath, updated, "utf-8");
    console.log(`✅ Updated ${slug}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${slug}:`, error.message);
    return false;
  }
}

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
        skippedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();

