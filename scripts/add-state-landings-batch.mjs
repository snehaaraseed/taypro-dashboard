#!/usr/bin/env node
/**
 * One-off: add Haryana, Delhi, West Bengal, Chhattisgarh state landing copy + CMS tags.
 */
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const ROOT = process.cwd();
const RESOURCE_LINKS = {
  link0Title: "Solar panel cleaning across regions of India",
  link0Href:
    "/blog/the-importance-of-solar-panel-cleaning-across-different-regions-of-india-tailoring-solutions-for-diverse-climates",
  link1Title: "Weather impact on module cleanliness in India",
  link1Href:
    "/blog/the-impact-of-weather-on-solar-panel-cleanliness-in-india-tips-for-optimal-performance",
  link2Title: "Cost-benefit analysis of cleaning services in India",
  link2Href:
    "/blog/cost-benefit-analysis-of-solar-panel-cleaning-services-in-india",
};

const NEW_STATES = {
  haryana: {
    meta: {
      title: "Solar Panel Cleaning Robot Haryana | Utility & C&I Plants",
      description:
        "Waterless solar panel cleaning robots for Haryana utility and industrial plants. Taypro at 14.9 MW Haryana, Shri Ganesh Industries, Suresh Cotton, and Thakkar sites — NYUMA semi-automatic and GLYDE fleets.",
      openGraphTitle: "Solar Panel Cleaning Robot Haryana | Taypro",
      openGraphDescription:
        "Robotic dry cleaning for Haryana solar — NCR-adjacent dust, industrial rooftops, and semi-automatic CAPEX programmes.",
    },
    hero: {
      eyebrow: "Haryana · Utility & industrial solar",
      title: "Solar Panel Cleaning Robot in Haryana",
      subtitle:
        "Haryana combines NCR-adjacent dust loading with fast-growing C&I and ground-mount capacity. Taypro waterless robots serve multi-megawatt utility blocks and textile-mill rooftops — with NYUMA semi-automatic portables and GLYDE on repeatable rows, backed by pan-India breakdown SLAs.",
    },
    soiling: {
      eyebrow: "Regional context",
      heading: "Dust, industrial particulate, and O&M in Haryana",
      p1: "Haryana's solar belt sits in a high-traffic dust corridor north of Delhi — fine particulate from roads, agriculture, and industry settles on modules faster than calendar wet-wash crews can cover, especially on scattered C&I rooftops.",
      p2: "Taypro's Haryana portfolio spans a 14.9 MW ground-mount programme and multiple one-megawatt-class textile and industrial rooftops using NYUMA semi-automatic portables with inspection-led block plans — waterless brushing without tanker logistics.",
      p3: "Owners in Haryana should require block-level cleaning proof, brush PM intervals for abrasive dust, and same-day breakdown response — standard Taypro utility and C&I inclusions.",
    },
    models: {
      body: "Haryana deployments mix utility-scale semi-automatic NYUMA on priority blocks with GLYDE on repeatable rooftop tables. The 14.9 MW Haryana programme uses semi-automatic density; Shri Ganesh Industries, Suresh Cotton, and Thakkar Chemical/Cotton sites run NYUMA or GLYDE on roof-top arrays under CAPEX ownership.",
      recommended:
        "Haryana RFQs should separate ground-mount row repeatability from irregular industrial rooftops — automatic GLYDE where paths are fixed, NYUMA portables where tables vary or phased rollout is planned.",
    },
    deployments: {
      heading: "Live Taypro robots in Haryana",
      p1: "Taypro's published Haryana case studies include a 14.9 MW ground-mount semi-automatic programme and several sub-megawatt industrial rooftops — proof that waterless robotics work beyond western desert mega-sites.",
      p2: "At Haryana 14.9 MW, Taypro deployed NYUMA semi-automatic robots with weekly block coverage and CAPEX procurement — a reference for owners comparing robot density against manual crew cost in the NCR dust belt.",
      p3: "Shri Ganesh Industries (0.3 MW), Suresh Cotton, and Thakkar Chemical/Cotton (1 MW each) show rooftop semi-automatic patterns with NYUMA and GLYDE — useful benchmarks for textile and process-industry RFQs.",
    },
    procurement: {
      heading: "CAPEX vs Taypro Opex in Haryana",
      p1: "Most Haryana C&I owners purchase NYUMA or GLYDE under CAPEX with Taypro commissioning and AMC — capitalising robots while keeping cleaning off the night-crew payroll.",
      p2: "Taypro Opex is available as pay-per-panel-cleaned service with reporting — an option when industrial sites need immediate cadence before capital committee approval on robot purchase.",
    },
    roiBand: {
      heading: "Robot price and payback for Haryana solar",
      p1: "Robot CAPEX in Haryana scales with MW, rooftop vs ground-mount layout, and semi-automatic vs automatic mix — industrial rooftops often land at lower per-MW robot counts than utility tables.",
      p2: "Use the India robot price guide for directional bands, then the ROI calculator with your tariff. Formal Haryana quotes require layout review by Taypro applications engineering.",
    },
    resources: RESOURCE_LINKS,
    faq: {
      q0: "Does Taypro deploy cleaning robots in Haryana?",
      a0: "Yes. Taypro has live Haryana deployments including a 14.9 MW ground-mount programme and industrial rooftops at Shri Ganesh Industries, Suresh Cotton, and Thakkar sites. Contact Taypro with your MW and layout for a proposal.",
      q1: "Which robots suit Haryana industrial rooftops?",
      a1: "NYUMA semi-automatic portables and GLYDE automatic units cover most Haryana rooftop tables — choice follows path repeatability and whether the owner wants nightly automatic passes or inspection-led weekly blocks.",
      q2: "Why waterless cleaning in Haryana?",
      a2: "Dry robotic cleaning avoids tanker water and wet-wash module risk while enabling more frequent cycles than manual crews — important in the NCR-adjacent dust corridor.",
      q3: "What does robot price look like for a Haryana plant?",
      a3: "Price depends on MW, layout, and automation level. See the India price guide and ROI calculator; formal quotes follow Taypro layout review.",
      q4: "Does Taypro offer Opex in Haryana?",
      a4: "Yes. Taypro Opex is pay-per-panel-cleaned with Taypro operating the fleet and reporting through NECTYR or agreed inspection logs.",
      q5: "How often should Haryana sites run robotic cleaning?",
      a5: "Cadence follows dust season and block priority — semi-automatic programmes typically use published weekly block plans; automatic rows may run denser post-harvest and pre-monsoon windows.",
      q6: "Does Taypro provide breakdown support in Haryana?",
      a6: "Yes. Taypro targets same-day on-site breakdown resolution across India with NECTYR remote diagnostics and regional spare inventory.",
      q7: "Can I benchmark Haryana against Rajasthan or UP peers?",
      a7: "Yes. Rajasthan multi-hundred-MW and Uttar Pradesh utility programmes provide larger-nameplate references for fleet sizing — useful alongside Haryana C&I rooftops in the same RFQ conversation.",
    },
  },
  delhi: {
    meta: {
      title: "Solar Panel Cleaning Robot Delhi | Rooftop & Institutional",
      description:
        "Solar panel cleaning robots in Delhi — Taypro at Parliament Delhi 0.7 MW rooftop with GLYDE automatic and NYUMA semi-automatic waterless fleets. Urban dust, tight logistics, pan-India service.",
      openGraphTitle: "Solar Panel Cleaning Robot Delhi | Taypro",
      openGraphDescription:
        "Waterless robotic cleaning for Delhi solar — institutional rooftops and urban soiling without wet-wash logistics.",
    },
    hero: {
      eyebrow: "Delhi · Institutional & rooftop solar",
      title: "Solar Panel Cleaning Robot in Delhi",
      subtitle:
        "Delhi's urban solar assets face road dust, construction particulate, and tight rooftop logistics. Taypro waterless robots at Parliament Delhi demonstrate automatic GLYDE and NYUMA semi-automatic cleaning on a flagship 0.7 MW rooftop — with pan-India breakdown SLAs and NECTYR fleet governance.",
    },
    soiling: {
      eyebrow: "Regional context",
      heading: "Urban soiling and rooftop O&M in Delhi",
      p1: "Delhi modules accumulate fine urban dust and episodic construction particulate — soiling that rewards frequent, non-abrasive dry cleaning without hauling wash water through secured campuses.",
      p2: "Taypro's Parliament Delhi deployment runs two GLYDE automatic robots with NYUMA semi-automatic support on a 0.7 MW rooftop — a reference for institutional owners who need audit-ready cleaning proof in the capital.",
      p3: "Delhi RFQs should specify rooftop access windows, security coordination, and same-day breakdown response — Taypro standard inclusions for NCR-adjacent programmes.",
    },
    models: {
      body: "Delhi rooftops with repeatable paths suit GLYDE automatic nightly passes; irregular tables or security-limited windows may use NYUMA semi-automatic portables with inspection protocols — the Parliament Delhi mix shows both on one campus.",
      recommended:
        "Capital-region RFQs should map row repeatability and access hours before finalising automatic vs semi-automatic robot counts.",
    },
    deployments: {
      heading: "Parliament Delhi and capital-region robotics",
      p1: "Taypro's Delhi portfolio centres on the Parliament Delhi 0.7 MW rooftop — an institutional reference for waterless robotic cleaning in a high-security urban environment.",
      p2: "The site runs GLYDE automatic robots with NYUMA semi-automatic gap-fill under CAPEX ownership — demonstrating that dry brushing meets governance and module-care requirements without wet-wash tankers.",
      p3: "Owners across the NCR belt can benchmark Parliament Delhi for rooftop fleet design, procurement, and O&M reporting before their own capital-region RFQ.",
    },
    procurement: {
      heading: "Commercial models for Delhi rooftops",
      p1: "CAPEX purchase with Taypro commissioning and AMC is the typical path for Delhi institutional rooftops — robots capitalised with block-level reporting through NECTYR.",
      p2: "Taypro Opex converts cleaning to pay-per-panel-cleaned service when owners need immediate cadence during commissioning or phased rooftop expansion.",
    },
    roiBand: {
      heading: "Robot price guidance for Delhi solar",
      p1: "Sub-megawatt urban rooftops carry different CAPEX intensity than utility deserts — robot counts follow path kilometres and access constraints, not MW alone.",
      p2: "Use the India price guide and ROI calculator; formal Delhi quotes require Taypro layout and access review.",
    },
    resources: RESOURCE_LINKS,
    faq: {
      q0: "Does Taypro deploy robots in Delhi?",
      a0: "Yes. Taypro has a live deployment at Parliament Delhi 0.7 MW rooftop. Contact Taypro with your site details for a capital-region proposal.",
      q1: "Can robots clean secured institutional rooftops in Delhi?",
      a1: "Yes. Parliament Delhi demonstrates Taypro waterless robots on a flagship secured rooftop — programmes coordinate access windows and inspection protocols with campus security.",
      q2: "GLYDE vs NYUMA on Delhi rooftops?",
      a2: "Repeatable paths suit GLYDE automatic passes; irregular tables or limited access windows may use NYUMA semi-automatic portables — Parliament Delhi uses both.",
      q3: "Why waterless cleaning in Delhi?",
      a3: "Dry robotic cleaning avoids wet-wash water logistics through urban campuses and enables more frequent cycles than manual crews in high-dust seasons.",
      q4: "What does robot price look like for a Delhi rooftop?",
      a4: "Price scales with layout, access, and automation mix. See the India price guide; formal quotes follow site review.",
      q5: "Does Taypro offer Opex in Delhi?",
      a5: "Yes. Taypro Opex is available for pay-per-panel-cleaned service with Taypro operating the fleet.",
      q6: "How is cleaning proof reported?",
      a6: "NECTYR provides schedules, cleaning logs, and fleet health monitoring — the same governance layer used on Parliament Delhi.",
      q7: "Can NCR owners outside Delhi use this reference?",
      a7: "Yes. Haryana and Uttar Pradesh programmes in Taypro's portfolio complement Delhi for NCR-belt RFQ benchmarking.",
    },
  },
  westBengal: {
    meta: {
      title: "Solar Panel Cleaning Robot West Bengal | Utility Plants",
      description:
        "Solar panel cleaning robots for West Bengal plants. Taypro at Sonar Bangla 1.4 MW — humid eastern soiling, NYUMA semi-automatic waterless cleaning, pan-India service.",
      openGraphTitle: "Solar Panel Cleaning Robot West Bengal | Taypro",
      openGraphDescription:
        "Waterless robotic cleaning for West Bengal solar — eastern humidity and agricultural particulate without wet-wash logistics.",
    },
    hero: {
      eyebrow: "West Bengal · Utility solar",
      title: "Solar Panel Cleaning Robot in West Bengal",
      subtitle:
        "West Bengal combines humid-season films with agricultural and industrial particulate — a soiling mix that rewards frequent non-abrasive dry cleaning. Taypro's Sonar Bangla 1.4 MW deployment runs NYUMA semi-automatic waterless robots with inspection-led block coverage.",
    },
    soiling: {
      eyebrow: "Regional context",
      heading: "Humidity, particulate, and O&M in West Bengal",
      p1: "Eastern India's humidity can bind dust and pollen into stubborn films on modules — distinct from arid western belts. Cleaning must stay non-abrasive through monsoon transitions without wet-wash water logistics.",
      p2: "At Sonar Bangla 1.4 MW, Taypro deployed NYUMA semi-automatic robots under CAPEX with weekly block plans — proof that waterless robotics work in West Bengal's humid operating envelope.",
      p3: "Developers in West Bengal should require damp-heat hardware validation, monsoon hold policies, and same-day breakdown SLAs — standard Taypro utility inclusions.",
    },
    models: {
      body: "West Bengal programmes at Sonar Bangla scale typically start with NYUMA semi-automatic portables on ground-mount blocks — balancing capital efficiency with inspection-led coverage before automatic density on repeatable rows.",
      recommended:
        "Eastern RFQs should specify brush PM for humid-season operation and whether semi-automatic weekly blocks or automatic nightly passes dominate the O&M model.",
    },
    deployments: {
      heading: "Sonar Bangla and West Bengal robotics",
      p1: "Taypro's published West Bengal case study is Sonar Bangla 1.4 MW — a ground-mount semi-automatic reference for eastern humidity and agricultural dust.",
      p2: "The site runs NYUMA semi-automatic robots with CAPEX procurement and structured block coverage — useful for owners comparing robot cadence against manual crew cost in Bengal's operating climate.",
      p3: "Browse the case study below for fleet sizing and procurement lessons before your West Bengal RFQ.",
    },
    procurement: {
      heading: "Commercial models for West Bengal plants",
      p1: "CAPEX purchase with Taypro commissioning and AMC is typical for Sonar Bangla-class programmes — robots capitalised with inspection or NECTYR reporting.",
      p2: "Taypro Opex offers pay-per-panel-cleaned service when eastern commissioning windows require immediate cadence before full CAPEX approval.",
    },
    roiBand: {
      heading: "Robot price guidance for West Bengal solar",
      p1: "Sub-5 MW eastern programmes carry different robots-per-MW economics than western mega-sites — size fleets from row maps, not MW alone.",
      p2: "Use the India price guide and ROI calculator; formal West Bengal quotes require Taypro layout review.",
    },
    resources: RESOURCE_LINKS,
    faq: {
      q0: "Does Taypro deploy robots in West Bengal?",
      a0: "Yes. Taypro has a live deployment at Sonar Bangla 1.4 MW. Contact Taypro with your plant MW and layout for a proposal.",
      q1: "Can Taypro robots handle West Bengal humidity?",
      a1: "Taypro hardware is TÜV NORD certified for damp-heat and dry-heat conditions — designed for monsoon and post-monsoon cycles in humid eastern climates.",
      q2: "Which robot fits West Bengal ground-mount plants?",
      a2: "NYUMA semi-automatic portables are the primary reference at Sonar Bangla; repeatable rows may add GLYDE automatic density as programmes scale.",
      q3: "Why waterless cleaning in West Bengal?",
      a3: "Dry robotic cleaning avoids wet-wash logistics and reduces module risk while enabling more frequent cycles than manual crews alone.",
      q4: "What does robot price look like for a Bengal plant?",
      a4: "CAPEX scales with MW, layout, and automation level. See the India price guide; formal quotes require layout review.",
      q5: "Does Taypro offer Opex in West Bengal?",
      a5: "Yes. Taypro Opex is available for pay-per-panel-cleaned service with Taypro operating the fleet.",
      q6: "How should Bengal plants handle monsoon holds?",
      a6: "After effective rain, robots often stand down to avoid redundant passes; post-monsoon weeks re-walk paths after vegetation or civil works.",
      q7: "Can Bengal owners benchmark eastern peers?",
      a7: "Yes. Tamil Nadu coastal programmes and Odisha-adjacent eastern belts provide complementary humid-climate references alongside Sonar Bangla.",
    },
  },
  chhattisgarh: {
    meta: {
      title: "Solar Panel Cleaning Robot Chhattisgarh | Utility Plants",
      description:
        "Solar panel cleaning robots for Chhattisgarh utility plants. Taypro at Sungazing 2.5 MW — central India dust, NYUMA and GLYDE semi-automatic waterless fleets, pan-India service.",
      openGraphTitle: "Solar Panel Cleaning Robot Chhattisgarh | Taypro",
      openGraphDescription:
        "Waterless robotic cleaning for Chhattisgarh solar — central Indian soiling without wet-wash logistics.",
    },
    hero: {
      eyebrow: "Chhattisgarh · Utility solar",
      title: "Solar Panel Cleaning Robot in Chhattisgarh",
      subtitle:
        "Chhattisgarh's central Indian solar belt shares dust-return patterns with neighbouring MP — fine particulate after harvest windows and dry-season peaks. Taypro waterless robots at Sungazing 2.5 MW run NYUMA and GLYDE semi-automatic fleets with block-level CAPEX programmes.",
    },
    soiling: {
      eyebrow: "Regional context",
      heading: "Central Indian dust and O&M in Chhattisgarh",
      p1: "Chhattisgarh modules face agricultural dust, road particulate, and seasonal peaks that outpace calendar wet-wash crews — especially on smaller utility blocks where tanker logistics add OPEX.",
      p2: "At Sungazing 2.5 MW, Taypro deployed five NYUMA semi-automatic robots with GLYDE support under CAPEX — a reference for central India semi-automatic density on ground-mount rows.",
      p3: "Owners in Chhattisgarh should require block-level cleaning proof, brush PM for abrasive dust, and pan-India breakdown SLAs — Taypro standard utility inclusions.",
    },
    models: {
      body: "Chhattisgarh programmes at Sungazing scale typically combine NYUMA semi-automatic portables for flexible block coverage with GLYDE where paths are repeatable — matching capital efficiency to dust-season cadence targets.",
      recommended:
        "Central India RFQs should map row repeatability and dust-season priority blocks before finalising semi-automatic vs automatic robot counts.",
    },
    deployments: {
      heading: "Sungazing and Chhattisgarh robotics",
      p1: "Taypro's published Chhattisgarh case study is Sungazing 2.5 MW — a ground-mount semi-automatic reference for central Indian dust and CAPEX procurement.",
      p2: "The site runs five NYUMA semi-automatic robots with GLYDE in the fleet mix — useful for owners comparing robot density against manual crew cost in Chhattisgarh's operating climate.",
      p3: "Browse the case study below and benchmark against Madhya Pradesh peers such as Agar for RFQ conversations in central India.",
    },
    procurement: {
      heading: "CAPEX vs Taypro Opex in Chhattisgarh",
      p1: "CAPEX purchase with Taypro commissioning and AMC is typical for Sungazing-class programmes — robots capitalised with block schedules and inspection or NECTYR reporting.",
      p2: "Taypro Opex offers pay-per-panel-cleaned service when owners need immediate cadence before capital committee sign-off on robot purchase.",
    },
    roiBand: {
      heading: "Robot price guidance for Chhattisgarh solar",
      p1: "Two-to-five MW central India programmes carry different robots-per-MW economics than western mega-sites — size fleets from row maps and automation mix.",
      p2: "Use the India price guide and ROI calculator; formal Chhattisgarh quotes require Taypro layout review.",
    },
    resources: RESOURCE_LINKS,
    faq: {
      q0: "Does Taypro deploy robots in Chhattisgarh?",
      a0: "Yes. Taypro has a live deployment at Sungazing 2.5 MW. Contact Taypro with your plant MW and layout for a proposal.",
      q1: "Which robots suit Chhattisgarh ground-mount plants?",
      a1: "NYUMA semi-automatic portables are the primary reference at Sungazing; GLYDE supports repeatable rows — Madhya Pradesh Agar provides a larger automatic peer benchmark.",
      q2: "Why waterless cleaning in Chhattisgarh?",
      a2: "Dry robotic cleaning avoids tanker water and wet-wash module risk while enabling more frequent cycles through dust-season peaks.",
      q3: "What does robot price look like for a Chhattisgarh plant?",
      a3: "Price depends on MW, layout, and automation level. See the India price guide; formal quotes follow layout review.",
      q4: "Does Taypro offer Opex in Chhattisgarh?",
      a4: "Yes. Taypro Opex is pay-per-panel-cleaned with Taypro operating the fleet and reporting through NECTYR or agreed inspection logs.",
      q5: "How often should Chhattisgarh plants run robotic cleaning?",
      a5: "Cadence follows dust season — semi-automatic programmes use published weekly block plans; automatic rows may tighten cadence pre-monsoon.",
      q6: "Does Taypro provide breakdown support in Chhattisgarh?",
      a6: "Yes. Taypro targets same-day on-site breakdown resolution across India with regional spare inventory and NECTYR remote diagnostics.",
      q7: "Can Chhattisgarh owners benchmark MP programmes?",
      a7: "Yes. Agar 200 MW and other Madhya Pradesh deployments provide larger-nameplate central India references alongside Sungazing.",
    },
  },
};

