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

    // Skip if already has the merged layout
    if (content.includes("Main Layout with Similar Blogs Sidebar")) {
      console.log(`⏭️  Skipping ${slug} - already has merged layout`);
      return false;
    }

    // Skip if doesn't have separate hero section
    if (!content.includes('{/* Hero Section') && !content.includes('Hero Section with Featured Image')) {
      console.log(`⚠️  ${slug} doesn't have separate hero section`);
      return false;
    }

    // Extract the hero section content
    const heroSectionMatch = content.match(
      /(\{/\* Hero Section[\s\S]*?<section[\s\S]*?<div className="max-w-4xl[\s\S]*?)([\s\S]*?)(<\/div>\s*<\/section>)/
    );

    if (!heroSectionMatch) {
      // Try alternative pattern
      const altMatch = content.match(
        /(<section className="w-full pt-20 pb-10 bg-white">[\s\S]*?<div className="max-w-4xl[\s\S]*?)([\s\S]*?)(<\/div>\s*<\/section>)/
      );
      if (!altMatch) {
        console.log(`⚠️  Could not extract hero section for ${slug}`);
        return false;
      }
    }

    // Find where the hero section ends and article begins
    const pattern = /(<section[\s\S]*?className="w-full pt-20[\s\S]*?<\/section>)\s*(\{/\* Main Content[\s\S]*?<article[\s\S]*?className="w-full pb-20[\s\S]*?<div className="max-w-7xl[\s\S]*?<div className="flex[\s\S]*?<div className="flex-1 lg:max-w-3xl">)/;
    
    const match = content.match(pattern);
    if (!match) {
      console.log(`⚠️  Could not find pattern to merge for ${slug}`);
      return false;
    }

    // Extract hero content (between section tags, excluding the section wrapper)
    const heroContentMatch = match[0].match(/<section[\s\S]*?>(.*?)<\/section>/);
    if (!heroContentMatch) {
      console.log(`⚠️  Could not extract hero content for ${slug}`);
      return false;
    }

    let heroContent = heroContentMatch[1];
    
    // Remove the max-w-4xl wrapper div from hero
    heroContent = heroContent.replace(/<div className="max-w-4xl mx-auto px-6">/g, '');
    heroContent = heroContent.replace(/<\/div>\s*$/, '').trim();

    // Extract the main content section (the flex-1 div content)
    const mainContentMatch = match[0].match(/<div className="flex-1 lg:max-w-3xl">([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<\/article>)/);
    if (!mainContentMatch) {
      console.log(`⚠️  Could not extract main content for ${slug}`);
      return false;
    }

    const mainContent = mainContentMatch[1];

    // Build new merged layout
    const newLayout = `<div className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-20">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content Column */}
            <div className="flex-1 lg:max-w-3xl">
              {/* Hero Section with Featured Image */}
              <section className="pb-10">
${heroContent.split('\n').map(line => '                ' + line).join('\n')}
              </section>

              {/* Main Content */}
              <article>
${mainContent.split('\n').map(line => '                ' + line).join('\n')}
              </article>
            </div>

            {/* Similar Blogs Sidebar - Full Height */}
            <SimilarBlogs blogs={allBlogs} currentSlug={currentSlug} />
          </div>
        </div>
      </div>`;

    // Replace from hero section start to article end, keeping breadcrumbs and closing fragment
    const replacementPattern = /(<Breadcrumbs[\s\S]*?\/>)\s*(<section[\s\S]*?className="w-full pt-20[\s\S]*?<\/section>)\s*(\{/\* Main Content[\s\S]*?<article[\s\S]*?className="w-full pb-20[\s\S]*?<\/article>)/;
    
    const updatedContent = content.replace(
      replacementPattern,
      `$1

      {/* Main Layout with Similar Blogs Sidebar */}
      ${newLayout}`
    );

    await fs.writeFile(filePath, updatedContent, "utf-8");
    console.log(`✅ Updated ${slug} with full-height sidebar`);
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

