import { NextResponse } from "next/server";
import {
  buildRoiProjectionSeries,
  calculateRoi,
  toPublicRoiResult,
} from "@/lib/roi-calculator/calculate-roi-core";
import { resolveRoiMarket } from "@/lib/roi-calculator/market-profiles";
import type {
  AutomationLevel,
  InstallationType,
  PlantType,
  RoiCalculationInput,
} from "@/lib/roi-calculator/roi-types";
import { isActiveLocale } from "@/i18n/markets";

const PLANT_TYPES = new Set<PlantType>(["groundMount", "rooftop"]);
const INSTALLATION_TYPES = new Set<InstallationType>([
  "fixedTilt",
  "seasonalTilt",
  "singleAxisTracker",
]);
const AUTOMATION_LEVELS = new Set<AutomationLevel>(["automatic", "semiAutomatic"]);

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function parseInput(body: unknown): RoiCalculationInput | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  const plantType = raw.plantType;
  const installationType = raw.installationType;
  const automationLevel = raw.automationLevel;

  if (
    typeof plantType !== "string" ||
    !PLANT_TYPES.has(plantType as PlantType) ||
    typeof installationType !== "string" ||
    !INSTALLATION_TYPES.has(installationType as InstallationType) ||
    typeof automationLevel !== "string" ||
    !AUTOMATION_LEVELS.has(automationLevel as AutomationLevel)
  ) {
    return null;
  }

  const plantCapacityMW = Number(raw.plantCapacityMW);
  const plantCapacityKW = Number(raw.plantCapacityKW);
  const electricityTariff = Number(raw.electricityTariff);
  const moduleCapacityWp = Number(raw.moduleCapacityWp);

  if (
    !Number.isFinite(plantCapacityMW) ||
    !Number.isFinite(plantCapacityKW) ||
    !Number.isFinite(electricityTariff) ||
    !Number.isFinite(moduleCapacityWp)
  ) {
    return null;
  }

  const market = resolveRoiMarket(
    isActiveLocale(String(raw.locale ?? "en")) ? String(raw.locale) : "en",
    typeof raw.visitorCountry === "string" ? raw.visitorCountry : null
  );

  return {
    plantType: plantType as PlantType,
    installationType: installationType as InstallationType,
    automationLevel: automationLevel as AutomationLevel,
    plantCapacityMW: clamp(plantCapacityMW, 1, 10_000),
    plantCapacityKW: clamp(plantCapacityKW, 100, 10_000),
    electricityTariff: clamp(
      electricityTariff,
      market.tariffMin,
      market.tariffMax
    ),
    moduleCapacityWp: clamp(moduleCapacityWp, 1, 1000),
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const locale = isActiveLocale(String(raw.locale ?? "en"))
    ? String(raw.locale)
    : "en";
  const market = resolveRoiMarket(
    locale,
    typeof raw.visitorCountry === "string" ? raw.visitorCountry : null
  );

  const input = parseInput(body);
  if (!input) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const full = calculateRoi(input, market);
  const projection = buildRoiProjectionSeries(full);

  return NextResponse.json({
    results: toPublicRoiResult(full),
    projection,
  });
}
