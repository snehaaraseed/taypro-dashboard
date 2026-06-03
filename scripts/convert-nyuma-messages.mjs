#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");

function convertNyuma() {
  let s = readFileSync(join(root, "messages/pages/en/nyuma.json"), "utf8");
  s = s.replace(/ModelAPage/g, "NyumaPage");
  s = s.replace(/GLYDE-X/g, "NYUMA-X");
  s = s.replace(/GLYDE/g, "NYUMA");
  s = s.replace(/HELYX/g, "HELYX");
  s = s.replace(/dual-pass/gi, "single-pass");
  s = s.replace(/Dual-Pass/g, "Single-Pass");
  s = s.replace(/Dual pass/gi, "Single-pass");
  s = s.replace(/microfiber/gi, "PBT brush");
  s = s.replace(/Microfiber/g, "PBT brush");
  s = s.replace(/airflow and PBT brush/g, "PBT brush");
  s = s.replace(/airflow \+ PBT brush/g, "PBT brush");
  s = s.replace(/patented single-pass/g, "single-pass");
  s = s.replace(/Patented single-pass/g, "Single-pass");
  s = s.replace(/"sku": "MODEL-A"/, '"sku": "NYUMA"');
  s = s.replace(
    /Automatic Solar Panel Cleaning Robot, NYUMA \(Waterless, AI\)/g,
    "NYUMA Automatic Solar Panel Cleaning Robot, PBT, Waterless, AI"
  );
  writeFileSync(join(root, "messages/pages/en/nyuma.json"), s);
  console.log("nyuma.json converted");
}

function convertNyumaX() {
  let s = readFileSync(join(root, "messages/pages/en/nyuma-x.json"), "utf8");
  s = s.replace(/ModelTPage/g, "NyumaXPage");
  s = s.replace(/GLYDE-X/g, "NYUMA-X");
  s = s.replace(/\bGLYDE\b/g, "NYUMA");
  s = s.replace(/dual-pass/gi, "single-pass");
  s = s.replace(/Dual-Pass/g, "Single-Pass");
  s = s.replace(/microfiber/gi, "PBT brush");
  s = s.replace(/Microfiber/g, "PBT brush");
  s = s.replace(/Patented single-pass/g, "Single-pass");
  writeFileSync(join(root, "messages/pages/en/nyuma-x.json"), s);
  console.log("nyuma-x.json converted");
}

convertNyuma();
convertNyumaX();
