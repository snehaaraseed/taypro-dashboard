import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath =
  process.env.CMS_DATABASE_PATH?.trim() ||
  process.env.CMS_SQLITE?.trim() ||
  path.join(root, "data", "cms.sqlite");

console.log(`[db:defragment] Target database: ${dbPath}`);

try {
  const db = new Database(dbPath);
  console.log("[db:defragment] Running VACUUM...");
  db.exec("VACUUM;");
  console.log("[db:defragment] Running PRAGMA optimize...");
  db.pragma("optimize");
  db.close();
  console.log("[db:defragment] Database defragmentation completed successfully.");
} catch (error) {
  console.error("[db:defragment] Database defragmentation failed:", error);
  process.exit(1);
}
