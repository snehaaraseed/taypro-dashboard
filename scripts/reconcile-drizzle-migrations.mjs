/**
 * Align __drizzle_migrations with schema already on disk (e.g. translation_queue exists).
 * Idempotent — safe on every deploy before next build.
 */
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { readMigrationFiles } from "drizzle-orm/migrator";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const migrationsFolder = path.join(root, "drizzle");

function isBenign(error) {
  const message = error instanceof Error ? error.message : String(error);
  const causeMessage = error?.cause?.message ?? "";
  const text = `${message} ${causeMessage}`.toLowerCase();
  return (
    error?.cause?.code === "SQLITE_ERROR" &&
    (text.includes("already exists") || text.includes("duplicate column"))
  );
}

function stampNext(db) {
  const migrations = readMigrationFiles({ migrationsFolder });
  const applied = new Set(
    db.prepare("SELECT hash FROM __drizzle_migrations").all().map((r) => r.hash)
  );
  const pending = migrations.find((m) => !applied.has(m.hash));
  if (!pending) return false;
  db.prepare(
    "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)"
  ).run(pending.hash, pending.folderMillis);
  console.log(`  stamped migration ${pending.hash.slice(0, 12)}…`);
  return true;
}

function reconcileDb(dbPath) {
  if (!fs.existsSync(dbPath)) {
    console.log(`  skip (missing): ${dbPath}`);
    return;
  }
  console.log(`\n${dbPath}`);
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  const orm = drizzle(db);
  const max = readMigrationFiles({ migrationsFolder }).length + 2;

  for (let i = 0; i < max; i++) {
    try {
      migrate(orm, { migrationsFolder });
      console.log("  migrations OK");
      break;
    } catch (error) {
      if (!isBenign(error)) throw error;
      if (!stampNext(db)) {
        console.log("  no pending stamp; treating as OK");
        break;
      }
    }
  }

  const integrity = db.pragma("integrity_check", { simple: true });
  if (integrity !== "ok") {
    db.close();
    throw new Error(`integrity_check failed: ${integrity}`);
  }
  db.close();
}

const paths = [path.join(root, "data", "cms.sqlite")];
const standalone = path.join(root, ".next", "standalone", "data", "cms.sqlite");
if (fs.existsSync(standalone)) paths.push(standalone);

console.log("Reconcile drizzle migrations:");
for (const p of paths) reconcileDb(p);
