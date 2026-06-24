/** One owner URL per money-keyword cluster (prevents SERP cannibalization). */
export type MoneyPageCluster = {
  id: string;
  label: string;
  ownerPath: string;
  supportingPaths: readonly string[];
};

export const MONEY_PAGE_CLUSTERS: readonly MoneyPageCluster[] = [
  {
    id: "cleaning_cost_opex",
    label: "Cleaning cost / OPEX pricing",
    ownerPath: "/solar-cleaning-opex-pricing",
    supportingPaths: [
      "/solar-panel-cleaning-robot-price-calculator",
      "/solar-cleaning-capex-vs-opex",
      "/solar-panel-cleaning-system/solar-panel-cleaning-service",
    ],
  },
  {
    id: "national_cleaning_vendor",
    label: "National cleaning vendor",
    ownerPath: "/solar-panel-cleaning-service-india",
    supportingPaths: [
      "/solar-panel-cleaning-system",
      "/large-scale-solar-panel-cleaning",
    ],
  },
  {
    id: "opex_contract",
    label: "OPEX contract / SOP",
    ownerPath: "/solar-panel-cleaning-system/solar-panel-cleaning-service",
    supportingPaths: ["/solar-cleaning-opex-pricing"],
  },
  {
    id: "capex_robot_price",
    label: "CAPEX robot price",
    ownerPath: "/solar-panel-cleaning-robot-price-india",
    supportingPaths: ["/solar-panel-cleaning-robot-price-calculator"],
  },
  {
    id: "fleet_monitoring_eval",
    label: "Fleet monitoring (buyer evaluation)",
    ownerPath: "/solar-fleet-monitoring-software",
    supportingPaths: [
      "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
      "/solar-plant-data-intelligence",
    ],
  },
  {
    id: "nectyr_product",
    label: "NECTYR product portal",
    ownerPath:
      "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
    supportingPaths: ["/solar-fleet-monitoring-software"],
  },
  {
    id: "plant_intelligence",
    label: "Plant data intelligence",
    ownerPath: "/solar-plant-data-intelligence",
    supportingPaths: [
      "/solar-panel-cleaning-system/orion-plant-intelligence-platform",
      "/technology/ai-intelligence",
    ],
  },
  {
    id: "utility_om_hub",
    label: "Utility O&M hub",
    ownerPath: "/utility-scale-solar-operations",
    supportingPaths: [
      "/solar-om-services",
      "/large-scale-solar-panel-cleaning",
      "/enterprise-solar-cleaning-partnership",
    ],
  },
  {
    id: "manufacturer_india",
    label: "Robot manufacturer India",
    ownerPath: "/solar-cleaning-robot-manufacturer-india",
    supportingPaths: ["/company"],
  },
] as const;

export function resolveMoneyPageOwner(internalPath: string): MoneyPageCluster | null {
  const normalized = internalPath.split("?")[0] ?? internalPath;
  for (const cluster of MONEY_PAGE_CLUSTERS) {
    if (cluster.ownerPath === normalized) return cluster;
    if (cluster.supportingPaths.includes(normalized)) return cluster;
  }
  return null;
}

export function moneyPageClustersForAdmin(): {
  id: string;
  label: string;
  ownerPath: string;
  supportingPaths: string[];
}[] {
  return MONEY_PAGE_CLUSTERS.map((c) => ({
    id: c.id,
    label: c.label,
    ownerPath: c.ownerPath,
    supportingPaths: [...c.supportingPaths],
  }));
}
