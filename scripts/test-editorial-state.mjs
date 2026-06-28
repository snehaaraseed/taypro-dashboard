#!/usr/bin/env node
/** Smoke tests for editorial-state persistence (no Gemini). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtimeDir = path.join(root, ".runtime", "blog-cron");
const stateFile = path.join(runtimeDir, "editorial-state.json");

fs.mkdirSync(runtimeDir, { recursive: true });
const day = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const state = {
  date: day,
  attemptsToday: 1,
  rejections: [
    {
      slotKey: "test::slot",
      reason: "Outline too similar",
      permanent: true,
      at: new Date().toISOString(),
    },
  ],
};
fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

const loaded = JSON.parse(fs.readFileSync(stateFile, "utf8"));
if (loaded.rejections.length !== 1) {
  console.error("editorial-state test failed");
  process.exit(1);
}
console.log("editorial-state test passed");
