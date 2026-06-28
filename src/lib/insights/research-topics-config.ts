import {
  periodToSlugSuffix,
  periodToTitleLabel,
} from "@/lib/insights/gsc-snapshots";

export type ResearchTopicId =
  | "roboticVsManual"
  | "waterlessProcurement"
  | "trackerOperations"
  | "capexVsOpex"
  | "soilingEconomics"
  | "vendorEvaluation"
  | "dustBeltOperations"
  | "amcVsOpex"
  | "fleetSoftware"
  | "moduleSafety"
  | "hybridPlants"
  | "gridCompliance";

export type ResearchTopicConfig = {
  id: ResearchTopicId;
  keyword: string;
  /** Base title without month/year suffix. */
  titleStem: string;
  angle: string;
  audience: string;
  description: string;
};

/** Twelve topics, one unique deep report per month (rotates annually). */
export const RESEARCH_TOPIC_QUEUE: ResearchTopicConfig[] = [
  {
    id: "roboticVsManual",
    keyword: "solar panel cleaning robot vs manual cleaning India utility scale",
    titleStem: "Robotic vs Manual Solar Cleaning at Utility Scale in India",
    angle: "MW-scale TCO, labour, water, coverage auditability, and contract SLAs",
    audience: "IPP asset owners and O&M leads",
    description:
      "Deep research on when robotic dry cleaning beats manual crews at 10–500 MW plants, labour economics, water use, fleet telemetry, and procurement proof.",
  },
  {
    id: "waterlessProcurement",
    keyword: "waterless solar panel cleaning system India MW scale",
    titleStem: "Waterless Solar Cleaning in India: Procurement & Performance",
    angle: "Water scarcity, dust belts, module safety, and vendor test methodology",
    audience: "EPC procurement and plant engineers",
    description:
      "How IPPs specify, pilot, and contract waterless robotic cleaning, dust removal claims, AR coating safety, and regional soiling windows.",
  },
  {
    id: "trackerOperations",
    keyword: "single axis tracker solar panel cleaning robot India operations",
    titleStem: "Single-Axis Tracker Cleaning in India: Operations & Economics",
    angle: "Tracker geometry, stow rules, night windows, wind aborts, fleet coverage",
    audience: "Tracker plant O&M and technical diligence teams",
    description:
      "Field-level factors for robotic cleaning on single-axis tracker plants, path validation, block-level PR, and commercial models.",
  },
  {
    id: "capexVsOpex",
    keyword: "solar cleaning robot capex vs opex managed service India",
    titleStem: "CAPEX Robots vs Managed Opex Cleaning: IPP Decision Guide",
    angle: "Balance sheet treatment, SLAs, fleet risk ownership, renewal economics",
    audience: "CFO, asset management, and procurement",
    description:
      "When to capitalize cleaning robots vs contract pay-per-clean Opex: TCO bands, audit trails, and who bears uptime risk.",
  },
  {
    id: "soilingEconomics",
    keyword: "solar panel soiling loss India utility scale cleaning frequency",
    titleStem: "Soiling Loss & Cleaning Economics on Indian Utility-Scale Solar",
    angle: "Dust belts, cleaning cycles, recovered MWh, hurdle rates",
    audience: "Asset managers and performance engineers",
    description:
      "Research framework for soiling-related generation loss, optimal cleaning frequency, and when passive loss exceeds cleaning budget.",
  },
  {
    id: "vendorEvaluation",
    keyword: "solar panel cleaning robot manufacturer India RFP evaluation",
    titleStem: "Evaluating Solar Cleaning Robot Vendors in India",
    angle: "Module clearance, uptime SLAs, fleet software, Made-in-India support",
    audience: "Procurement committees and technical advisors",
    description:
      "Structured vendor diligence for robotic cleaning at MW scale, proof requirements, red flags, and contract clauses.",
  },
  {
    id: "dustBeltOperations",
    keyword: "Rajasthan Gujarat solar plant soiling cleaning robot operations",
    titleStem: "Dust-Belt Solar O&M: Cleaning Strategy for Rajasthan & Gujarat",
    angle: "Pre-monsoon windows, PM10/dust events, water logistics, labour availability",
    audience: "Regional O&M heads and asset managers",
    description:
      "Regional deep dive on soiling regimes and cleaning operations in India’s highest-insolation, highest-dust corridors.",
  },
  {
    id: "amcVsOpex",
    keyword: "solar cleaning robot AMC annual maintenance contract India",
    titleStem: "Robot AMC vs Managed Opex: Hidden Costs & SLAs in India",
    angle: "Spares networks, response times, coverage guarantees, contract renewal traps",
    audience: "Commercial and O&M contract owners",
    description:
      "Compare robot AMC, CAPEX ownership, and fully managed Opex: what contracts actually cover after year one.",
  },
  {
    id: "fleetSoftware",
    keyword: "solar cleaning robot fleet management software monitoring India",
    titleStem: "Fleet Software & Cleaning Audit Trails for Utility-Scale Solar",
    angle: "Pass logs, wind interlocks, coverage maps, performance verification",
    audience: "O&M engineers and digital asset teams",
    description:
      "Why fleet telemetry is non-negotiable at MW scale, data fields IPPs should require before accepting cleaning invoices.",
  },
  {
    id: "moduleSafety",
    keyword: "solar module cleaning anti reflective coating robot safety India",
    titleStem: "Module Safety & Cleaning Methods: AR Coatings, Bifacial & Warranties",
    angle: "OEM guidance, brush contact, dual-pass vs single-pass, warranty risk",
    audience: "Technical diligence and EPC quality teams",
    description:
      "Research on cleaning-induced module risk, what module makers allow, and how vendors should prove compatibility.",
  },
  {
    id: "hybridPlants",
    keyword: "solar wind hybrid plant panel cleaning operations India",
    titleStem: "Cleaning Operations on Solar–Wind Hybrid & Multi-Block Plants",
    angle: "Mixed topography, scattered blocks, semi-automatic fleets, mobilization cost",
    audience: "Hybrid project developers and O&M integrators",
    description:
      "Operational models for non-uniform plants, when full automatic fleets vs semi-automatic HELYX-class tools win.",
  },
  {
    id: "gridCompliance",
    keyword: "solar plant performance ratio cleaning CEA guidelines India",
    titleStem: "Performance Ratio, CEA Expectations & Cleaning Accountability",
    angle: "PR degradation, soiling attribution, reporting, lender/IPP audit expectations",
    audience: "Performance engineers and asset management",
    description:
      "How cleaning ties to PR reporting, lender diligence, and accountability when generation underperforms.",
  },
];

export function pickResearchTopicForMonth(monthIndex: number): ResearchTopicConfig {
  const idx =
    ((monthIndex % RESEARCH_TOPIC_QUEUE.length) + RESEARCH_TOPIC_QUEUE.length) %
    RESEARCH_TOPIC_QUEUE.length;
  return RESEARCH_TOPIC_QUEUE[idx]!;
}

export function getResearchTopicById(id: ResearchTopicId): ResearchTopicConfig | null {
  return RESEARCH_TOPIC_QUEUE.find((t) => t.id === id) ?? null;
}

/** One slug per calendar month, guaranteed unique monthly report. */
export function buildMonthlyResearchSlug(period: string): string {
  return `solar-cleaning-research-${periodToSlugSuffix(period)}`;
}

export function buildMonthlyReportTitle(
  topic: ResearchTopicConfig,
  period: string
): string {
  return `${topic.titleStem}, ${periodToTitleLabel(period)} Research Report`;
}

export function buildMonthlyReportDescription(
  topic: ResearchTopicConfig,
  period: string
): string {
  return `${topic.description} (${periodToTitleLabel(period)} edition, web-grounded research for ${topic.audience}.)`;
}
