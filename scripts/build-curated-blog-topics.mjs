#!/usr/bin/env node
/**
 * Builds data/curated-blog-topics.json from the editorial topic backlog.
 * Run: node scripts/build-curated-blog-topics.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "data", "curated-blog-topics.json");

/** @type {{ title: string; category: string }[]} */
const TOPICS = [
  // Editorial priorities (user-provided clusters)
  { title: "PM Surya Ghar Yojana: Impact on Rooftop O&M Budgets in India", category: "government_schemes" },
  { title: "Solar Subsidy Schemes 2026 and Cleaning Cost Planning for IPPs", category: "government_schemes" },
  { title: "Monsoon-Proofing Your Solar Cleaning Robot Fleet for Indian Plants", category: "weather_extreme" },
  { title: "Cyclone and Extreme Weather Protocols for Tracker Cleaning Systems", category: "weather_extreme" },
  { title: "AMC Contracts for Cleaning Robots: What to Negotiate in India", category: "financing_amc" },
  { title: "Financing Models for Solar Cleaning Robots: Lease vs Buy", category: "financing_amc" },
  { title: "Insurance Considerations for Robotic Solar Cleaning Assets", category: "financing_amc" },
  { title: "Bird Droppings and Organic Soiling: Cleaning Challenges on Utility Plants", category: "soiling_organic" },
  { title: "C&I Rooftop Cleaning ROI: Case Studies for Indian Commercial Solar", category: "ci_rooftop" },
  { title: "Cold Storage and Warehouse Rooftop Solar Cleaning Economics", category: "ci_rooftop" },
  { title: "Cybersecurity in Solar Fleet Monitoring Software for O&M Teams", category: "cybersecurity" },
  { title: "Data Privacy in Cloud-Connected Cleaning Robots on Indian Sites", category: "cybersecurity" },
  { title: "Case Study: 100MW+ Plant Cleaning Transformation in India", category: "case_studies" },
  { title: "Case Study: Rooftop C&I Cleaning Robot Deployment in India", category: "case_studies" },
  { title: "Module Degradation vs Soiling Loss: How to Separate the Two in PR Data", category: "degradation" },
  { title: "Labor Safety Compliance: Manual vs Robotic Solar Cleaning Risk in India", category: "labor_safety" },
  { title: "Floating Solar Panel Cleaning Challenges for Indian Reservoir Projects", category: "environment_geo" },
  { title: "Cleaning Robots for Bifacial Modules on Utility-Scale Plants", category: "technical_analysis" },
  { title: "Cleaning Strategy for High-Efficiency TOPCon and HJT Modules", category: "technical_analysis" },
  { title: "Punjab Solar Panel Cleaning Robot Deployment: State O&M Guide", category: "regional_state" },
  { title: "Telangana Solar Cleaning Services and Robot Adoption Trends", category: "regional_state" },
  { title: "Odisha Solar O&M Landscape and Cleaning Automation", category: "regional_state" },
  { title: "Bihar Solar Panel Maintenance and Cleaning Programs", category: "regional_state" },
  { title: "Agrivoltaics Cleaning Constraints and Robot Path Planning", category: "agrivoltaics" },
  { title: "Dust Composition Analysis: Region-Wise Soiling Chemistry in India", category: "environment_geo" },
  { title: "Coastal Solar Plants: Salt Deposition Cleaning Challenges", category: "environment_geo" },
  { title: "Desert Solar Plants: Sand Abrasion vs Cleaning Frequency", category: "environment_geo" },
  { title: "Robotic Cleaning for Elevated and Canal-Top Solar in India", category: "environment_geo" },
  { title: "Cleaning Frequency Optimization Using Weather Data on MW Plants", category: "predictive_data" },
  { title: "Predictive Soiling Models Using Satellite and AQI Data", category: "predictive_data" },
  { title: "IoT Sensors in Solar O&M: Beyond Cleaning Robots", category: "predictive_data" },
  { title: "Battery Technology Comparison for Solar Cleaning Robots", category: "batteries_hardware" },
  { title: "Solar Cleaning Robot Battery Life and Replacement Cost Planning", category: "batteries_hardware" },
  { title: "Robot Fleet Sizing Calculator: How Many Robots per MW", category: "fleet_technology" },
  { title: "Downtime Cost of Delayed Cleaning on Utility Solar Plants", category: "technical_analysis" },
  { title: "RESCO and OPEX Solar Models: Cleaning Service Bundling", category: "esg_finance" },
  { title: "Green Bonds and ESG Reporting: Role of Cleaning Data", category: "esg_finance" },
  { title: "Carbon Credit Calculation from Soiling Loss Reduction", category: "esg_finance" },
  { title: "Solar Plant Commissioning Checklist Including Cleaning Infrastructure", category: "commissioning_design" },
  { title: "Row Spacing and Design for Cleaning Robot Compatibility", category: "commissioning_design" },
  { title: "Retrofit-Friendly Cleaning Robots for Legacy Indian Solar Plants", category: "commissioning_design" },
  { title: "Tracker vs Fixed-Tilt: Cleaning Robot Compatibility Guide", category: "commissioning_design" },
  { title: "Wireless Mesh Networking for Solar Robot Fleets: Technical Guide", category: "fleet_technology" },
  { title: "AI-Based Image Recognition for Soiling Detection on Solar Plants", category: "predictive_data" },
  { title: "Drone-Based Soiling Inspection vs Ground Cleaning Robots", category: "predictive_data" },
  { title: "Cleaning Robot Maintenance Schedule Best Practices", category: "vendor_procurement" },
  { title: "Common Failure Points in Solar Cleaning Robots", category: "vendor_procurement" },
  { title: "Spare Parts and After-Sales Service for Cleaning Robots in India", category: "vendor_procurement" },
  { title: "Vendor Evaluation Checklist for Solar Cleaning Robots", category: "vendor_procurement" },
  { title: "RFP Template for Solar Cleaning Robot Procurement in India", category: "vendor_procurement" },
  { title: "Solar Asset Management Software Comparison for O&M Leads", category: "fleet_technology" },
  { title: "SCADA Integration with Cleaning Robot Fleets", category: "fleet_technology" },
  { title: "Performance Guarantee Clauses in Solar Cleaning Contracts", category: "contracts_legal" },
  { title: "Liquidated Damages for Generation Loss Due to Soiling", category: "contracts_legal" },
  { title: "Water Scarcity Regions: Waterless Cleaning Necessity in India", category: "environment_geo" },
  { title: "Waterless Cleaning Environmental Impact for Utility Solar", category: "environment_geo" },
  { title: "Cleaning Robot Noise and Community Impact Near Residential Rooftops", category: "ci_rooftop" },
  { title: "Rooftop Cleaning Robot Installation Constraints: Parapet and Access", category: "ci_rooftop" },
  { title: "Solar Panel Cleaning for EV Charging Station Canopies", category: "niche_verticals" },
  { title: "Solar Cleaning for Airport and Large Infrastructure Installations", category: "niche_verticals" },
  { title: "Railway Solar Installations: Cleaning Logistics in India", category: "niche_verticals" },
  { title: "Solar Carport Cleaning Solutions for C&I Sites", category: "niche_verticals" },
  { title: "Cleaning Robot ROI for Sub-1MW Rooftop Plants", category: "ci_rooftop" },
  { title: "Comparing Manual Labor Cost Inflation vs Robotic Cleaning", category: "financing_amc" },
  { title: "Solar Plant O&M Staffing Models with Robotic Cleaning", category: "plant_operations" },
  { title: "Remote Monitoring vs On-Site O&M Teams: Cost Comparison", category: "plant_operations" },
  { title: "Cleaning Robot Uptime SLA Benchmarks for Indian IPPs", category: "contracts_legal" },
  { title: "Dust Storm Early Warning Systems for Solar Plants in India", category: "weather_extreme" },
  { title: "Humidity and Dew Formation: Impact on Cleaning Schedules", category: "weather_extreme" },
  { title: "Winter Fog Impact on Soiling in North Indian Solar Plants", category: "weather_extreme" },
  { title: "Summer Heat Impact on Panel Efficiency and Cleaning Needs", category: "weather_extreme" },
  { title: "Solar Plant Decommissioning and Cleaning Robot Asset Recovery", category: "plant_operations" },
  { title: "Second-Life Use of Solar Cleaning Robot Components", category: "manufacturing_policy" },
  { title: "Robotics Manufacturing in India: Make in India for Solar Cleaning", category: "manufacturing_policy" },
  { title: "Import Substitution: Domestic vs Imported Cleaning Robots", category: "manufacturing_policy" },
  { title: "ALMM and DCR Compliance for Cleaning Robot Components", category: "manufacturing_policy" },
  { title: "Patents in Solar Cleaning Technology: Industry Landscape", category: "manufacturing_policy" },
  { title: "R&D Trends in Solar Cleaning Robotics 2026", category: "manufacturing_policy" },
  { title: "University and CSIR Partnerships in Solar Cleaning Innovation", category: "workforce" },
  { title: "Women in Solar O&M Workforce and Robotics Transition", category: "workforce" },
  { title: "Career Paths in Solar Robotics Engineering in India", category: "workforce" },
  { title: "Training Programs for O&M Teams on Robotic Cleaning Systems", category: "workforce" },
  { title: "Skilling Gap in Indian Solar Cleaning Robotics Industry", category: "workforce" },
  { title: "Solar Plant Audit Checklist: Cleaning-Related Red Flags", category: "audit_diligence" },
  { title: "Due Diligence Checklist for Solar Asset Acquisition: Cleaning Infra", category: "audit_diligence" },
  { title: "IPP Portfolio-Wide Cleaning Strategy Standardization", category: "audit_diligence" },
  { title: "Multi-Site Fleet Management Dashboard Best Practices", category: "fleet_technology" },
  { title: "Benchmarking Cleaning Robot ROI: 5MW vs 50MW vs 500MW", category: "technical_analysis" },
  { title: "Generation Loss Quantification Methodology Using PR Data", category: "technical_analysis" },
  { title: "Soiling Ratio vs Performance Ratio: Technical Explainer", category: "technical_analysis" },
  { title: "Cleaning Cycle Optimization Using Generation Forecast Data", category: "predictive_data" },
  { title: "Solar Plant Cleaning During Grid Curtailment Periods", category: "plant_operations" },
  { title: "Impact of Cleaning Frequency on Module Warranty Claims", category: "financing_amc" },
  { title: "Module Manufacturer Warranty Clauses Tied to Cleaning Practices", category: "financing_amc" },
  { title: "Robotic Cleaning and LCOE Impact on Utility Solar in India", category: "technical_analysis" },
  { title: "Solar Cleaning Robot Lifecycle Cost Analysis: 5-Year TCO", category: "financing_amc" },
  { title: "Comparing Indian vs Global Solar Cleaning Robot Pricing", category: "vendor_procurement" },
  { title: "Export Potential: Indian-Made Cleaning Robots for MENA and Africa", category: "manufacturing_policy" },
  { title: "Future of Autonomous Solar O&M in India: 2030 Outlook", category: "plant_operations" },
  { title: "Net Metering Rules State-Wise and Impact on Soiling ROI", category: "government_schemes" },
  { title: "Solar Plant Land Lease Agreements: Cleaning Access Clauses", category: "contracts_legal" },
  { title: "Distressed Solar Assets: Cleaning Infrastructure as Valuation Lever", category: "audit_diligence" },
  { title: "Solar Plant Refinancing: O&M Track Record Importance", category: "esg_finance" },
  { title: "Bank Loan Covenants Tied to O&M and Cleaning Performance", category: "esg_finance" },
  { title: "Green Hydrogen Plants: Co-Located Solar Cleaning Requirements", category: "niche_verticals" },
  { title: "Solar-Wind Hybrid Plants: Cleaning Robot Adaptation", category: "niche_verticals" },
  { title: "BESS-Integrated Solar Plants: Cleaning Schedule Coordination", category: "plant_operations" },
  { title: "Virtual Power Plant Models: Clean Panels and Dispatch Accuracy", category: "plant_operations" },
  { title: "Open Access Solar: Cleaning SLAs for Group Captive Users", category: "contracts_legal" },
  { title: "Third-Party Sale Solar Plants: Cleaning Contract Structuring", category: "contracts_legal" },
  { title: "Solar Plant EPC Handover Checklist: Cleaning System Commissioning", category: "commissioning_design" },
  { title: "Module Cleaning Frequency vs Bifacial Gain Optimization", category: "technical_analysis" },
  { title: "Anti-Soiling Coatings vs Robotic Cleaning: Cost Comparison", category: "technical_analysis" },
  { title: "Nano-Coating Technology for Solar Panels: Complement or Competitor", category: "technical_analysis" },
  { title: "Hydrophobic Glass Coatings and Cleaning Robot Compatibility", category: "technical_analysis" },
  { title: "Robotic Cleaning Brush Material Science: Microfiber Innovations", category: "batteries_hardware" },
  { title: "Cleaning Robot Chassis Material: Corrosion Resistance in Coastal Sites", category: "batteries_hardware" },
  { title: "Solar Tracker Gearbox Wear from Cleaning Robot Traffic", category: "commissioning_design" },
  { title: "Cleaning Robot Docking Station Design Standards", category: "commissioning_design" },
  { title: "Row-to-Row Transfer Mechanisms for Solar Cleaning Robots", category: "fleet_technology" },
  { title: "Cleaning Robot Charging Infrastructure Planning for MW Plants", category: "fleet_technology" },
  { title: "Solar Plant Fencing and Security Integration with Robot Fleets", category: "cybersecurity" },
  { title: "CCTV and Robot Fleet Monitoring Integration on Solar Sites", category: "cybersecurity" },
  { title: "Weather Station Integration for Automated Cleaning Triggers", category: "predictive_data" },
  { title: "Pyranometer Data Use in Soiling Loss Calculation", category: "technical_analysis" },
  { title: "Satellite-Based Soiling Estimation vs Ground Sensors", category: "predictive_data" },
  { title: "Solar Plant Vegetation Management vs Cleaning Robot Access", category: "plant_operations" },
  { title: "Rodent and Pest Damage to Cleaning Robot Cabling", category: "vendor_procurement" },
  { title: "Lightning Protection for Robotic Cleaning Systems", category: "commissioning_design" },
  { title: "Grounding and Earthing Standards for Solar Robot Fleets", category: "commissioning_design" },
  { title: "Solar Plant Fire Safety and Cleaning Robot Battery Risks", category: "labor_safety" },
  { title: "Thermal Runaway Prevention in Cleaning Robot Batteries", category: "batteries_hardware" },
  { title: "IP66 and IP67 Ratings Explained for Outdoor Solar Robotics", category: "batteries_hardware" },
  { title: "Solar Cleaning Robot Testing Standards and IEC Compliance", category: "manufacturing_policy" },
  { title: "BIS Certification for Indian-Made Solar Cleaning Robots", category: "manufacturing_policy" },
  { title: "Quality Control Processes in Cleaning Robot Manufacturing", category: "manufacturing_policy" },
  { title: "Vendor Lock-In Risks in Fleet Monitoring Software", category: "cybersecurity" },
  { title: "API Integrations: Connecting Fleet Platforms to ERP Systems", category: "fleet_technology" },
  { title: "Solar Asset Digital Twin Technology for O&M Teams", category: "predictive_data" },
  { title: "Predictive Maintenance Algorithms for Solar Cleaning Robots", category: "predictive_data" },
  { title: "Machine Learning for Optimal Cleaning Route Planning", category: "predictive_data" },
  { title: "Computer Vision for Panel Crack Detection During Cleaning Passes", category: "predictive_data" },
  { title: "Thermal Imaging Integration in Cleaning Robot Operations", category: "predictive_data" },
  { title: "Electroluminescence Testing vs Routine Cleaning Inspection", category: "technical_analysis" },
  { title: "Solar Panel Micro-Crack Detection During Robotic Operation", category: "technical_analysis" },
  { title: "Hotspot Prevention Through Regular Robotic Cleaning", category: "technical_analysis" },
  { title: "PID and Soiling Correlation on Indian Utility Plants", category: "degradation" },
  { title: "LID vs Soiling: Differentiating Degradation Factors in PR Data", category: "degradation" },
  { title: "Solar Plant Asset Tagging and RFID for Robot Fleet Tracking", category: "fleet_technology" },
  { title: "Blockchain for Solar O&M Record Verification", category: "cybersecurity" },
  { title: "Digital MRV for Carbon Credits from Cleaning Programs", category: "esg_finance" },
  { title: "Solar Plant Cleaning Data for Green Certificate Trading", category: "esg_finance" },
  { title: "REC Generation Accuracy and Panel Cleanliness", category: "esg_finance" },
  { title: "Solar Plant PPA Penalty Clauses Tied to Generation Shortfall", category: "contracts_legal" },
  { title: "Force Majeure Clauses and Cleaning Service Continuity", category: "contracts_legal" },
  { title: "Cleaning Robot Supply Chain Resilience for Indian OEMs", category: "manufacturing_policy" },
  { title: "Component Sourcing Diversification for Cleaning Robot Manufacturers", category: "manufacturing_policy" },
  { title: "Semiconductor Chip Shortage Impact on Solar Robotics Production", category: "manufacturing_policy" },
  { title: "Battery Cell Sourcing: Domestic vs Imported for Cleaning Robots", category: "batteries_hardware" },
  { title: "India PLI Scheme and Solar Robotics Manufacturing", category: "manufacturing_policy" },
  { title: "Special Economic Zones for Solar Hardware Manufacturing", category: "manufacturing_policy" },
  { title: "Export-Import Policy Changes Affecting Robotics Components", category: "manufacturing_policy" },
  { title: "Currency Fluctuation Impact on Cleaning Robot Pricing in India", category: "financing_amc" },
  { title: "Solar Plant Insurance Claims Involving Panel Damage from Cleaning", category: "financing_amc" },
  { title: "Liability Frameworks for Robot-Caused Panel Damage", category: "contracts_legal" },
  { title: "Force-Based Sensors Preventing Panel Micro-Damage During Cleaning", category: "batteries_hardware" },
  { title: "Cleaning Pressure Calibration: Avoiding Glass Stress Fractures", category: "technical_analysis" },
  { title: "Robotic Arm Precision Engineering for Panel Safety", category: "batteries_hardware" },
  { title: "Solar Plant O&M KPIs Beyond Generation: Cleanliness Index", category: "technical_analysis" },
  { title: "Benchmarking Indian Solar Cleaning Against MENA Region Practices", category: "case_studies" },
  { title: "Middle East Solar Cleaning Standards vs India", category: "case_studies" },
  { title: "Africa Solar Market: Cleaning Robot Opportunity Analysis", category: "case_studies" },
  { title: "Southeast Asia Solar Cleaning Market Comparison", category: "case_studies" },
  { title: "Cleaning Robot Deployment in High-Altitude Solar: Ladakh Guide", category: "environment_geo" },
  { title: "Cold Climate Solar Cleaning: Snow and Ice Removal Robotics", category: "weather_extreme" },
  { title: "Frost Formation Impact on Early Morning Solar Generation", category: "weather_extreme" },
  { title: "Dew-Triggered Cleaning Cycle Timing Optimization", category: "weather_extreme" },
  { title: "Solar Plant Water Table Depletion: Case for Waterless Cleaning", category: "environment_geo" },
  { title: "CSR Angle: Water Conservation Through Robotic Solar Cleaning", category: "esg_finance" },
  { title: "Sustainability Reporting Frameworks Referencing Cleaning Technology", category: "esg_finance" },
  { title: "GRI and BRSR Disclosures for Solar O&M Water Savings", category: "esg_finance" },
  { title: "Circular Economy: Recycling Decommissioned Cleaning Robots", category: "manufacturing_policy" },
  { title: "E-Waste Management for Robotic Solar Hardware in India", category: "manufacturing_policy" },
  { title: "Solar Plant Biodiversity Impact and Cleaning Robot Footprint", category: "environment_geo" },
  { title: "Agrivoltaic Crop Selection Compatible with Robotic Cleaning Paths", category: "agrivoltaics" },
  { title: "Rural Employment from Solar O&M Robotics Sector in India", category: "workforce" },
  { title: "Skill India Certification for Robotic O&M Technicians", category: "workforce" },
  { title: "Apprenticeship Models for Solar Robotics Workforce", category: "workforce" },
  { title: "Women-Led SHGs vs Robotics Shift in Solar Housekeeping", category: "workforce" },
  { title: "Solar Plant Community Engagement During Robot Deployment", category: "workforce" },
  { title: "Public Perception of Robots vs Human Jobs at Rural Solar Sites", category: "workforce" },
  { title: "Union and Labor Relations in Robotic Cleaning Transition", category: "labor_safety" },
  { title: "Government Tenders Favoring Automated O&M Bidders", category: "government_schemes" },
  { title: "State Electricity Board Empanelment for Cleaning Robot Vendors", category: "government_schemes" },
  { title: "DISCOM Interconnection Standards Affecting Cleaning Downtime", category: "government_schemes" },
  { title: "Grid Code Compliance and Cleaning Schedule Alignment", category: "government_schemes" },
  { title: "Solar Plant Curtailment Trends and Cleaning ROI Recalculation", category: "technical_analysis" },
  { title: "Merchant Power Plants: Cleaning Economics Without PPA Certainty", category: "financing_amc" },
  { title: "2030 Solar Capacity Targets and Projected Cleaning Robot Demand", category: "plant_operations" },
  { title: "Textile Industry Captive Solar Plants: Cleaning Strategy Guide", category: "niche_verticals" },
];

