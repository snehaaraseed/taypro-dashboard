import type Database from "better-sqlite3";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";
import type * as schema from "./schema";
import { ensureSlugLocaleUnique } from "./ensure-slug-locale-unique";

function collectErrorText(error: unknown): string {
  const parts: string[] = [];
  let current: unknown = error;
  for (let depth = 0; depth < 6 && current != null; depth++) {
    if (current instanceof Error) {
      parts.push(current.message);
      current = current.cause;
      continue;
    }
    if (typeof current === "object") {
      const row = current as {
        message?: string;
        code?: string;
        cause?: unknown;
      };
      if (row.message) parts.push(row.message);
      if (row.code) parts.push(row.code);
      current = row.cause;
      continue;
    }
    parts.push(String(current));
    break;
  }
  return parts.join(" ").toLowerCase();
}

function isBenignMigrationError(error: unknown): boolean {
  const text = collectErrorText(error);
  return (
    text.includes("already exists") ||
    text.includes("duplicate column")
  );
}

function stampNextPendingMigration(
  database: Database.Database,
  migrationsFolder: string
): boolean {
  const migrations = readMigrationFiles({ migrationsFolder });
  const applied = new Set(
    (
      database
        .prepare("SELECT hash FROM __drizzle_migrations")
        .all() as { hash: string }[]
    ).map((row) => row.hash)
  );
  const pending = migrations.find((m) => !applied.has(m.hash));
  if (!pending) return false;

  database
    .prepare(
      "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)"
    )
    .run(pending.hash, pending.folderMillis);
  return true;
}

/** Run drizzle migrations; reconcile journal when schema already matches. */
export function runMigrations(
  database: Database.Database,
  migrationsFolder: string,
  schemaModule: typeof schema
): void {
  if (!fs.existsSync(migrationsFolder)) return;

  const orm = drizzle(database, { schema: schemaModule });
  const maxAttempts = readMigrationFiles({ migrationsFolder }).length + 2;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      migrate(orm, { migrationsFolder });
      ensureSlugLocaleUnique(database);
      return;
    } catch (error) {
      if (!isBenignMigrationError(error)) throw error;
      const stamped = stampNextPendingMigration(database, migrationsFolder);
      if (!stamped) return;
    }
  }
}
