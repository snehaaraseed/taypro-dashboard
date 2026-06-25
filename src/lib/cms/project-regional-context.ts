import type { ProjectFactsJson } from "@/lib/cms/project-facts-types";
import { STATE_LANDING_PAGES, type StateLandingId } from "@/lib/seo/state-landing-config";

const INDIAN_STATES: Array<[string, string]> = [
  ["madhya pradesh", "Madhya Pradesh"],
  ["maharashtra", "Maharashtra"],
  ["karnataka", "Karnataka"],
  ["rajasthan", "Rajasthan"],
  ["uttar pradesh", "Uttar Pradesh"],
  ["gujarat", "Gujarat"],
  ["gujrat", "Gujarat"],
  ["tamil nadu", "Tamil Nadu"],
  ["telangana", "Telangana"],
  ["andhra pradesh", "Andhra Pradesh"],
  ["punjab", "Punjab"],
  ["haryana", "Haryana"],
  ["delhi", "Delhi"],
  ["west bengal", "West Bengal"],
  ["chhattisgarh", "Chhattisgarh"],
];

const DISTRICT_STATE_HINTS: Array<[RegExp, string]> = [
  [/ahmadnagar|nandur|sangli|yavatmal|kolhapur|solapur|pune|nashik|ratlam/i, "Maharashtra"],
  [/agar|ujjain|indore|gwalior|dewas|banda/i, "Madhya Pradesh"],
  [/yadgir|ballari|belagavi|mysuru|kmf/i, "Karnataka"],
  [/lucknow|agra|meerut|prayagraj/i, "Uttar Pradesh"],
  [/jodhpur|jaipur|bikaner|akhadana|bhadla|chhayan/i, "Rajasthan"],
  [/chennai|coimbatore/i, "Tamil Nadu"],
  [/jamnagar|rajkot|bhuj|bhavnagar|bachau|neneva|maya/i, "Gujarat"],
  [/soyegaon/i, "Maharashtra"],
];

const STATE_REGIONAL_NOTES: Record<
  string,
  { soiling: string; water: string; om: string }
> = {
  Rajasthan: {
    soiling:
      "Arid Thar-edge exposure drives rapid dust accumulation from storms and fine particulates; downwind rows often show PR dips before visual soiling is obvious.",
    water:
      "Water-scarce districts make wet-wash tanker logistics costly and unreliable at multi-hundred-MW scale.",
    om: "Manual crews cannot match dust-return frequency across vast block counts without block-level completion proof.",
  },
  Gujarat: {
    soiling:
      "Inland cementitious dust and coastal film dust create uneven soiling; haul roads and quarry-adjacent strings degrade first.",
    water:
      "Groundwater and tanker availability constrain repeatable wet washing during peak dust months.",
    om: "Large IPP portfolios need logged cleaning cadence to explain month-to-month PR variance to finance.",
  },
  "Madhya Pradesh": {
    soiling:
      "Central India semi-arid belts see sharp pre-monsoon soiling swings; fine dust returns quickly after dry spells.",
    water:
      "Remote sites face long tanker routes and runoff management for wet washes.",
    om: "Episodic manual washing could not stabilise PR across hundreds of hectares.",
  },
  Maharashtra: {
    soiling:
      "Agricultural dust, road grit, and humidity cycles create uneven string-level soiling patterns.",
    water:
      "Water logistics and night crew scheduling compete with vegetation and civil O&M windows.",
    om: "Supervisors lacked per-block proof of which strings were actually cleaned each cycle.",
  },
  Karnataka: {
    soiling:
      "Dry-season red-soil particulate and short rains produce mixed rinse-and-spot patterns on module glass.",
    water:
      "Wet washing competes with water use for O&M and local supply constraints on larger sites.",
    om: "Logged completion data helps explain PR month to month when rains partially rinse some blocks.",
  },
  "Uttar Pradesh": {
    soiling:
      "Plain dust and post-harvest particulate load affect downwind strings and access-road edges first.",
    water:
      "Tanker-dependent wet programmes struggle to scale with block count during peak dust weeks.",
    om: "Finance teams need attributable cleaning baselines separate from curtailment and weather.",
  },
  "Tamil Nadu": {
    soiling:
      "Coastal film dust inland and local traffic grit create border-row soiling before plant centre.",
    water:
      "Salinity and water management favour dry brushing over repeated flooding washes.",
    om: "Night cleaning windows must coordinate with grid export and maintenance calendars.",
  },
  Haryana: {
    soiling:
      "Agricultural and construction dust from the NCR belt raises soiling on exposed rows.",
    water: "Water availability for module washing is limited relative to plant acreage.",
    om: "Robotic programmes reduce labour mobilisation across scattered blocks.",
  },
  Delhi: {
    soiling:
      "Urban-edge particulate and smog film accumulate on modules between rain events.",
    water: "Compact urban-edge sites rarely justify tanker-heavy wet wash programmes.",
    om: "High visibility assets need auditable cleaning records for stakeholders.",
  },
  "West Bengal": {
    soiling:
      "Humidity, agricultural burn seasons, and monsoon transitions create variable soiling slopes.",
    water: "Monsoon rinsing reduces some cycles but mud spotting persists on access corridors.",
    om: "Seasonal intensity shifts require flexible block prioritisation.",
  },
  Chhattisgarh: {
    soiling:
      "Mining and haul-road dust raise downwind soiling on utility arrays.",
    water: "Interior sites face long water logistics for wet washing.",
    om: "Robotic dry cleaning reduces dependence on seasonal crew scaling.",
  },
  "Andhra Pradesh": {
    soiling:
      "Coastal and inland dust fronts create sharp post-storm soiling on border blocks.",
    water: "Water stress in interior districts favours waterless programmes.",
    om: "Fleet visibility helps prioritise blocks with the steepest inverter trends.",
  },
  Telangana: {
    soiling:
      "Semi-arid dust return between rains drives PR drift on downwind hectares.",
    water: "Tanker economics limit wet-wash frequency at utility scale.",
    om: "Scheduled dry cycles replace reactive wash campaigns.",
  },
  Punjab: {
    soiling:
      "Agricultural harvest dust and road grit raise seasonal soiling loads.",
    water: "Irrigation-adjacent logistics differ from desert sites but wet wash still scales poorly.",
    om: "Robotics stabilise cleaning spend versus emergency crew calls.",
  },
};

