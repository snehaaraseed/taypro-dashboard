import {
  FLEET_ESG_ASSUMPTIONS,
  type FleetEsgAssumptions,
} from "@/lib/esg/fleet-impact-assumptions";

export interface FleetEsgImpact {
  fleetCapacityMw: number;
  totalModules: number;
  waterSavedLitresAnnually: number;
  additionalGenerationKwhAnnually: number;
  additionalGenerationGwhAnnually: number;
  co2AvoidedKgAnnually: number;
  co2AvoidedMetricTonsAnnually: number;
  wetWashCyclesAvoidedAnnually: number;
  olympicPoolsOfWaterEquivalent: number;
}

/**
 * Annual fleet ESG impact vs traditional wet cleaning (directional, India utility norms).
 */
export function calculateFleetEsgImpact(
  assumptions: FleetEsgAssumptions = FLEET_ESG_ASSUMPTIONS
): FleetEsgImpact {
  const fleetCapacityMw = assumptions.fleetCapacityGw * 1000;
  const totalModules = fleetCapacityMw * assumptions.modulesPerMw;
  const waterSavedLitresAnnually =
    totalModules *
    assumptions.wetCleaningCyclesPerYear *
    assumptions.litresPerModulePerWetCycle;

  const capacityKw = assumptions.fleetCapacityGw * 1_000_000;
  const additionalGenerationKwhAnnually =
    capacityKw *
    assumptions.specificYieldKwhPerKw *
    assumptions.generationGainVsWetCleaning;
  const additionalGenerationGwhAnnually =
    additionalGenerationKwhAnnually / 1_000_000;

  const co2AvoidedKgAnnually =
    additionalGenerationKwhAnnually * assumptions.gridEmissionKgPerKwh;
  const co2AvoidedMetricTonsAnnually = co2AvoidedKgAnnually / 1000;

  const wetWashCyclesAvoidedAnnually =
    totalModules * assumptions.wetCleaningCyclesPerYear;

  const olympicPoolsOfWaterEquivalent =
    waterSavedLitresAnnually / assumptions.olympicPoolLitres;

  return {
    fleetCapacityMw,
    totalModules,
    waterSavedLitresAnnually,
    additionalGenerationKwhAnnually,
    additionalGenerationGwhAnnually,
    co2AvoidedKgAnnually,
    co2AvoidedMetricTonsAnnually,
    wetWashCyclesAvoidedAnnually,
    olympicPoolsOfWaterEquivalent,
  };
}
