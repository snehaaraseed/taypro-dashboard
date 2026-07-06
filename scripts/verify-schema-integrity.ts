/**
 * Schema Integrity & SEO structured data auditor.
 * Run directly via: npx tsx scripts/verify-schema-integrity.ts
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const dbPath =
  process.env.CMS_DATABASE_PATH?.trim() ||
  process.env.CMS_SQLITE?.trim() ||
  path.join(root, "data", "cms.sqlite");

console.log(`[schema-auditor] Connecting to database: ${dbPath}`);
const db = new Database(dbPath, { readonly: true });

let failuresCount = 0;

function logIssue(type: string, id: string | number, slug: string, locale: string, issue: string) {
  failuresCount += 1;
  console.warn(`⚠️  [${type.toUpperCase()}] ID: ${id} | /${locale}/slug: ${slug} | Issue: ${issue}`);
}

// 1. Audit Blog Posts FAQ schema
try {
  const blogs = db
    .prepare("SELECT id, slug, locale, title, seo_keyword as seoKeyword, faqs FROM blogs WHERE published = 1")
    .all() as any[];

  console.log(`[schema-auditor] Auditing ${blogs.length} published blogs...`);

  for (const blog of blogs) {
    let faqsList: any[] = [];
    try {
      faqsList = JSON.parse(blog.faqs || "[]");
    } catch (e: any) {
      logIssue("blog", blog.id, blog.slug, blog.locale, `faqs is invalid JSON: ${e.message}`);
      continue;
    }

    if (!Array.isArray(faqsList)) {
      logIssue("blog", blog.id, blog.slug, blog.locale, "faqs is not a JSON array");
      continue;
    }

    // Check basic length requirements (SEO rule: blogs should have 4-5 FAQs for schema)
    if (faqsList.length < 4) {
      logIssue("blog", blog.id, blog.slug, blog.locale, `Requires at least 4 FAQs (found ${faqsList.length})`);
    }

    faqsList.forEach((faq, index) => {
      if (!faq.question || typeof faq.question !== "string" || faq.question.trim().length < 10) {
        logIssue("blog", blog.id, blog.slug, blog.locale, `FAQ[${index}] question is empty or too short (<10 chars)`);
      }
      if (!faq.answer || typeof faq.answer !== "string" || faq.answer.trim().length < 15) {
        logIssue("blog", blog.id, blog.slug, blog.locale, `FAQ[${index}] answer is empty or too short (<15 chars)`);
      }
    });

    // Check keyword alignment in the first FAQ question (SEO best practice)
    if (blog.seoKeyword && faqsList[0]?.question) {
      const keyword = blog.seoKeyword.toLowerCase().trim();
      const question = faqsList[0].question.toLowerCase();
      if (!question.includes(keyword)) {
        logIssue("blog", blog.id, blog.slug, blog.locale, `faqs[0] question does not contain target SEO keyword: "${blog.seoKeyword}"`);
      }
    }
  }
} catch (error: any) {
  console.error("Blog FAQ audit query failed:", error);
  process.exit(1);
}

// 2. Audit Projects schema
try {
  const projects = db
    .prepare("SELECT id, slug, locale, title, description, image, details FROM projects WHERE published = 1")
    .all() as any[];

  console.log(`[schema-auditor] Auditing ${projects.length} published projects...`);

  for (const project of projects) {
    if (!project.title || project.title.trim().length === 0) {
      logIssue("project", project.id, project.slug, project.locale, "title is empty");
    }
    if (!project.description || project.description.trim().length === 0) {
      logIssue("project", project.id, project.slug, project.locale, "description is empty");
    }
    if (!project.image || project.image.trim().length === 0) {
      logIssue("project", project.id, project.slug, project.locale, "featured image path is empty");
    }

    try {
      const detailsList = JSON.parse(project.details || "[]");
      if (!Array.isArray(detailsList)) {
        logIssue("project", project.id, project.slug, project.locale, "details is not a JSON array");
      }
    } catch (e: any) {
      logIssue("project", project.id, project.slug, project.locale, `details is invalid JSON: ${e.message}`);
    }
  }
} catch (error: any) {
  console.error("Project audit query failed:", error);
  process.exit(1);
}

// 3. Final Report
console.log("\n--- Audit Summary ---");
if (failuresCount > 0) {
  console.warn(`⚠️  Audit completed with ${failuresCount} schema warning(s).`);
} else {
  console.log("✅ All database schemas and dynamic SEO configurations are fully intact.");
}
process.exit(0);
