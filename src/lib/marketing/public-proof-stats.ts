/**
 * Approved public marketing proof (non-financial).
 * Do not add billing, bookings, raise, GM, or other diligence-only fields here.
 */
export const TAYPRO_PUBLIC_PROOF = {
  capacityGw: "5 GW+",
  /** Solar assets cleaned daily across the live fleet (operational throughput). */
  dailyCleaningCapacityGw: "5 GW+",
  sitesLive: "150+",
  /** 11,00,00,00,000 panels cleaned per year (public marketing figure). */
  panelsCleanedAnnually: "11B+",
  panelsCleanedAnnuallyRaw: 11_000_000_000,
  generationRecoveredGwh: "188 GWh+",
  waterSavedLitres: "700M+",
  co2ReducedTons: "93k+",
  cleaningEfficiency: "99%",
  warehouses: "8+",
  /** Current manufacturing throughput (public marketing figure). */
  manufacturingPerMonth: "600+",
} as const;

export type TayproPublicProofStat = {
  value: string;
  label: string;
};

/** Stat tiles for homepage and other marketing strips. */
export function buildTayproPublicProofStats() {
  const p = TAYPRO_PUBLIC_PROOF;
  return {
    robotCapacityDeployed: {
      value: p.capacityGw,
      label: "Robot Capacity Deployed",
    },
    dailyCleaningCapacityGw: {
      value: p.dailyCleaningCapacityGw,
      label: "Solar Assets Cleaned Daily",
    },
    plantInstallations: {
      value: p.sitesLive,
      label: "Sites Live",
    },
    panelsCleanedAnnually: {
      value: p.panelsCleanedAnnually,
      label: "Panels Cleaned Annually",
    },
    waterSavedAnnually: {
      value: p.waterSavedLitres,
      label: "Liters of Water Saved Annually",
    },
    extraCleanEnergyAnnually: {
      value: p.generationRecoveredGwh,
      label: "Additional Clean Solar Generation Annually",
    },
    co2ReducedAnnually: {
      value: p.co2ReducedTons,
      label: "Metric Tons Of CO2 Emission Reduced Annually",
    },
    robotsManufacturedPerMonth: {
      value: p.manufacturingPerMonth,
      label: "Robots Manufacturing Capacity per Month",
    },
    cleaningEfficiency: {
      value: p.cleaningEfficiency,
      label: "Cleaning Efficiency",
    },
    warehouses: {
      value: p.warehouses,
      label: "Warehouses in India",
    },
  } as const;
}
