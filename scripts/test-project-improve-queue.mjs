/**
 * Smoke-test project improve queue + post-writer phase gate.
 *
 *   node scripts/test-project-improve-queue.mjs              # backlog + gate only
 *   node scripts/test-project-improve-queue.mjs --improve-one  # rewrite 1 legacy project
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnvFile(name) {
  const filePath = path.join(root, name);
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env.production");

const improveOne = process.argv.includes("--improve-one");
const force = process.argv.includes("--force");

async function main() {
  const {
    listProjectSlugsNeedingImprove,
    isCmsProjectImproveDisabled,
    processProjectImproveBacklog,
  } = await import("../src/lib/cms/project-improve-queue.ts");
  const {
    listBlogSlugsNeedingTranslation,
    listProjectSlugsNeedingTranslation,
  } = await import("../src/lib/translation/translation-queue.ts");

  const [legacy, blogNeed, projectNeed] = await Promise.all([
    listProjectSlugsNeedingImprove(),
    listBlogSlugsNeedingTranslation(),
    listProjectSlugsNeedingTranslation(),
  ]);

  const gateOpen = blogNeed.length === 0 && projectNeed.length === 0;
  const disabled = isCmsProjectImproveDisabled();

  console.log(
    JSON.stringify(
      {
        legacyBacklog: legacy.length,
        firstLegacy: legacy.slice(0, 3),
        translationBacklog: {
          blogs: blogNeed.length,
          projects: projectNeed.length,
        },
        improvePhaseWouldRun: gateOpen && !disabled,
        improveDisabled: disabled,
        geminiKeys: [
          process.env.GEMINI_API_KEY?.slice(-4),
          process.env.GEMINI_API_KEY_2?.slice(-4),
        ].filter(Boolean),
      },
      null,
      2
    )
  );

  if (!improveOne) {
    console.log("\nDry run only. Pass --improve-one to rewrite 1 legacy project.");
    return;
  }

  if (disabled) {
    console.error("CMS_PROJECT_IMPROVE_DISABLED is set — aborting.");
    process.exit(1);
  }

  if (!gateOpen && !force) {
    console.error(
      "Translation backlog not empty — post-writer would skip improve phase. Use --force to test improve anyway."
    );
    process.exit(1);
  }

  if (!process.env.GEMINI_API_KEY?.trim()) {
    console.error("GEMINI_API_KEY not set — aborting.");
    process.exit(1);
  }

  console.log("\nImproving 1 legacy project (no retranslate)...");
  const started = Date.now();
  const result = await processProjectImproveBacklog({
    maxPerRun: 1,
    log: (event, detail) =>
      console.log(JSON.stringify({ event, ...detail })),
  });
  console.log(
    JSON.stringify(
      { elapsedMs: Date.now() - started, result },
      null,
      2
    )
  );

  if (result.completed < 1) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
