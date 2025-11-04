import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

async function getAllBlogDirs() {
  const blogsDir = path.join(projectRoot, "src", "app", "blog");
  const entries = await fs.readdir(blogsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && entry.name !== "[slug]" && entry.name !== "db" && entry.name !== "add")
    .map((entry) => entry.name);
}

async function extractContentToHtml(slug) {
  const pagePath = path.join(projectRoot, "src", "app", "blog", slug, "page.tsx");
  const htmlPath = path.join(projectRoot, "src", "app", "blog", slug, "content.html");

  let pageContent;
  try {
    pageContent = await fs.readFile(pagePath, "utf-8");
  } catch (error) {
    return { success: false, reason: "read_error" };
  }

  // Extract HTML - handle multiple patterns:
  // 1. __html: `...content...\`, }} /> (escaped backtick)
  // 2. __html: `...content...`, }} /> (simple backtick)
  // 3. const blogContent = `...content...`;
  let content = "";
  
  // Try pattern 1 & 2: __html: `...`
  const htmlPattern = /__html:\s*`/;
  const htmlMatch = pageContent.match(htmlPattern);
  
  if (htmlMatch && htmlMatch.index !== undefined) {
    const startPos = htmlMatch.index + htmlMatch[0].length;
    
    // Find the end: try multiple patterns including double-escaped backticks
    // In the file, \\\` means: backslash, backslash, backtick (literal)
    // To match this in regex: \\\\\` (4 backslashes to match 2 literal backslashes, then backtick)
    const endPatterns = [
      /\\\\\`,\s*\}\s*\}\s*\/>/,     // \\`, }} /> (double-escaped backtick - nested pattern)
      /`\s*,\s*\}\s*\}\s*\/>/,       // `, }} /> (simple backtick - most common)
      /\\\`,\s*\n\s*const siteUrl/,  // \`, followed by const siteUrl
      /\\\`,\s*\n\s*\}\s*\}\s*\/>/,  // \`, followed by }} />
      /\\\`,\s*\}\s*\}\s*\/>/,       // \`, }} /> (single escaped)
      /\\\`\s*,\s*\}\s*\}\s*\/>/,    // \`, }} /> (spaces)
    ];
    
    let endPos = -1;
    for (const pattern of endPatterns) {
      const endMatch = pageContent.substring(startPos).match(pattern);
      if (endMatch && endMatch.index !== undefined) {
        endPos = startPos + endMatch.index;
        break;
      }
    }
    
    if (endPos === -1) {
      // Last resort: look for any `, before }} />
      const fallbackMatch = pageContent.substring(startPos).match(/`\s*,\s*\}\s*\}\s*\/>/);
      if (fallbackMatch && fallbackMatch.index !== undefined) {
        endPos = startPos + fallbackMatch.index;
      } else {
        return { success: false, reason: "no_html_end" };
      }
    }
    
    content = pageContent.substring(startPos, endPos);
  } else {
    // Try pattern 2: const blogContent = `...`;
    const blogContentPattern = /const\s+blogContent\s*=\s*`/;
    const blogContentMatch = pageContent.match(blogContentPattern);
    
    if (blogContentMatch && blogContentMatch.index !== undefined) {
      const startPos = blogContentMatch.index + blogContentMatch[0].length;
      
      // Find the end: look for `; (end of variable assignment)
      const endMatch = pageContent.substring(startPos).match(/`\s*;/);
      if (endMatch && endMatch.index !== undefined) {
        const endPos = startPos + endMatch.index;
        content = pageContent.substring(startPos, endPos);
      } else {
        return { success: false, reason: "no_blogcontent_end" };
      }
    } else {
      return { success: false, reason: "no_html_start" };
    }
  }
  
  // Unescape
  content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$').replace(/\\\\/g, '\\');
  
  if (!content.trim()) {
    return { success: false, reason: "empty_content" };
  }

  // Save to content.html
  await fs.writeFile(htmlPath, content, "utf-8");
  console.log(`✅ Extracted content for ${slug}`);
  return { success: true };
}

async function main() {
  console.log("Extracting blog content to content.html files...\n");
  
  const blogDirs = await getAllBlogDirs();
  console.log(`Found ${blogDirs.length} blogs\n`);

  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: {}
  };

  for (const slug of blogDirs) {
    try {
      const result = await extractContentToHtml(slug);
      
      if (result.success) {
        results.success++;
      } else if (result.reason === "no_html_found") {
        results.skipped++;
      } else {
        results.failed++;
        results.errors[slug] = result.reason;
      }
    } catch (error) {
      console.error(`❌ Error processing ${slug}:`, error.message);
      results.failed++;
      results.errors[slug] = error.message;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("SUMMARY");
  console.log("=".repeat(50));
  console.log(`✅ Successfully extracted: ${results.success}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`❌ Failed: ${results.failed}`);
}

main().catch(console.error);

