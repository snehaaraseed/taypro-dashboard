#!/usr/bin/env node
/**
 * Build data/seo-corpus-index.json from CMS blogs + published_topics H2 outlines.
 *
 * Usage: node scripts/build-corpus-index.mjs [--dry-run]
 */
import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import Database from "better-sqlite3";

const root = join(import.meta.dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const FINGERPRINT_WORD_LIMIT = 120;

function loadJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function extractH2Headings(html) {
  const headings = [];
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const text = match[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) headings.push(text);
  }
  return headings;
}

function stripHtmlToPlainText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildContentFingerprint(title, description, content) {
  const h2s = extractH2Headings(content).join(" ");
  const plain = stripHtmlToPlainText(content);
  const words = plain.split(/\s+/).filter(Boolean);
  const excerpt = words.slice(0, FINGERPRINT_WORD_LIMIT).join(" ");
  const payload = [title.trim(), description.trim(), h2s, excerpt]
    .join("\n")
    .toLowerCase();
  return createHash("sha256").update(payload).digest("hex");
}

function classifyStructuralArchetype({ title, description = "", h2Outline = [] }) {
  const blob = `${title} ${description} ${h2Outline.join(" ")}`.toLowerCase();
  if (/\bmistake(s)?\b|\bavoid\b|\bpitfall/.test(blob)) return "mistakes_listicle";
  if (/\bmanual\b.+\brobot\b|\bbrush\b.+\brobot\b|\bvs\b.+\bmanual\b/.test(blob)) {
    return "manual_vs_robot";
  }
  if (/how often|frequency|cleaning schedule|interval/.test(blob)) return "frequency_guide";
  if (/cost breakdown|per[- ]mw|budget line|opex|capex vs|tco/.test(blob)) {
    return "cost_breakdown";
  }
  if (/shortlist|manufacturer|supplier|vendor|companies/.test(blob)) return "vendor_shortlist";
  if (/weather|monsoon|dust belt|soiling|performance ratio|\bpr\b/.test(blob)) {
    return "weather_soiling";
  }
  if (/panel price|module price|per watt|pv panel price/.test(blob)) return "price_capex_bridge";
  if (/evaluate|evaluation|what to look|checklist|playbook/.test(blob)) return "robot_evaluation";
  if (/complete guide|ultimate guide|everything you need|comprehensive/.test(blob)) {
    return "complete_guide";
  }
  if (/\bvs\b|compare|comparison|pros and cons/.test(blob)) return "comparison_matrix";
  if (/checklist|step[- ]by[- ]step|playbook/.test(blob)) return "checklist_playbook";
  return "general_om";
}

function parsePrimaryKeyword(category) {
  const match = (category ?? "").match(/seo:([^|]+)/i);
  return match?.[1]?.trim().toLowerCase() ?? null;
}

function parseH2OutlineJson(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((h) => String(h).trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

function loadPosts() {
  const dbCandidates = [
    join(root, "data", "cms.sqlite"),
    join(root, "data", "cms.db"),
  ];
  const dbPath = dbCandidates.find((p) => existsSync(p));
  if (!dbPath) {
    console.warn("No CMS database found; writing empty index");
    return [];
  }

  const db = new Database(dbPath, { readonly: true });
  const posts = new Map();

  try {
    const topicRows = db
      .prepare(
        "SELECT slug, title, category, h2_outline FROM published_topics"
      )
      .all();
    for (const row of topicRows) {
      posts.set(row.slug, {
        slug: row.slug,
        title: row.title,
        description: "",
        category: row.category,
        content: "",
        h2Outline: parseH2OutlineJson(row.h2_outline),
      });
    }
  } catch {
    // published_topics optional
  }

  try {
    const blogRows = db
      .prepare(
        "SELECT slug, title, description, category, content FROM blogs WHERE locale = 'en' AND published = 1"
      )
      .all();
    for (const row of blogRows) {
      const existing = posts.get(row.slug) ?? {};
      posts.set(row.slug, {
        slug: row.slug,
        title: row.title,
        description: row.description ?? "",
        category: row.category ?? existing.category ?? "",
        content: row.content ?? "",
        h2Outline: existing.h2Outline ?? [],
      });
    }
  } catch {
    try {
      const blogRows = db
        .prepare("SELECT slug, title, description, category, content FROM blogs WHERE locale = 'en'")
        .all();
      for (const row of blogRows) {
        const existing = posts.get(row.slug) ?? {};
        posts.set(row.slug, {
          slug: row.slug,
          title: row.title,
          description: row.description ?? "",
          category: row.category ?? existing.category ?? "",
          content: row.content ?? "",
          h2Outline: existing.h2Outline ?? [],
        });
      }
    } catch {
      // blogs table may not exist
    }
  } finally {
    db.close();
  }

  return [...posts.values()];
}

function main() {
  const entries = [];
  for (const post of loadPosts()) {
    const h2Outline =
      post.h2Outline?.length > 0
        ? post.h2Outline
        : post.content
          ? extractH2Headings(post.content)
          : [];
    const primaryKeyword = parsePrimaryKeyword(post.category);
    const structuralArchetype = classifyStructuralArchetype({
      title: post.title,
      description: post.description,
      h2Outline,
    });

    entries.push({
      slug: post.slug,
      title: post.title,
      description: post.description ?? "",
      primaryKeyword,
      structuralArchetype,
      h2Outline,
      fingerprint: buildContentFingerprint(
        post.title,
        post.description ?? "",
        post.content ?? ""
      ),
    });
  }

  const index = {
    builtAt: new Date().toISOString(),
    locale: "en",
    entries,
  };

  const outPath = join(root, "data", "seo-corpus-index.json");
  console.log(`Built corpus index: ${entries.length} EN posts`);

  if (dryRun) {
    console.log(JSON.stringify(index, null, 2).slice(0, 1200) + "\n…");
    return;
  }

  mkdirSync(join(root, "data"), { recursive: true });
  writeFileSync(outPath, JSON.stringify(index, null, 2));
  console.log(`Wrote ${outPath}`);
}

main();
