import type { ProjectFactsJson, ProjectSectionsJson } from "@/lib/cms/project-facts-types";

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatRobotRows(facts: ProjectFactsJson): string {
  const auto = Number(facts.automaticRobots) || 0;
  const semi = Number(facts.semiAutomaticRobots) || 0;
  const total = auto + semi;
  const autoRow =
    auto > 0
      ? `<tr><td>Automatic robots</td><td>${auto}</td></tr>`
      : `<tr><td>Automatic robots</td><td>-</td></tr>`;
  const semiRow =
    semi > 0
      ? `<tr><td>Semi-automatic robots</td><td>${semi}</td></tr>`
      : `<tr><td>Semi-automatic robots</td><td>-</td></tr>`;
  const rpm =
    total > 0 && facts.capacityMw
      ? (total / Number(facts.capacityMw)).toFixed(2)
      : null;

  return `${autoRow}
${semiRow}
<tr><td>Total fleet</td><td>${total > 0 ? `${total} robots` : facts.robotSystem || "-"}</td></tr>
<tr><td>Robots per MW</td><td>${rpm ? `~${rpm}` : "-"}</td></tr>`;
}

export function buildStatsTableRows(facts: ProjectFactsJson): Array<{
  label: string;
  value: string;
}> {
  const rows: Array<{ label: string; value: string }> = [];
  if (facts.capacityMw) {
    rows.push({ label: "Nameplate capacity", value: `${facts.capacityMw} MW` });
  }
  if (facts.state) {
    rows.push({ label: "State / region", value: facts.state });
  }
  const auto = Number(facts.automaticRobots) || 0;
  const semi = Number(facts.semiAutomaticRobots) || 0;
  rows.push({
    label: "Automatic robots",
    value: auto > 0 ? String(auto) : "-",
  });
  rows.push({
    label: "Semi-automatic robots",
    value: semi > 0 ? String(semi) : "-",
  });
  const total = auto + semi;
  rows.push({
    label: "Total fleet",
    value: total > 0 ? `${total} robots` : facts.robotSystem || "-",
  });
  if (total > 0 && facts.capacityMw) {
    const mw = Number(facts.capacityMw);
    if (mw > 0) {
      rows.push({
        label: "Robots per MW",
        value: `~${(total / mw).toFixed(2)}`,
      });
    }
  }
  if (facts.robotSystem) {
    rows.push({ label: "Primary systems", value: facts.robotSystem });
  }
  if (facts.cleaningMode) {
    rows.push({ label: "Cleaning mode", value: facts.cleaningMode });
  }
  if (facts.procurement) {
    rows.push({ label: "Procurement", value: facts.procurement });
  }
  rows.push({
    label: "Monitoring",
    value: facts.nectyr
      ? "NECTYR fleet visibility and scheduled cycles"
      : "Inspection-led plans",
  });
  if (facts.commissioningYear) {
    rows.push({ label: "Commissioning", value: facts.commissioningYear });
  }
  if (facts.waterSavedPerYear) {
    rows.push({
      label: "Water saved",
      value: `~${facts.waterSavedPerYear} / year`,
    });
  }
  if (facts.additionalGenerationPerYear) {
    rows.push({
      label: "Generation uplift",
      value: `~${facts.additionalGenerationPerYear} / year`,
    });
  }
  if (facts.co2SavedPerYear) {
    rows.push({
      label: "CO₂ equivalent",
      value: `~${facts.co2SavedPerYear} / year`,
    });
  }
  return rows;
}

export function buildStatsTableHtml(facts: ProjectFactsJson): string {
  const mw = facts.capacityMw ?? "-";
  const state = facts.state || "-";
  return `<table>
<thead><tr><th>Metric</th><th>Reported value</th></tr></thead>
<tbody>
<tr><td>Nameplate capacity</td><td>${escapeHtml(String(mw))}&nbsp;MW</td></tr>
<tr><td>State / region</td><td>${escapeHtml(state)}</td></tr>
${formatRobotRows(facts)}
<tr><td>Primary systems</td><td>${escapeHtml(facts.robotSystem || "Taypro")}</td></tr>
<tr><td>Cleaning mode</td><td>${escapeHtml(facts.cleaningMode || "-")}</td></tr>
<tr><td>Procurement</td><td>${escapeHtml(facts.procurement || "-")}</td></tr>
<tr><td>Monitoring</td><td>${facts.nectyr ? "NECTYR fleet visibility and scheduled cycles" : "Inspection-led plans"}</td></tr>
${facts.commissioningYear ? `<tr><td>Commissioning</td><td>${escapeHtml(facts.commissioningYear)}</td></tr>` : ""}
${facts.waterSavedPerYear ? `<tr><td>Water saved</td><td>~${escapeHtml(facts.waterSavedPerYear)} / year</td></tr>` : ""}
${facts.additionalGenerationPerYear ? `<tr><td>Generation uplift</td><td>~${escapeHtml(facts.additionalGenerationPerYear)} / year</td></tr>` : ""}
${facts.co2SavedPerYear ? `<tr><td>CO₂ equivalent</td><td>~${escapeHtml(facts.co2SavedPerYear)} / year</td></tr>` : ""}
</tbody>
</table>
<p>Figures are site-reported. Validate against your SCADA, curtailment, and disclosure methodology before investment committee use.</p>`;
}

