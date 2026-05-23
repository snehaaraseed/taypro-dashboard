import "server-only";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import * as schema from "./schema";
import { runMigrations } from "./reconcile-migrations";

const DB_DIR = "data";
const DB_FILE = "cms.sqlite";

function resolveDbPath(): string {
  const envPath = process.env.CMS_DATABASE_PATH?.trim();
  if (envPath) {
    return path.resolve(envPath);
  }
  return path.join(getDeploymentRoot(), DB_DIR, DB_FILE);
}

let sqlite: Database.Database | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function applyMigrations(database: Database.Database) {
  const migrationsFolder = path.join(getDeploymentRoot(), "drizzle");
  runMigrations(database, migrationsFolder, schema);
}

export function getDb() {
  if (!db) {
    const dbPath = resolveDbPath();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    applyMigrations(sqlite);
    db = drizzle(sqlite, { schema });
  }
  return db;
}

export function getDbPath(): string {
  return resolveDbPath();
}
