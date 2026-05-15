/**
 * Remove legacy file-based CMS directories (content lives in SQLite).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const BLOG_KEEP = new Set([
  "components",
  "api",
  "[slug]",
  "add",
  "db",
  "author",
]);

const PROJECT_LEGACY = [
  "agar-solar-project",
  "banda-solar-project",
  "soyegaon-solar-project",
  "yadgir-solar-project-50-mw",
];

const blogDir = path.join(root, "src", "app", "blog");
let blogsRemoved = 0;
if (fs.existsSync(blogDir)) {
  for (const name of fs.readdirSync(blogDir)) {
    if (BLOG_KEEP.has(name)) continue;
    const dir = path.join(blogDir, name);
    if (fs.statSync(dir).isDirectory()) {
      fs.rmSync(dir, { recursive: true, force: true });
      blogsRemoved++;
    }
  }
}

let projectsRemoved = 0;
for (const slug of PROJECT_LEGACY) {
  const dir = path.join(root, "src", "app", "projects", slug);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    projectsRemoved++;
  }
}

const storePath = path.join(root, "src", "app", "data", "blogAuthors.store.json");
if (fs.existsSync(storePath)) {
  fs.unlinkSync(storePath);
}

console.log(
  `Cleanup: ${blogsRemoved} blog dir(s), ${projectsRemoved} legacy project dir(s), authors store removed if present`
);