export function extractInlineImagesFromHtml(content: string): string[] {
  const urls: string[] = [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m[1]) urls.push(m[1]);
  }
  return [...new Set(urls)];
}

/** Remove inline figures/images so preserved images can be re-placed cleanly. */
function stripInlineFigures(html: string): string {
  return html
    .replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi, "")
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildProjectImageAlt(facts: ProjectFactsJson): string {
  const loc = facts.location?.trim();
  const mw = facts.capacityMw ? `${facts.capacityMw} MW ` : "";
  const base = loc
    ? `${loc} ${mw}solar plant, Taypro robotic panel cleaning`
    : "Taypro robotic solar panel cleaning, utility-scale plant in India";
  return escapeHtml(base.slice(0, 140));
}

export function composeProjectContent(
  facts: ProjectFactsJson,
  sections: ProjectSectionsJson,
  options?: { preservedInlineImages?: string[] }
): string {
  const parts: string[] = [];

  parts.push("<h2>Executive summary</h2>");
  parts.push(stripInlineFigures(sections.executiveSummary) || "<p></p>");

  parts.push("<h2>Site statistics at a glance</h2>");
  parts.push(buildStatsTableHtml(facts));

  const narrative = sections.narrative
    .filter((section) => section.bodyHtml?.trim() || section.id !== "peers")
    .map((section) => ({
      ...section,
      bodyHtml: stripInlineFigures(section.bodyHtml || ""),
    }));

  // Preserved images are deduped (extractInlineImagesFromHtml uses a Set), and
  // all inline figures have been stripped from section bodies above, so each
  // image is rendered exactly once.
  const images = options?.preservedInlineImages ?? [];

  const alt = buildProjectImageAlt(facts);
  const figure = (src: string) =>
    `<figure><img src="${escapeHtml(src)}" alt="${alt}" /></figure>`;

  // Spread images across narrative sections instead of clustering them at the end.
  const insertAfter = new Array<number>(narrative.length).fill(0);
  if (narrative.length > 0 && images.length > 0) {
    for (let j = 0; j < images.length; j++) {
      const pos = Math.min(
        narrative.length - 1,
        Math.max(0, Math.floor(((j + 0.5) * narrative.length) / images.length))
      );
      insertAfter[pos]++;
    }
  }

  let imgIdx = 0;
  for (let i = 0; i < narrative.length; i++) {
    const section = narrative[i]!;
    parts.push(`<h2>${escapeHtml(section.heading)}</h2>`);
    parts.push(section.bodyHtml.trim() || "<p></p>");
    for (let k = 0; k < insertAfter[i]!; k++) {
      if (imgIdx < images.length) parts.push(figure(images[imgIdx++]!));
    }
  }

  // No narrative sections to host images: fall back to a trailing block.
  while (imgIdx < images.length) {
    parts.push(figure(images[imgIdx++]!));
  }

  return parts.join("\n");
}

/** Remove executive summary + stats blocks when rendering structured stats separately (optional). */
export function stripComposedStatsSection(html: string): string {
  return html.replace(
    /<h2[^>]*>\s*Site statistics at a glance\s*<\/h2>[\s\S]*?(?=<h2[^>]*>|$)/i,
    ""
  );
}

/** Narrative word count excluding stats table block. */
export function countNarrativeWords(
  sections: ProjectSectionsJson
): number {
  const html = [
    sections.executiveSummary, ...sections.narrative.map((n) => n.bodyHtml),
  ].join(" ");
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain ? plain.split(" ").filter(Boolean).length : 0;
}
