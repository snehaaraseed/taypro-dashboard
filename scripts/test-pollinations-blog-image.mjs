#!/usr/bin/env node
/**
 * Smoke-test Pollinations hero generation for a non-robot (educational) blog topic.
 * Usage: node scripts/test-pollinations-blog-image.mjs
 * Loads .env.production when present (server) or .env.local (dev).
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");

function loadEnvFile(name) {
  const path = join(root, name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    if (process.env[key] === undefined) {
      process.env[key] = trimmed.slice(eq + 1);
    }
  }
}

loadEnvFile(".env.production");
loadEnvFile(".env.local");

const EDUCATIONAL = {
  title:
    "How Dust and Soiling Reduce Solar Plant Performance Ratio in Summer",
  description:
    "Technical guide on soiling losses, cleaning frequency, and PR monitoring for 50MW+ sites in India.",
  seoKeyword: "solar panel soiling",
  category: "O&M Best Practices",
};

function shouldUseProductLibraryImage(input) {
  const text = [
    input.title,
    input.description ?? "",
    input.seoKeyword ?? "",
    input.category ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const productPatterns = [
    /\b(cleaning|panel cleaning)\s+robot\b/,
    /\bsolar panel cleaning robot\b/,
    /\bbrush\s+vs\.?\s+robot\b/,
    /\brobot\s+vs\.?\s+brush\b/,
    /\brobot\b.*\bmanual\b/,
    /\bmanual\b.*\brobot\b/,
  ];
  return productPatterns.some((p) => p.test(text));
}

function getBlogImageMode() {
  const explicit = process.env.BLOG_IMAGE_MODE?.trim().toLowerCase();
  const hasKey = Boolean(process.env.POLLINATIONS_API_KEY?.trim());
  if (explicit === "library") return "library";
  if (explicit === "generate") return hasKey ? "generate" : "library";
  if (explicit === "hybrid") return hasKey ? "hybrid" : "library";
  return hasKey ? "hybrid" : "library";
}

function buildPrompt(title, description, seoKeyword) {
  const context = description.replace(/\s+/g, " ").trim().slice(0, 280);
  return `Professional editorial photograph for a utility-scale solar energy industry blog.
Article title: ${title}
SEO topic: ${seoKeyword}
Context: ${context}

Photorealistic wide hero image, documentary industrial photography:
- Large ground-mount solar PV plant in India, clear daylight or golden hour
- Visually supports the article topic (soiling on modules, dust, O&M context, performance monitoring)
- No text overlays, logos, watermarks, or brand names
- No cartoon or illustration style
- No close-up identifiable faces; distant workers optional and small
- Do not show branded cleaning robots unless the title mentions robots
- 16:9 composition for a website blog header`;
}

async function generatePollinationsHero(input) {
  const key = process.env.POLLINATIONS_API_KEY?.trim();
  if (!key) throw new Error("POLLINATIONS_API_KEY is not set");

  const model = process.env.POLLINATIONS_IMAGE_MODEL?.trim() || "flux";
  const size = process.env.POLLINATIONS_IMAGE_SIZE?.trim() || "1024x576";
  const prompt = buildPrompt(input.title, input.description, input.seoKeyword);

  const response = await fetch("https://gen.pollinations.ai/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      model,
      size,
      n: 1,
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Pollinations ${response.status}: ${body.slice(0, 300)}`);
  }

  const payload = await response.json();
  const b64 = payload.data?.[0]?.b64_json;
  if (!b64) throw new Error("Pollinations returned no b64_json");

  const buffer = Buffer.from(b64, "base64");
  if (buffer.length < 1000) throw new Error("Image buffer too small");

  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const uploadDir = join(root, "public", "uploads", year, month);
  mkdirSync(uploadDir, { recursive: true });

  const fileName = `blog-pollinations-test-${Date.now()}.jpg`;
  const filePath = join(uploadDir, fileName);
  writeFileSync(filePath, buffer);

  const url = `/uploads/${year}/${month}/${fileName}`;
  return {
    url,
    filePath,
    bytes: buffer.length,
    model,
    source: `pollinations (${model})`,
    mode: "generated",
  };
}

async function main() {
  const mode = getBlogImageMode();
  const useLibrary = mode === "library" || (mode === "hybrid" && shouldUseProductLibraryImage(EDUCATIONAL));

  console.log("Blog image mode:", mode);
  console.log("Educational scenario — useLibrary:", useLibrary);
  console.log("Title:", EDUCATIONAL.title);

  if (useLibrary) {
    console.error("FAIL: educational post would use library, not Pollinations");
    process.exit(1);
  }

  const start = Date.now();
  const image = await generatePollinationsHero(EDUCATIONAL);
  console.log("\nSUCCESS — Pollinations hero saved:");
  console.log(JSON.stringify({ ...image, durationMs: Date.now() - start }, null, 2));
  console.log("\nPublic URL: https://taypro.in" + image.url);
}

main().catch((err) => {
  console.error("Test failed:", err.message || err);
  process.exit(1);
});
