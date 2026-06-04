/**
 * Appends site-specific editorial blocks before Conclusion in tier-1 case studies.
 */
import fs from "fs";
import { extras, extrasPass2, extrasPass3 } from "./lib/tier1-handwritten-extras.mjs";
import { finalPad } from "./lib/tier1-final-pad.mjs";

function appendMap(map, label) {
  for (const [slug, block] of Object.entries(map)) {
    const path = `content/handwritten-case-studies/${slug}.html`;
    let html = fs.readFileSync(path, "utf8");
    const marker = block.trim().slice(0, 48);
    if (html.includes(marker)) continue;
    html = html.replace("<h2>Conclusion</h2>", `${block.trim()}\n\n<h2>Conclusion</h2>`);
    fs.writeFileSync(path, html);
    console.log(label, slug);
  }
}

appendMap(extras, "pass1");
appendMap(extrasPass2, "pass2");
appendMap(extrasPass3, "pass3");
appendMap(finalPad, "finalPad");