const CATEGORY_DOMAIN = {
  government_schemes: "plant_operations",
  weather_extreme: "plant_operations",
  financing_amc: "cleaning_economics",
  soiling_organic: "soiling_pr",
  ci_rooftop: "cleaning_economics",
  cybersecurity: "plant_operations",
  case_studies: "plant_operations",
  degradation: "soiling_pr",
  labor_safety: "plant_operations",
  regional_state: "plant_operations",
  agrivoltaics: "plant_operations",
  environment_geo: "soiling_pr",
  fleet_technology: "plant_operations",
  predictive_data: "soiling_pr",
  batteries_hardware: "module_procurement",
  esg_finance: "cleaning_economics",
  commissioning_design: "tracker_geometry",
  vendor_procurement: "cleaning_methods",
  contracts_legal: "cleaning_economics",
  niche_verticals: "plant_operations",
  manufacturing_policy: "module_procurement",
  workforce: "plant_operations",
  audit_diligence: "plant_operations",
  technical_analysis: "soiling_pr",
  plant_operations: "plant_operations",
};

const CATEGORY_INTENT = {
  government_schemes: "risk_compliance",
  weather_extreme: "technical_howto",
  financing_amc: "financial_roi",
  soiling_organic: "troubleshooting_problem",
  ci_rooftop: "financial_roi",
  cybersecurity: "risk_compliance",
  case_studies: "technical_howto",
  degradation: "technical_howto",
  labor_safety: "risk_compliance",
  regional_state: "technical_howto",
  agrivoltaics: "technical_howto",
  environment_geo: "troubleshooting_problem",
  fleet_technology: "technical_howto",
  predictive_data: "technical_howto",
  batteries_hardware: "comparison_alternative",
  esg_finance: "financial_roi",
  commissioning_design: "technical_howto",
  vendor_procurement: "comparison_alternative",
  contracts_legal: "risk_compliance",
  niche_verticals: "technical_howto",
  manufacturing_policy: "risk_compliance",
  workforce: "technical_howto",
  audit_diligence: "risk_compliance",
  technical_analysis: "technical_howto",
  plant_operations: "technical_howto",
};