const STATE_TO_LANDING: Record<string, StateLandingId> = {
  Rajasthan: "rajasthan",
  Gujarat: "gujarat",
  "Madhya Pradesh": "madhyaPradesh",
  Karnataka: "karnataka",
  "Andhra Pradesh": "andhraPradesh",
  Maharashtra: "maharashtra",
  "Uttar Pradesh": "uttarPradesh",
  "Tamil Nadu": "tamilNadu",
  Haryana: "haryana",
  Delhi: "delhi",
  "West Bengal": "westBengal",
  Chhattisgarh: "chhattisgarh",
};

export type RegionalContext = {
  state: string;
  soilingSummary: string;
  waterConstraints: string;
  omChallenges: string[];
  stateLandingPath: string | null;
  suggestedPeerSlugs: string[];
};

export function inferStateFromProjectText(
  location?: string,
  title?: string,
  details?: string[]
): string {
  const parts = [location, title, ...(details ?? [])].filter(Boolean);
  const joined = parts.join(" ").toLowerCase();

  for (const [needle, name] of INDIAN_STATES) {
    if (joined.includes(needle)) return name;
  }
  for (const [re, name] of DISTRICT_STATE_HINTS) {
    if (parts.some((p) => p && re.test(p))) return name;
  }
  if (location) {
    const segments = location.split(",").map((p) => p.trim()).filter(Boolean);
    if (segments.length >= 2) {
      const last = segments[segments.length - 1].replace(/india/i, "").trim();
      if (last.length > 3 && !/^\d/.test(last)) return last;
    }
  }
  return "";
}

export function getRegionalContext(state: string): RegionalContext | null {
  const normalized = state.trim();
  if (!normalized) return null;

  const notes = STATE_REGIONAL_NOTES[normalized] ?? {
    soiling: `${normalized} operating conditions shape dust return, wind holds, and block priority queues.`,
    water: "Water logistics for wet washing often limit cleaning frequency during peak soiling weeks.",
    om: "Manual programmes struggle to deliver repeatable block coverage with auditable completion records.",
  };

  const landingId = STATE_TO_LANDING[normalized];
  const landing = landingId ? STATE_LANDING_PAGES[landingId] : null;

  return {
    state: normalized,
    soilingSummary: notes.soiling,
    waterConstraints: notes.water,
    omChallenges: [notes.om],
    stateLandingPath: landing?.path ?? null,
    suggestedPeerSlugs: landing?.featuredSlugs?.slice(0, 3) ?? [],
  };
}

export function enrichFactsWithRegionalContext(
  facts: ProjectFactsJson
): ProjectFactsJson {
  const state =
    facts.state?.trim() ||
    inferStateFromProjectText(facts.location, facts.location, []);
  const regional = state ? getRegionalContext(state) : null;
  if (!regional) return { ...facts, state: state || facts.state };

  return {
    ...facts,
    state: regional.state,
    soiling: facts.soiling?.trim() || regional.soilingSummary,
    waterLabour:
      facts.waterLabour?.trim() ||
      `${regional.waterConstraints} ${regional.omChallenges[0] ?? ""}`.trim(),
    omChallenge: facts.omChallenge?.trim() || regional.omChallenges[0],
    peerSlugs:
      facts.peerSlugs && facts.peerSlugs.length > 0
        ? facts.peerSlugs
        : regional.suggestedPeerSlugs,
  };
}