// Merge into state-landings.json for all locales
const locales = ["en", "hi", "ar", "ja", "bn"];
for (const loc of locales) {
  const file = path.join(ROOT, "messages/pages", loc, "state-landings.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  Object.assign(data.StateLandingsPage, NEW_STATES);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  console.log("Updated", file);
}

// solar-system.json stateGuides keys
const guideKeys = {
  haryana: "Haryana",
  delhi: "Delhi",
  westBengal: "West Bengal",
  chhattisgarh: "Chhattisgarh",
};
for (const loc of locales) {
  const file = path.join(ROOT, "messages/pages", loc, "solar-system.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const guides = data.SolarSystemPage?.indianConditions?.stateGuides;
  if (guides) {
    Object.assign(guides, guideKeys);
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
    console.log("Updated stateGuides in", file);
  }
}

// site-map.json labels
const siteMapKeys = {
  stateHaryanaLabel: "Solar Panel Cleaning Robot — Haryana",
  stateHaryanaTitle: "Solar panel cleaning robots in Haryana",
  stateDelhiLabel: "Solar Panel Cleaning Robot — Delhi",
  stateDelhiTitle: "Solar panel cleaning robots in Delhi",
  stateWestBengalLabel: "Solar Panel Cleaning Robot — West Bengal",
  stateWestBengalTitle: "Solar panel cleaning robots in West Bengal",
  stateChhattisgarhLabel: "Solar Panel Cleaning Robot — Chhattisgarh",
  stateChhattisgarhTitle: "Solar panel cleaning robots in Chhattisgarh",
};
for (const loc of locales) {
  const file = path.join(ROOT, "messages/pages", loc, "site-map.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  Object.assign(data.SiteMapPage.links, siteMapKeys);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  console.log("Updated site-map in", file);
}

// CMS project detail chips
const db = new Database(path.join(ROOT, "data/cms.sqlite"));
const updates = [
  { slug: "shri-ganesh-industries-03-mw", state: "Haryana" },
  { slug: "suresh-cotton-1-mw", state: "Haryana" },
  { slug: "thakkar-chemical-1-mw", state: "Haryana" },
  { slug: "thakkar-cotton-1-mw", state: "Haryana" },
  { slug: "sungazing-25-mw", state: "Chhattisgarh" },
  { slug: "sonar-bangla-14-mw", state: "West Bengal" },
];

const select = db.prepare(
  "SELECT id, details FROM projects WHERE slug = ? AND locale = 'en'"
);
const update = db.prepare(
  "UPDATE projects SET details = ?, updated_at = ? WHERE id = ?"
);

for (const { slug, state } of updates) {
  const row = select.get(slug);
  if (!row) {
    console.warn("Missing project:", slug);
    continue;
  }
  const details = JSON.parse(row.details || "[]");
  if (!details.some((d) => String(d).toLowerCase() === state.toLowerCase())) {
    const mwIdx = details.findIndex((d) => /mw/i.test(String(d)));
    if (mwIdx >= 0) details.splice(mwIdx + 1, 0, state);
    else details.unshift(state);
    update.run(JSON.stringify(details), new Date().toISOString(), row.id);
    console.log("Tagged", slug, "->", state);
  }
}

db.close();
console.log("Done.");