const ANGLE = {
  technical_howto: "default-guide",
  financial_roi: "cost-mw-india",
  comparison_alternative: "default-compare",
  risk_compliance: "warranty-safe",
  troubleshooting_problem: "under-clean",
};

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function deriveKeyword(title) {
  const stop = new Set([
    "the", "a", "an", "for", "and", "or", "in", "on", "to", "vs", "how",
    "what", "why", "when", "your", "from", "with", "india", "indian", "solar",
  ]);
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));
  return words.slice(0, 6).join(" ").trim() || "solar cleaning robot india";
}

const seen = new Set();
const topics = [];
for (const row of TOPICS) {
  const key = row.title.toLowerCase().trim();
  if (seen.has(key)) continue;
  seen.add(key);
  const category = row.category;
  const intentFamily = CATEGORY_INTENT[category] ?? "technical_howto";
  const domainId = CATEGORY_DOMAIN[category] ?? "plant_operations";
  const slug = slugify(row.title);
  topics.push({
    id: `curated-${slug}`.slice(0, 100),
    title: row.title,
    primaryKeyword: deriveKeyword(row.title),
    category,
    domainId,
    intentFamily,
    angleId: ANGLE[intentFamily] ?? "default-guide",
    serpGap:
      "Editorial backlog topic: utility-scale and C&I solar O&M in India with robotic cleaning angle.",
    query: `${row.title} India utility solar O&M`,
    priority: 85,
  });
}

const payload = {
  version: 1,
  description:
    "Curated editorial blog topics for Taypro automation. Enqueued to discovered-briefs.json via admin or refill.",
  generatedAt: new Date().toISOString(),
  topicCount: topics.length,
  topics,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log(`Wrote ${topics.length} curated topics → ${outPath}`);
