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

async function deleteCustomPage(slug) {
  const pagePath = path.join(projectRoot, "src", "app", "blog", slug, "page.tsx");
  const metadataPath = path.join(projectRoot, "src", "app", "blog", slug, "metadata.json");

  // Check if metadata.json exists (required for dynamic route)
  try {
    await fs.access(metadataPath);
  } catch (error) {
    return { success: false, reason: "no_metadata" };
  }

  // Check if page.tsx exists
  try {
    await fs.access(pagePath);
  } catch (error) {
    return { success: false, reason: "no_page" };
  }

  // Delete the custom page.tsx so it uses the dynamic route
  await fs.unlink(pagePath);
  console.log(`✅ Deleted ${slug}/page.tsx`);
  return { success: true };
}

async function main() {
  console.log("Deleting custom page.tsx files to use dynamic route...\n");
  
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
      const result = await deleteCustomPage(slug);
      
      if (result.success) {
        results.success++;
      } else if (result.reason === "no_page") {
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
  console.log(`✅ Successfully deleted: ${results.success}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  if (results.failed > 0) {
    console.log("\nFailed blogs:");
    Object.entries(results.errors).forEach(([slug, reason]) => {
      console.log(`  - ${slug}: ${reason}`);
    });
  }
}

main().catch(console.error);

