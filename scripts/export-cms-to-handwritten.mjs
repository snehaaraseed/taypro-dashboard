import Database from "better-sqlite3";
import fs from "fs";

const slugs = fs
  .readdirSync("content/handwritten-case-studies")
  .filter((f) => f.endsWith(".html"))
  .map((f) => f.replace(".html", ""));

const db = new Database("data/cms.sqlite");
const stmt = db.prepare(
  "SELECT content FROM projects WHERE slug = ? AND locale = 'en' LIMIT 1"
);

for (const slug of slugs) {
  const row = stmt.get(slug);
  if (!row?.content) {
    console.warn("missing", slug);
    continue;
  }
  fs.writeFileSync(
    `content/handwritten-case-studies/${slug}.html`,
    row.content.trim() + "\n"
  );
  console.log("exported", slug, row.content.length);
}
db.close();
