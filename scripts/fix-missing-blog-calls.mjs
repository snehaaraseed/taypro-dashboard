import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, "../src/app/blog");

async function fixMissingCalls() {
  const entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });
  const blogDirs = entries.filter(
    (entry) =>
      entry.isDirectory() &&
      !["components", "api", "[slug]", "add", "db"].includes(entry.name)
  );

  let fixedCount = 0;

  for (const dir of blogDirs) {
    const blogPath = path.join(BLOG_DIR, dir.name);
    const pagePath = path.join(blogPath, "page.tsx");
    const slug = dir.name;

    try {
      const content = await fs.readFile(pagePath, "utf-8");
      
      // Check if it has SimilarBlogs but missing getAllBlogsForSimilar call
      if (content.includes("SimilarBlogs") && !content.includes("const allBlogs")) {
        // Add the call after the function opening brace
        const fixed = content.replace(
          /export default async function BlogPost\(\) \{(\s*\n)/,
          `export default async function BlogPost() {$1  const allBlogs = await getAllBlogsForSimilar();
  const currentSlug = "${slug}";
$1`
        );
        
        await fs.writeFile(pagePath, fixed, "utf-8");
        console.log(`✅ Fixed ${slug}`);
        fixedCount++;
      }
    } catch (error) {
      // Skip if file doesn't exist or can't be read
    }
  }

  console.log(`\n📊 Fixed ${fixedCount} files`);
}

fixMissingCalls();

