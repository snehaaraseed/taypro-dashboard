#!/usr/bin/env node
/**
 * Smoke-test Imagen 4 Ultra hero generation for a blog topic.
 * Usage: node scripts/test-imagen-ultra-blog-image.mjs
 * Loads .env.local (dev) then .env.production when present.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { GoogleGenAI } from "@google/genai";

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

loadEnvFile(".env.local");
loadEnvFile(".env.production");

const DEFAULT_MODEL = "imagen-4.0-ultra-generate-001";

const EDUCATIONAL = {
  title:
    "How Dust and Soiling Reduce Solar Plant Performance Ratio in Summer",
  description:
    "Technical guide on soiling losses, cleaning frequency, and PR monitoring for 50MW+ sites in India.",
  seoKeyword: "solar panel soiling",
};

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

async function generateImagenUltraHero(input) {
  const keyCandidates = [
    ["GEMINI_API_KEY", process.env.GEMINI_API_KEY?.trim()],
    ["GEMINI_API_KEY_2", process.env.GEMINI_API_KEY_2?.trim()],
  ].filter(([, key]) => Boolean(key));

  if (keyCandidates.length === 0) {
    throw new Error("GEMINI_API_KEY is not set in .env.local");
  }

  const model =
    process.env.GEMINI_IMAGEN_MODEL?.trim() || DEFAULT_MODEL;
  const prompt = buildPrompt(input.title, input.description, input.seoKeyword);

  let lastError;
  for (const [label, key] of keyCandidates) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateImages({
        model,
        prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: "16:9",
          outputMimeType: "image/jpeg",
        },
      });

      const generated = response.generatedImages?.[0];
      const imageBytes = generated?.image?.imageBytes;
      if (!imageBytes) {
        const reason = generated?.raiFilteredReason;
        throw new Error(
          reason
            ? `Imagen filtered the image: ${reason}`
            : "Imagen returned no image data"
        );
      }

      const buffer = Buffer.from(imageBytes, "base64");
      if (buffer.length < 1000) throw new Error("Image buffer too small");

      const now = new Date();
      const year = now.getFullYear().toString();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const uploadDir = join(root, "public", "uploads", year, month);
      mkdirSync(uploadDir, { recursive: true });

      const fileName = `blog-imagen-ultra-test-${Date.now()}.jpg`;
      const filePath = join(uploadDir, fileName);
      writeFileSync(filePath, buffer);

      const url = `/uploads/${year}/${month}/${fileName}`;
      return {
        url,
        filePath,
        bytes: buffer.length,
        model,
        apiKeyUsed: label,
        source: `imagen (${model})`,
        mode: "generated",
      };
    } catch (error) {
      lastError = error;
      console.warn(`[${label}] failed:`, error instanceof Error ? error.message : error);
    }
  }

  throw lastError ?? new Error("Imagen image generation failed");
}

async function main() {
  const model =
    process.env.GEMINI_IMAGEN_MODEL?.trim() || DEFAULT_MODEL;

  console.log("Imagen model:", model);
  console.log("Title:", EDUCATIONAL.title);

  const start = Date.now();
  const image = await generateImagenUltraHero(EDUCATIONAL);
  console.log("\nSUCCESS — Imagen Ultra hero saved:");
  console.log(
    JSON.stringify({ ...image, durationMs: Date.now() - start }, null, 2)
  );
  console.log("\nLocal path:", image.filePath);
  console.log("Public URL path:", image.url);
}

main().catch((err) => {
  console.error("Test failed:", err.message || err);
  process.exit(1);
});
