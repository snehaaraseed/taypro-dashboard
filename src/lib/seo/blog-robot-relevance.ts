/**
 * When blog automation should pitch Taypro robots vs stay equipment/O&M neutral.
 */
export function isRobotPromotionRelevant(input: {
  primaryKeyword?: string | null;
  title?: string | null;
  angleId?: string | null;
  category?: string | null;
}): boolean {
  const text = [
    input.primaryKeyword ?? "",
    input.title ?? "",
    input.angleId ?? "",
    input.category ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const robotPatterns = [
    /\b(cleaning|panel cleaning)\s+robot\b/,
    /\bsolar panel cleaning robot\b/,
    /\bautomatic solar panel cleaning\b/,
    /\bsemi[- ]?automatic solar\b/,
    /\bwaterless\s+(cleaning\s+)?robot\b/,
    /\brobotic cleaning\b/,
    /\bbrush\s+vs\.?\s+robot\b/,
    /\brobot\s+vs\.?\s+brush\b/,
    /\brobot\b.*\b(manual|brush|clean)/,
    /\b(manual|brush|clean).*\brobot\b/,
    /\btracker\b.*\b(robot|clean)/,
    /\b(robot|clean).*\btracker\b/,
    /\bcleaning (frequency|method|equipment|system|service)\b/,
    /\b(panel|solar) cleaning\b/,
    /\bsoiling\b/,
    /\bperformance ratio\b|\bpr loss\b/,
    /\bopex\s+(service|cleaning)\b/,
    /\bpost[- ]commissioning\b/,
  ];

  if (robotPatterns.some((p) => p.test(text))) {
    return true;
  }

  const equipmentOnlyPatterns = [
    /\bpanel price\b/,
    /\bphotovoltaic panels price\b/,
    /\bmodule price\b/,
    /\bmanufacturer(s)?\b/,
    /\binverter(s)?\b/,
    /\btracker supplier\b/,
    /\bpv panel roof\b/,
    /\brooftop pv\b/,
    /\bmodule spec\b/,
  ];

  if (equipmentOnlyPatterns.some((p) => p.test(text))) {
    return false;
  }

  return false;
}
