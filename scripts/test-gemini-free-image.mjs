#!/usr/bin/env node
/**
 * Try free-tier Gemini/Imagen image models until one succeeds.
 * Usage: node scripts/test-gemini-free-image.mjs
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

const PROMPT = `Professional editorial photograph for a utility-scale solar energy industry blog.
Article title: How Dust and Soiling Reduce Solar Plant Performance Ratio in Summer
SEO topic: solar panel soiling

Photorealistic wide hero image, documentary industrial photography:
- Large ground-mount solar PV plant in India, clear daylight or golden hour
- Visible dust soiling on solar modules
- No text overlays, logos, watermarks, or brand names
- 16:9 composition for a website blog header`;

/** Ordered: likely free / cheapest first per dashboard (Imagen 0/25 RPD). */
const CANDIDATES = [
  {
    id: "imagen-4.0-fast-generate-001",
    api: "generateImages",
    label: "Imagen 4 Fast (0/25 RPD on dashboard)",
  },
  {
    id: "imagen-4.0-generate-001",
    api: "generateImages",
    label: "Imagen 4 Standard",
  },
  {
    id: "gemini-2.5-flash-image",
    api: "generateContent",
    label: "Nano Banana (Gemini 2.5 Flash Image)",
  },
  {
    id: "gemini-2.5-flash-preview-image",
    api: "generateContent",
    label: "Gemini 2.5 Flash Preview Image",
  },
  {
    id: "gemini-3.1-flash-image-preview",
    api: "generateContent",
    label: "Nano Banana 2 Preview",
  },
  {
    id: "gemini-3.1-flash-image",
    api: "generateContent",
    label: "Nano Banana 2",
  },
];

function shortError(error) {
  const raw = error instanceof Error ? error.message : String(error);
  try {
    const parsed = JSON.parse(raw);
    return parsed?.error?.message ?? raw;
  } catch {
    return raw.slice(0, 220);
  }
}

async function tryImagen(ai, model) {
  const response = await ai.models.generateImages({
    model,
    prompt: PROMPT,
    config: {
      numberOfImages: 1,
      aspectRatio: "16:9",
      outputMimeType: "image/jpeg",
    },
  });
  const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
  if (!imageBytes) {
    const reason = response.generatedImages?.[0]?.raiFilteredReason;
    throw new Error(reason ?? "no image bytes");
  }
  return Buffer.from(imageBytes, "base64");
}

async function tryGeminiImage(ai, model) {
  const response = await ai.models.generateContent({
    model,
    contents: PROMPT,
    config: { responseModalities: ["IMAGE"] },
  });
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img?.inlineData?.data) throw new Error("no image part in response");
  return Buffer.from(img.inlineData.data, "base64");
}

function saveBuffer(buffer, model) {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const uploadDir = join(root, "public", "uploads", year, month);
  mkdirSync(uploadDir, { recursive: true });
  const slug = model.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  const fileName = `blog-gemini-image-test-${slug}-${Date.now()}.jpg`;
  const filePath = join(uploadDir, fileName);
  writeFileSync(filePath, buffer);
  return { filePath, url: `/uploads/${year}/${month}/${fileName}`, bytes: buffer.length };
}

async function main() {
  const keys = [
    ["GEMINI_API_KEY", process.env.GEMINI_API_KEY?.trim()],
    ["GEMINI_API_KEY_2", process.env.GEMINI_API_KEY_2?.trim()],
  ].filter(([, k]) => Boolean(k));

  if (keys.length === 0) throw new Error("No GEMINI_API_KEY in .env.local");

  console.log("Probing image models (free-tier candidates first)...\n");

  for (const [keyLabel, apiKey] of keys) {
    console.log(`=== ${keyLabel} ===`);
    const ai = new GoogleGenAI({ apiKey });

    for (const candidate of CANDIDATES) {
      process.stdout.write(`  ${candidate.id} ... `);
      try {
        const start = Date.now();
        const buffer =
          candidate.api === "generateImages"
            ? await tryImagen(ai, candidate.id)
            : await tryGeminiImage(ai, candidate.id);

        if (buffer.length < 1000) throw new Error(`buffer too small (${buffer.length})`);

        const saved = saveBuffer(buffer, candidate.id);
        console.log(`OK (${saved.bytes} bytes, ${Date.now() - start}ms)`);
        console.log("\nSUCCESS");
        console.log(
          JSON.stringify(
            {
              model: candidate.id,
              label: candidate.label,
              apiKeyUsed: keyLabel,
              ...saved,
              durationMs: Date.now() - start,
            },
            null,
            2
          )
        );
        return;
      } catch (error) {
        console.log(`FAIL — ${shortError(error)}`);
      }
    }
    console.log("");
  }

  console.error("\nAll image models failed on every API key.");
  console.error(
    "Your dashboard shows Imagen 4 at 0/25 RPD but Nano Banana at 0/0/0 (no free API quota)."
  );
  console.error(
    "Image generation via API likely requires billing on this project: https://ai.dev/projects"
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
