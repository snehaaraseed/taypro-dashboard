import { NextResponse } from "next/server";
import {
  buildRoiProjectionSeries,
  resolveProcurementModel,
  resolveRoiCalculation,
  toPublicRoiResult,
} from "@/lib/roi-calculator/calculate-roi-core";
import {
  OPEX_CYCLES_PER_MONTH_MAX,
  OPEX_CYCLES_PER_MONTH_MIN,
} from "@/lib/roi-calculator/calculate-opex-core";
import { resolveRoiMarket } from "@/lib/roi-calculator/market-profiles";
import type {
  AutomationLevel,
  InstallationType,
  PlantType,
  ProcurementModel,
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
const PROCUREMENT_MODELS = new Set<ProcurementModel>(["capex", "opex"]);

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

  const procurementModelRaw = raw.procurementModel;
  const procurementModel =
    typeof procurementModelRaw === "string" &&
    PROCUREMENT_MODELS.has(procurementModelRaw as ProcurementModel)
      ? (procurementModelRaw as ProcurementModel)
      : "capex";

  const cleaningCyclesPerMonth = Number(raw.cleaningCyclesPerMonth);

  const market = resolveRoiMarket(
    isActiveLocale(String(raw.locale ?? "en")) ? String(raw.locale) : "en",
    typeof raw.visitorCountry === "string" ? raw.visitorCountry : null
  );

  const parsed: RoiCalculationInput = {
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
    procurementModel:
      plantType === "rooftop" || procurementModel === "capex"
        ? "capex"
        : "opex",
  };

  if (parsed.procurementModel === "opex") {
    parsed.cleaningCyclesPerMonth = Number.isFinite(cleaningCyclesPerMonth)
      ? clamp(
          cleaningCyclesPerMonth,
          OPEX_CYCLES_PER_MONTH_MIN,
          OPEX_CYCLES_PER_MONTH_MAX
        )
      : 5;
  }

  return parsed;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const input = parseInput(body);
  if (!input) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const procurementModel = resolveProcurementModel(input);
  const normalizedInput = { ...input, procurementModel };
  const market = resolveRoiMarket(
    isActiveLocale(String((body as Record<string, unknown>).locale ?? "en"))
      ? String((body as Record<string, unknown>).locale)
      : "en",
    typeof (body as Record<string, unknown>).visitorCountry === "string"
      ? String((body as Record<string, unknown>).visitorCountry)
      : null
  );

  const full = resolveRoiCalculation(normalizedInput, market);
  const projection = buildRoiProjectionSeries(full);

  return NextResponse.json({
    results: toPublicRoiResult(full),
    projection,
    procurementModel,
  });
}
