/**
 * Build structured facts_json from a normalized Excel row (matches ProjectFactsJson).
 */

function parseRobotCount(value) {
  const n = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function parseMw(value) {
  const n = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function buildFactsJsonFromXlsxRow(row) {
  const facts = {
    location: row.location || undefined,
    state: row.state || undefined,
    capacityMw: parseMw(row.capacityMw),
    arrayType: row.arrayType || undefined,
    commissioningYear: row.commissioningYear || undefined,
    automaticRobots: parseRobotCount(row.automaticRobots),
    semiAutomaticRobots: parseRobotCount(row.semiAutomaticRobots),
    robotSystem: row.robotSystem || undefined,
    cleaningMode: row.cleaningMode || undefined,
    procurement: row.procurement || undefined,
    nectyr: /nectyr/i.test(row.monitoring || ""),
    soiling: row.soiling || undefined,
    omChallenge: row.omChallenge || undefined,
    waterLabour: row.waterLabour || undefined,
    waterSavedPerYear: row.waterSavedDisplay || undefined,
    additionalGenerationPerYear: row.generationDisplay || undefined,
    co2SavedPerYear: row.co2Display || undefined,
    deploymentHighlight: row.highlight || undefined,
    primaryKeyword:
      row.primaryKeyword?.trim() || "solar panel cleaning robot India",
  };

  return Object.fromEntries(
    Object.entries(facts).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  );
}
