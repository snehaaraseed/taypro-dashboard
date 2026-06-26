#!/usr/bin/env node
/**
 * Deep-merge SEO-rich content blocks into Tier 1 buyer-intent EN pages.
 * Run: node scripts/enrich-buyer-intent-en-content.mjs
 * Then: node scripts/localize-buyer-intent-pages.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function saveJson(rel, data) {
  fs.writeFileSync(
    path.join(ROOT, rel),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8"
  );
}

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

const ENRICHMENTS = {
  "solar-panel-cleaning-service-india": {
    ServiceIndiaPage: {
      hero: {
        subtitle:
          "Taypro is India's largest deployed robotic solar cleaning company: 9 GW+ of panels cleaned monthly across utility and commercial plants, waterless dry cycles, and pay-per-panel OPEX or robot CAPEX for IPPs, CPSUs, SECI-tendered projects, and C&I asset owners. One accountable solar panel cleaning company India — robots, operators, spares, and NECTYR fleet software.",
      },
      prose: {
        eyebrow: "Why India needs a national cleaning partner",
        heading:
          "Solar panel cleaning service India — beyond local brush crews",
        p1: "India's utility solar fleet now exceeds 100 GW, concentrated in Rajasthan, Gujarat, Maharashtra, Karnataka, and Madhya Pradesh — the same states where soiling losses reach 8–25% annually when cleaning stays calendar-based. A solar panel cleaning company India buyers trust must operate at production scale: multi-robot fleets, pan-India spares, and audit-ready reporting — not ad-hoc labour contracts.",
        p2: "Taypro manufactures waterless cleaning robots in Pune and deploys them under two commercial models. CAPEX: purchase GLYDE, GLYDE-X, NYUMA, NYUMA-X, or HELYX with structured AMC. OPEX: Taypro owns the fleet, deploys operators, and bills monthly for panels actually cleaned — reconciled through NECTYR telemetry.",
        p3: "Whether you procure through an IPP asset manager, state discom, or EPC handover team, Taypro provides a single vendor for field execution and fleet data. Electrical O&M, inverter repair, and tracker mechanical work remain with your existing contractor — we own the cleaning layer that directly moves performance ratio.",
        p4: "Procurement teams evaluating solar cleaning service India vendors should compare fleet scale, state coverage, billing transparency, and integration with plant monitoring — not just robot brochures. Taypro publishes indicative OPEX pricing, an ROI calculator, and 132+ project references for due diligence.",
        linkPrimary: "Request service quote",
        linkPrimaryHref: "/contact",
        linkSecondary: "Compare OPEX vs CAPEX pricing",
        linkSecondaryHref: "/solar-cleaning-opex-pricing",
      },
      cards: {
        card4: {
          title: "Waterless dry cleaning — no tanker logistics",
          body: "Wet-wash cleaning consumes 140,000+ litres per MW per year in water-stressed solar belts. Taypro's robotic dry cleaning eliminates tanker dependency while enabling 3–10 cycles per month — the cadence needed to neutralise soiling in Rajasthan and Gujarat dust belts.",
        },
        card5: {
          title: "Integration with plant performance data",
          body: "NECTYR block-level cleaning logs tie each cycle to array coverage and exceptions. Asset managers correlate cleaning events with PR recovery — closing the gap between SCADA alarms and field action.",
        },
      },
      steps: {
        eyebrow: "How mobilisation works",
        heading: "From RFQ to first cleaning cycle on your plant",
        subheading:
          "A structured onboarding path used on 50–360 MW utility deployments across India.",
        step0Title: "Share plant profile & current cleaning method",
        step0Body:
          "Provide MW capacity, state, installation type (fixed tilt, seasonal tilt, or single-axis tracker), module wattage, current manual or robotic cleaning spend, and target PR or soiling assumptions. Taypro assigns an engineering lead within one business day.",
        step1Title: "Site soiling study & cycle recommendation",
        step1Body:
          "Engineers assess dust sources, wind patterns, row geometry, tracker behaviour, and seasonal rain probability. Output: recommended 3–10 waterless dry cycles per month and robot model selection (GLYDE, GLYDE-X, NYUMA, NYUMA-X, or HELYX).",
        step2Title: "Commercial proposal — CAPEX or OPEX",
        step2Body:
          "Receive robot fleet sizing, indicative pricing (per-panel OPEX rates or CAPEX bands), SLA framework, and mobilisation timeline. Finance teams can run parallel scenarios in the ROI calculator.",
        step3Title: "Fleet deployment & NECTYR onboarding",
        step3Body:
          "Operators mobilise with robots, connectivity (LTE, mesh, or LoRa as designed), cleaning SOPs, path maps, and rest zones. NECTYR portal activated for scheduling, coverage audits, and monthly settlement.",
        step4Title: "Monthly reconciliation & programme review",
        step4Body:
          "Billing aligns to verified panels cleaned per NECTYR logs. Quarterly reviews adjust cycle count for monsoon, harvest dust, or construction activity nearby.",
      },
      eligibility: {
        eyebrow: "Fit assessment",
        title: "Who Taypro's India cleaning service is built for",
        forTitle: "Ideal fit",
        for0:
          "Utility ground-mount and solar park plants from ~10 MW upward (many programmes at 50–300 MW)",
        for1:
          "IPPs, CPSUs, SECI projects, and asset managers seeking pay-per-panel-cleaned OPEX or robot CAPEX with AMC",
        for2:
          "Sites in Rajasthan, Gujarat, MP, Maharashtra, Karnataka, or Andhra Pradesh with recurring soiling and PR drift",
        for3:
          "Procurement teams that need NECTYR audit trails for lenders, SECI, or internal O&M governance",
        notForTitle: "Typically not a fit",
        not0:
          "Single-home residential rooftop arrays (see our rooftop robot guide for C&I)",
        not1:
          "One-off manual pressure-washing without a recurring robotic programme",
        not2:
          "Full-plant EPC maintenance scope (inverters, HV, tracker mechanical) — we partner on cleaning only",
      },
      highlight: {
        heading: "The procurement question",
        lead: "Can your cleaning vendor prove which panels were cleaned last night?",
        body: "Manual crew contracts rarely provide block-level coverage evidence. OPEX bills against NECTYR telemetry — panels cleaned, routes completed, exceptions logged. That is what IPPs and lenders ask for at 100 MW scale.",
      },
      proseSecondary: {
        eyebrow: "Regional soiling context",
        heading:
          "Solar cleaning demand by state — why pan-India service matters",
        p1: "Rajasthan and Gujarat account for the largest share of India's utility solar capacity and the highest documented soiling ratios — cumulative dust films that suppress 8–25% of annual generation without cadence-driven cleaning. Maharashtra and Karnataka add coastal humidity and agricultural dust patterns that differ from arid belt physics.",
        p2: "A solar panel cleaning service India partner must mobilise regionally — not fly in crews from one state for every breakdown. Taypro maintains service hubs, spare parts inventory, and operator pools across twelve state deployment guides linked below.",
        p3: "Explore state-specific robotic cleaning context for Rajasthan, Gujarat, Maharashtra, and your plant location before finalising cycle count and commercial model.",
        linkPrimary: "Solar O&M services scope",
        linkPrimaryHref: "/solar-om-services",
        linkSecondary: "Large-scale MW deployment",
        linkSecondaryHref: "/large-scale-solar-panel-cleaning",
      },
      resources: {
        eyebrow: "Further reading",
        heading: "Guides for solar cleaning procurement in India",
        link0Title: "Solar panel cleaning cost per MW",
        link0Href: "/solar-cleaning-opex-pricing",
        link1Title: "Robotic vs manual cleaning comparison",
        link1Href: "/compare/solar-panel-cleaning-robot-vs-manual-cleaning",
        link2Title: "Utility-scale solar operations context",
        link2Href: "/utility-scale-solar-operations",
      },
      faq: {
        q8: "How does Taypro compare to other solar cleaning companies in India?",
        a8: "Evaluate fleet scale (Taypro cleans 9 GW+ monthly), product breadth (fixed tilt, tracker, rooftop, semi-auto), NECTYR reporting, pan-India service, and both CAPEX and OPEX models. Compare pages for Taypro vs Indian competitors are available on our site.",
        q9: "Does Taypro clean single-axis tracker plants?",
        a9: "Yes. GLYDE-X and NYUMA-X are engineered for single-axis trackers with CRADYL row-transfer docking. See our tracker cleaning robot guide for technical procurement.",
        q10: "What is the typical mobilisation timeline for a 100 MW plant?",
        a10: "Phased deployment: site mapping, fleet mobilisation, operator training, and NECTYR onboarding. Timeline depends on row count and access — proposed during commercial engagement, typically weeks not months for established solar parks.",
        q11: "Can Taypro support multi-site portfolios across states?",
        a11: "Yes. NECTYR provides portfolio-level scheduling and reporting. Taypro operates across Rajasthan, Gujarat, Maharashtra, Karnataka, MP, Andhra Pradesh, Tamil Nadu, Uttar Pradesh, Haryana, Delhi NCR, West Bengal, and Chhattisgarh.",
      },
    },
  },
  "solar-om-services": {
    SolarOmServicesPage: {
      prose: {
        p4: "Indian utility solar O&M contracts increasingly separate electrical maintenance from module cleaning — because soiling is the largest controllable yield leak, yet the least instrumented. Taypro's solar plant O&M layer fills that gap with robotic execution and fleet software, not another inverter alarm dashboard.",
        p5: "For SECI, state discom, and IPP tenders that specify cleaning frequency, coverage evidence, or water-use restrictions, Taypro programmes include written SOPs, NECTYR exports, and monthly panel-volume reconciliation suitable for auditor review.",
      },
      cards: {
        card4: {
          title: "Multi-MW portfolio governance",
          body: "Asset managers running 500 MW+ across states need one cleaning vendor with consistent reporting format, SLA escalation paths, and portfolio-level NECTYR dashboards — not different crew contractors per site.",
        },
        card5: {
          title: "Renewal and ORION upgrade path",
          body: "Fleets already on Taypro robots can attach ORION plant intelligence at contract renewal — predictive cleaning schedules and dust-event alerts without replacing hardware.",
        },
      },
      steps: {
        eyebrow: "O&M procurement path",
        heading: "How to procure Taypro solar O&M services",
        subheading:
          "A framework asset managers use in RFQs and vendor shortlists.",
        step0Title: "Define cleaning scope in your O&M tender",
        step0Body:
          "Specify module cleaning frequency targets, water-use constraints, coverage evidence requirements, and whether you prefer CAPEX robot purchase or managed OPEX. Taypro responds to both models.",
        step1Title: "Technical site assessment",
        step1Body:
          "Engineering reviews row geometry, tracker vs fixed tilt, soiling drivers, and current PR trends. Output: robot model, fleet size, cycle count, and NECTYR integration plan.",
        step2Title: "SLA and commercial terms",
        step2Body:
          "Agree breakdown response targets, reporting cadence, reconciliation rules for panel-volume billing, and escalation matrix. Terms scale with plant MW and portfolio size.",
        step3Title: "Mobilisation and operator placement",
        step3Body:
          "Dedicated operators, regional spares, connectivity, and cleaning SOPs deployed. NECTYR activated for scheduling, tickets, and monthly settlement.",
        step4Title: "Quarterly O&M programme review",
        step4Body:
          "Review soiling trends, adjust cycles for season, correlate cleaning with PR recovery, and plan ORION intelligence upgrades where applicable.",
      },
      eligibility: {
        eyebrow: "Vendor fit",
        title: "When Taypro is the right solar O&M partner",
        forTitle: "Strong fit",
        for0: "Utility plants 50 MW+ with recurring soiling and manual O&M cost pressure",
        for1:
          "IPPs and asset managers that need cleaning evidence for lenders or SECI compliance",
        for2:
          "Plants adopting or expanding single-axis trackers needing GLYDE-X or NYUMA-X fleets",
        for3:
          "O&M teams seeking to complement SCADA with fleet execution and cleaning-to-PR data",
        notForTitle: "Outside core scope",
        not0: "Standalone inverter or transformer maintenance contracts",
        not1: "Residential rooftop O&M without robotic cleaning feasibility",
        not2:
          "Plants seeking only occasional manual washing without structured programme",
      },
      highlight: {
        heading: "SCADA shows the dip. Taypro shows the cause.",
        lead: "Solar plant O&M procurement should close the soiling-to-action loop.",
        body: "Inverter alarms tell you generation dropped. NECTYR tells you which blocks were cleaned, which robots completed routes, and where coverage gaps remain. ORION roadmap adds predictive scheduling before dust storms hit PR.",
      },
      proseSecondary: {
        eyebrow: "By plant size",
        heading: "Solar O&M services scaled from 50 MW to 500 MW",
        p1: "At 50 MW, a single-region operator team with 2–4 robots may suffice for 3–6 cycles monthly. At 200 MW+, fleet density modelling, zone-based NECTYR scheduling, and phased mobilisation become critical — Taypro has references up to 360 MW single-site automatic deployments.",
        p2: "Tracker-dominated portfolios need CRADYL row-transfer planning and higher robots-per-MW ratios than fixed-tilt blocks. Taypro engineers model throughput during assessment — not generic brochure numbers.",
        p3: "Browse automatic project case studies or request a portfolio-level O&M proposal.",
        linkPrimary: "Large-scale cleaning capability",
        linkPrimaryHref: "/large-scale-solar-panel-cleaning",
        linkSecondary: "Fleet monitoring software",
        linkSecondaryHref: "/solar-fleet-monitoring-software",
      },
      resources: {
        eyebrow: "Procurement resources",
        heading: "O&M buyer guides",
        link0Title: "India solar cleaning service",
        link0Href: "/solar-panel-cleaning-service-india",
        link1Title: "Cleaning cost & OPEX pricing",
        link1Href: "/solar-cleaning-opex-pricing",
        link2Title: "Compare robotic vs manual cleaning",
        link2Href: "/compare/solar-panel-cleaning-robot-vs-manual-cleaning",
      },
      faq: {
        q8: "What is the difference between Taypro O&M and a full EPC O&M contract?",
        a8: "Full EPC O&M covers electrical, inverter, tracker mechanical, and module work. Taypro specialises in the robotic cleaning execution layer, fleet software, and cleaning-to-PR analytics. Most plants use Taypro alongside an electrical O&M contractor.",
        q9: "Can Taypro integrate cleaning data with our asset management system?",
        a9: "Enterprise deployments support NECTYR data exports and API discussions during onboarding. Cleaning evidence can feed portfolio dashboards alongside SCADA generation data.",
        q10: "How do you handle monsoon season cycle adjustments?",
        a10: "Quarterly programme reviews reduce or pause cycles when natural rain provides sufficient cleaning, then ramp before post-monsoon dust events. Cycle count is contractual but seasonally adjusted with evidence.",
        q11: "Does Taypro bid on SECI O&M tenders?",
        a11: "Taypro serves SECI-tendered and state discom utility plants. Contact us with tender specifications for compliance mapping against Taypro programme deliverables.",
      },
    },
  },
  "solar-cleaning-opex-pricing": {
    SolarCleaningOpexPricingPage: {
      stats: {
        eyebrow: "Pricing anchors",
        heading: "Solar panel cleaning cost benchmarks in India",
        card0: {
          tag: "Per panel",
          stat: "₹0.45–0.70",
          label: "OPEX rate per panel per cycle",
          body: "Volume-discounted on large utility fleets. Smaller plants under 10 MW start at the upper band.",
        },
        card1: {
          tag: "Per MW",
          stat: "₹1.5–4L",
          label: "Indicative monthly OPEX per MW",
          body: "Depends on cycle count (3–10/month), installation type, and module count. Use the table below for directional planning.",
        },
        card2: {
          tag: "Included",
          stat: "All-in",
          label: "Operators, spares, NECTYR, SOPs",
          body: "No separate line items for labour or robot depreciation on OPEX — you pay for panels cleaned.",
        },
        card3: {
          tag: "Minimum",
          stat: "₹1L+",
          label: "Monthly programme floor on smaller sites",
          body: "Applies when calculated volume falls below minimum monthly fee thresholds.",
        },
      },
      costComparison: {
        row3: {
          factor: "Cycle frequency",
          manual: "1–2 wet washes/month — labour and water limit throughput",
          robotic: "3–10 dry cycles/month without water constraint",
        },
        row4: {
          factor: "PR recovery speed",
          manual: "Delayed response after dust events; coverage gaps on long rows",
          robotic: "Scheduled cadence; block-level NECTYR proof of coverage",
        },
        row5: {
          factor: "20-year TCO at 100 MW",
          manual: "Rising labour, fuel, water; contract renegotiation risk",
          robotic: "Predictable per-panel opex or defined CAPEX+AMC alternative",
        },
      },
      steps: {
        eyebrow: "Pricing workflow",
        heading: "How to get accurate solar cleaning cost for your plant",
        step0Title: "Gather plant inputs",
        step0Body:
          "MW capacity, module wattage (e.g. 540 Wp), fixed tilt vs tracker, state/soiling context, and current annual cleaning spend if known.",
        step1Title: "Estimate module count and cycles",
        step1Body:
          "Divide kW by module Wp. Choose 3–10 cycles/month based on soiling study or regional benchmarks (higher in Rajasthan/Gujarat).",
        step2Title: "Apply OPEX rate band",
        step2Body:
          "Multiply modules × cycles × rate (₹0.45–0.70). Apply tracker multiplier (1.8×) or seasonal tilt (1.5×) if applicable. Compare table above for sanity check.",
        step3Title: "Run ROI calculator for payback",
        step3Body:
          "Enter soiling loss %, tariff, and procurement model. Calculator estimates energy gain vs cleaning cost for CAPEX and OPEX scenarios.",
        step4Title: "Request binding site quote",
        step4Body:
          "Taypro engineers validate assumptions with a soiling study and issue commercial terms reconciled to NECTYR measurement rules.",
      },
      eligibility: {
        eyebrow: "OPEX fit",
        title: "When pay-per-panel OPEX pricing makes sense",
        forTitle: "OPEX is often best when",
        for0:
          "You want fast mobilisation without robot CAPEX on the balance sheet",
        for1:
          "You prefer opex aligned to verified panels cleaned, not lump-sum crew contracts",
        for2:
          "Your plant is 10 MW+ utility scale with 3+ cycles/month economics",
        for3:
          "Finance team needs predictable monthly cleaning line item for models",
        notForTitle: "Consider CAPEX instead when",
        not0: "Very long hold period (15+ years) with capacity to own fleet depreciation",
        not1: "Smaller C&I sites where minimum monthly fee dominates unit economics",
        not2: "You already own robots and only need AMC + NECTYR",
      },
      proseSecondary: {
        eyebrow: "Regional cost drivers",
        heading: "Why solar panel cleaning cost varies by state in India",
        p1: "Soiling rate drives cycle count — the primary cost multiplier. A 100 MW plant in Rajasthan may need 8–10 dry cycles monthly during pre-monsoon dust season; a similar plant in eastern India may run 4–6. More cycles × more panels = higher monthly OPEX, but also higher PR recovery.",
        p2: "Tracker installations add 1.8× rate multiplier versus fixed tilt due to row geometry, stow angles, and CRADYL transfer complexity. Seasonal tilt sits at 1.5×.",
        p3: "Manual cleaning cost benchmarks rise linearly with MW — crew count, water tankers, supervision, and night-shift premiums. Robotic OPEX converts this to a measurable per-panel variable with audit trail.",
        linkPrimary: "India cleaning service overview",
        linkPrimaryHref: "/solar-panel-cleaning-service-india",
        linkSecondary: "Robot CAPEX price guide",
        linkSecondaryHref: "/solar-panel-cleaning-robot-price-india",
      },
      resources: {
        eyebrow: "Cost research",
        heading: "Related pricing & ROI tools",
        link0Title: "Interactive ROI calculator",
        link0Href: "/solar-panel-cleaning-robot-price-calculator",
        link1Title: "OPEX service details",
        link1Href: "/solar-panel-cleaning-system/solar-panel-cleaning-service",
        link2Title: "Robotic vs manual cost comparison",
        link2Href: "/compare/solar-panel-cleaning-robot-vs-manual-cleaning",
      },
      faq: {
        q8: "What drives the difference between ₹0.45 and ₹0.70 per panel?",
        a8: "Plant size (module count), cleaning frequency, and installation type. Larger fleets above 100 MW with higher cycle counts approach the lower band. Small plants and complex tracker geometry approach the upper band.",
        q9: "Is GST included in indicative pricing?",
        a9: "Commercial quotes specify tax treatment. Use contact form for binding proposals with current GST applicability.",
        q10: "How does OPEX pricing compare to manual cleaning contracts per MW?",
        a10: "Manual contracts often appear cheaper on paper but lack cycle frequency, water cost, coverage audit, and PR recovery speed. Run both scenarios in the ROI calculator with your tariff and soiling assumptions.",
        q11: "Can I switch from OPEX to CAPEX later?",
        a11: "Many IPPs start OPEX for fast mobilisation then transition to owned fleets at contract renewal. Taypro supports both models on the same plant with NECTYR continuity.",
      },
    },
  },
  "solar-panel-cleaning-robot-for-rooftop": {
    RooftopCleaningPage: {
      stats: {
        eyebrow: "Rooftop segment",
        heading: "Commercial rooftop solar cleaning — market context",
        card0: {
          tag: "Segment",
          stat: "C&I",
          label: "Warehouses, factories, malls",
          body: "India's C&I rooftop solar exceeds 20 GW — most arrays are 500 kW to 5 MW where compact robots beat utility-scale machines.",
        },
        card1: {
          tag: "Access",
          stat: "Compact",
          label: "MINY form factor",
          body: "Designed for freight lifts and narrow roof hatches — GLYDE-class robots cannot mobilise on typical commercial rooftops.",
        },
        card2: {
          tag: "Water",
          stat: "Zero",
          label: "Waterless dry cleaning",
          body: "Building codes and runoff restrictions often prohibit wet-wash on industrial rooftops.",
        },
        card3: {
          tag: "Alternative",
          stat: "HELYX",
          label: "Multi-block C&I portfolios",
          body: "Semi-automatic pick-and-place for scattered blocks where full autonomy is not economical.",
        },
      },
      cards: {
        card4: {
          title: "Safety and building operations",
          body: "Robotic cleaning runs on scheduled night windows without daytime warehouse traffic conflict. Operators follow building safety protocols and roof load limits assessed during feasibility.",
        },
        card5: {
          title: "Soiling on urban rooftops",
          body: "Urban particulate, bird droppings, and industrial emissions create different soiling chemistry than desert utility plants — cycle planning must match local dust, not generic desert assumptions.",
        },
      },
      steps: {
        eyebrow: "Rooftop assessment",
        heading: "How to evaluate a rooftop solar cleaning robot",
        step0Title: "Document array layout and access",
        step0Body:
          "Share kW/MW capacity, row length, tilt, lift dimensions, stair access, and photos. Taypro determines MINY vs HELYX feasibility.",
        step1Title: "Roof load and safety review",
        step1Body:
          "Structural and safety constraints verified before robot deployment. Not every rooftop qualifies — Taypro advises honestly.",
        step2Title: "Robot specification and quote",
        step2Body:
          "MINY compact robot for autonomous rows, or HELYX for pick-and-place scattered blocks. NECTYR optional for multi-site portfolios.",
        step3Title: "Commissioning and operator training",
        step3Body:
          "On-site training for building facilities team or Taypro operator placement depending on commercial model.",
        step4Title: "Scheduled cleaning cycles",
        step4Body:
          "Typically 2–6 dry cycles monthly for urban C&I soiling — adjusted after first month PR observation.",
      },
      eligibility: {
        eyebrow: "Fit guide",
        title: "Is a rooftop cleaning robot right for your building?",
        forTitle: "Good fit",
        for0: "Commercial/industrial rooftops 500 kW–5 MW with regular row geometry",
        for1: "Warehouses, manufacturing plants, logistics parks with night cleaning windows",
        for2: "Buildings prohibiting wet-wash runoff or water tanker access",
        for3: "C&I developers managing multi-site portfolios needing NECTYR reporting",
        notForTitle: "Not ideal",
        not0: "Ground-mount utility plants (use GLYDE, GLYDE-X, or NYUMA instead)",
        not1: "Roofs failing structural or access feasibility review",
        not2: "Single small arrays where manual cleaning cost is already negligible",
      },
      highlight: {
        heading: "Utility robots do not fit warehouse roofs.",
        lead: "Rooftop buyer intent needs a compact solar cleaning robot — not a repackaged ground-mount GLYDE.",
        body: "Taypro MINY is purpose-built for commercial rooftop solar in India. HELYX covers scattered multi-block C&I where pick-and-place beats full autonomy.",
      },
      proseSecondary: {
        eyebrow: "Commercial use cases",
        heading:
          "Commercial rooftop solar cleaning — warehouses, factories, and industrial parks",
        p1: "Warehouse operators with 1–3 MW flat roofs face the same soiling losses as utility plants — but cannot deploy 300 kg ground-mount robots through a freight lift. MINY-class compact robots address access, row length, and waterless constraints simultaneously.",
        p2: "Manufacturing plants with partial shading, HVAC exhaust, and bird activity need higher cleaning cadence than annual manual washes. Autonomous night cycles maintain PR without disrupting daytime logistics.",
        p3: "For multi-building C&I portfolios, NECTYR schedules robots across sites and exports cleaning evidence for sustainability reporting and O&M audits.",
        linkPrimary: "MINY robot specifications",
        linkPrimaryHref:
          "/solar-panel-cleaning-system/miny-compact-rooftop-cleaning-robot",
        linkSecondary: "Utility-scale cleaning service",
        linkSecondaryHref: "/solar-panel-cleaning-service-india",
      },
      resources: {
        eyebrow: "Rooftop guides",
        heading: "Related resources",
        link0Title: "HELYX semi-automatic robot",
        link0Href:
          "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
        link1Title: "Robot price guide India",
        link1Href: "/solar-panel-cleaning-robot-price-india",
        link2Title: "ROI calculator",
        link2Href: "/solar-panel-cleaning-robot-price-calculator",
      },
      faq: {
        q8: "What building types use rooftop cleaning robots in India?",
        a8: "Warehouses, logistics parks, manufacturing facilities, shopping malls, and institutional campuses with 500 kW+ rooftop arrays are primary adopters.",
        q9: "Can MINY clean around rooftop obstacles?",
        a9: "Feasibility depends on row layout, gap widths, and safety zones. Taypro maps paths during site assessment — irregular arrays may need HELYX pick-and-place instead.",
        q10: "Is wet cleaning ever used on rooftops?",
        a10: "Taypro robots are waterless by design — avoiding runoff, load addition, and building code issues common with pressure washing.",
        q11: "How does rooftop robot ROI compare to manual cleaning?",
        a11: "Manual rooftop cleaning requires safety harness crews, insurance, and building access coordination — often more expensive per kW than ground-mount manual. Run the ROI calculator with your tariff and soiling rate.",
      },
    },
  },
  "solar-panel-cleaning-robot-for-trackers": {
    TrackerCleaningPage: {
      stats: {
        eyebrow: "Tracker market",
        heading: "Single-axis tracker cleaning robot demand in India",
        card0: {
          tag: "Growth",
          stat: "Rising",
          label: "Tracker share of new utility MW",
          body: "Gujarat, Rajasthan, and Karnataka lead tracker adoption — manual crews cannot match row length at 50 MW+ scale.",
        },
        card1: {
          tag: "Products",
          stat: "2 robots",
          label: "GLYDE-X & NYUMA-X",
          body: "Dual-pass microfiber vs PBT single-pass — choose based on PR targets and capex efficiency.",
        },
        card2: {
          tag: "Transfer",
          stat: "CRADYL",
          label: "Autonomous row-to-row docking",
          body: "Essential for multi-row tracker blocks without manual robot carry between tables.",
        },
        card3: {
          tag: "Scale",
          stat: "50–300 MW",
          label: "Proven deployment range",
          body: "SECI and state discom references with tracker-compatible Taypro fleets.",
        },
      },
      cards: {
        card4: {
          title: "Tracker vendor compatibility",
          body: "GLYDE-X and NYUMA-X are deployed across major tracker brands in India. Site assessment maps stow angles, row length, and ground clearance before fleet sizing.",
        },
        card5: {
          title: "Night-window throughput modelling",
          body: "Engineering models available cleaning hours vs row count to hit 3–10 monthly cycles — the minimum for high-soiling tracker belts.",
        },
      },
      steps: {
        eyebrow: "Tracker deployment",
        heading: "Commissioning tracker cleaning robots on your plant",
        step0Title: "Tracker layout & vendor data",
        step0Body:
          "Share MW, tracker type, row count, module dimensions, stow range, and current cleaning method. Taypro models robots-per-MW.",
        step1Title: "GLYDE-X vs NYUMA-X selection",
        step1Body:
          "Dual-pass quality (GLYDE-X) vs single-pass speed and capex (NYUMA-X). Head-to-head comparison available or engineering recommendation.",
        step2Title: "CRADYL placement plan",
        step2Body:
          "Row-end docking stations positioned for autonomous transfer — minimising operator carry on 100+ module rows.",
        step3Title: "Fleet mobilisation & NECTYR mapping",
        step3Body:
          "Robots mapped to blocks, operators trained on tracker-specific SOPs, connectivity commissioned.",
        step4Title: "Cycle execution & PR correlation",
        step4Body:
          "3–10 dry cycles monthly with NECTYR coverage logs correlated against block PR trends.",
      },
      highlight: {
        heading: "Manual brush cleaning breaks at tracker scale.",
        lead: "100-module rows need autonomous transfer — not crews carrying brushes at row ends.",
        body: "Taypro GLYDE-X and NYUMA-X with CRADYL row-transfer docking are engineered for Indian single-axis tracker plants from 50 MW to 300 MW.",
      },
      proseSecondary: {
        eyebrow: "GLYDE-X vs NYUMA-X",
        heading:
          "Choosing a tracker-compatible cleaning robot for your PR targets",
        p1: "GLYDE-X uses Taypro's patented dual-pass microfiber system — highest dust removal per pass, ideal when soiling chemistry is sticky or cementitious and PR recovery per cycle is the priority.",
        p2: "NYUMA-X uses PBT single-pass brush technology — faster coverage per night window and lower capex, suited when dust is predominantly dry and cycle throughput is the bottleneck.",
        p3: "Both integrate with CRADYL for row transfer and NECTYR for fleet scheduling. Request engineering modelling for your tracker layout.",
        linkPrimary: "GLYDE-X vs NYUMA-X comparison",
        linkPrimaryHref: "/compare/glyde-x-vs-nyuma-x",
        linkSecondary: "Tracker OPEX pricing",
        linkSecondaryHref: "/solar-cleaning-opex-pricing",
      },
      resources: {
        eyebrow: "Tracker resources",
        heading: "Technical guides",
        link0Title: "CRADYL row-transfer docking",
        link0Href:
          "/solar-panel-cleaning-system/cradyl-row-transfer-docking-station",
        link1Title: "Large-scale MW cleaning",
        link1Href: "/large-scale-solar-panel-cleaning",
        link2Title: "Manual vs robotic on trackers (blog context)",
        link2Href: "/blog/manual-brush-cleaning-on-tracker-arrays-limits-at-50-mw-scale",
      },
      faq: {
        q8: "Which tracker brands has Taypro deployed on?",
        a8: "Taypro tracker robots operate across multiple single-axis tracker installations in Gujarat and Rajasthan. Share your tracker vendor during assessment for compatibility confirmation.",
        q9: "Does robotic cleaning damage tracker drive systems?",
        a9: "Robots traverse module surfaces without loading tracker mechanical drives. Cleaning schedules respect stow positions defined in site SOPs.",
        q10: "What OPEX multiplier applies to tracker plants?",
        a10: "Tracker installations use approximately 1.8× the fixed-tilt per-panel rate due to geometry and transfer complexity. See OPEX pricing guide.",
        q11: "Can robots clean during tracker stow?",
        a11: "Cleaning programmes are scheduled for agreed stow angles and night windows — defined in the plant-specific cleaning SOP during mobilisation.",
      },
    },
  },
  "solar-fleet-monitoring-software": {
    FleetMonitoringPage: {
      stats: {
        eyebrow: "Platform scale",
        heading: "Solar fleet monitoring software — by the numbers",
        card0: {
          tag: "Live",
          stat: "2022+",
          label: "NECTYR in production",
          body: "Fleet portal deployed on Taypro robots across Indian utility plants since 2022.",
        },
        card1: {
          tag: "Data",
          stat: "11B+",
          label: "Annual panel passes",
          body: "Labelled operational data feeding cleaning-to-PR analytics and ORION roadmap.",
        },
        card2: {
          tag: "Coverage",
          stat: "Block-level",
          label: "Cleaning evidence",
          body: "Route completion, panels cleaned, exceptions — exportable for O&M and lender audits.",
        },
        card3: {
          tag: "Roadmap",
          stat: "ORION",
          label: "Plant intelligence layer",
          body: "Predictive scheduling, dust alerts, yield forecasting for Taypro fleets.",
        },
      },
      cards: {
        card4: {
          title: "Mobile & web access",
          body: "O&M managers schedule cycles, approve tickets, and review coverage from web or mobile — not just control-room SCADA terminals.",
        },
        card5: {
          title: "AMC workflow automation",
          body: "Fault alerts create structured tickets routed to regional service teams with remote diagnostics before truck rolls.",
        },
      },
      steps: {
        eyebrow: "Platform adoption",
        heading: "How solar fleet monitoring software deploys on your plant",
        step0Title: "Robot fleet commissioning",
        step0Body:
          "NECTYR activates when Taypro robots mobilise — robots mapped to blocks, rows, and zones in the plant model.",
        step1Title: "Schedule & SOP configuration",
        step1Body:
          "Cleaning cycles, paths, rest zones, and idle rules configured per plant security and O&M requirements.",
        step2Title: "Telemetry & connectivity",
        step2Body:
          "LTE, Wi-Fi, mesh, or LoRaWAN as designed. Fleet health, battery, and route data stream to NECTYR dashboard.",
        step3Title: "Reporting & reconciliation",
        step3Body:
          "Monthly panel-volume reports for OPEX billing. Exportable logs for asset managers and auditors.",
        step4Title: "ORION intelligence upgrade (optional)",
        step4Body:
          "Attach plant intelligence layer at renewal — predictive cleaning and dust-event correlation on existing fleet data.",
      },
      eligibility: {
        eyebrow: "Buyer fit",
        title: "Who needs solar plant monitoring software beyond SCADA?",
        forTitle: "Ideal users",
        for0:
          "Asset managers with Taypro cleaning robots needing coverage evidence and AMC workflow",
        for1:
          "O&M teams correlating cleaning cadence with PR recovery across blocks",
        for2:
          "Multi-site portfolios requiring consistent reporting format across states",
        for3:
          "Procurement teams evaluating SCADA complement for cleaning execution",
        notForTitle: "Not designed for",
        not0: "Standalone SCADA replacement for inverter/HV electrical monitoring",
        not1: "Non-Taypro robot fleets without enterprise integration discussion",
        not2: "Plants with no robotic cleaning programme (no fleet to monitor)",
      },
      highlight: {
        heading: "People search solar plant performance monitoring software.",
        lead: "They need execution proof — not another generation chart after the MWh is lost.",
        body: "NECTYR is Taypro's solar fleet monitoring platform: scheduling, coverage, tickets, and settlement. ORION adds predictive plant intelligence on the same data layer.",
      },
      proseSecondary: {
        eyebrow: "Feature depth",
        heading:
          "Solar plant performance analytics — what NECTYR captures vs SCADA",
        p1: "SCADA aggregates inverter and meter data at 15-minute intervals. NECTYR logs which robot cleaned which block, route completion percentage, battery state, fault codes, and operator actions — at cleaning-event granularity.",
        p2: "Asset managers use this to answer: Did we clean before the dust storm? Which blocks were skipped? Is the cleaning vendor billing matches telemetry? SCADA cannot answer these questions.",
        p3: "ORION roadmap layers weather feeds, soiling models, and yield forecasting — moving from reactive cleaning to predictive O&M for Taypro fleet customers.",
        linkPrimary: "Solar O&M services",
        linkPrimaryHref: "/solar-om-services",
        linkSecondary: "AI intelligence hub",
        linkSecondaryHref: "/technology/ai-intelligence",
      },
      resources: {
        eyebrow: "Platform resources",
        heading: "Learn more",
        link0Title: "NECTYR product page",
        link0Href:
          "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
        link1Title: "ORION plant intelligence",
        link1Href:
          "/solar-panel-cleaning-system/orion-plant-intelligence-platform",
        link2Title: "India cleaning service",
        link2Href: "/solar-panel-cleaning-service-india",
      },
      faq: {
        q8: "Is NECTYR included with robot purchase or OPEX?",
        a8: "Yes. NECTYR fleet monitoring is part of Taypro robot deployments and managed OPEX programmes — not a separate software licence for standard utility deployments.",
        q9: "What is the difference between NECTYR and ORION?",
        a9: "NECTYR is live fleet operations — scheduling, coverage, tickets, billing. ORION is the intelligence layer — predictive scheduling, dust alerts, yield analytics — on roadmap for Taypro fleet customers.",
        q10: "Can NECTYR data export to Excel or BI tools?",
        a10: "Coverage and cycle reports export for monthly governance. Enterprise API integrations discussed during onboarding.",
        q11: "Does fleet monitoring work on tracker and fixed-tilt mixed plants?",
        a11: "Yes. NECTYR maps heterogeneous fleets — GLYDE, GLYDE-X, NYUMA, NYUMA-X, HELYX — within one plant or portfolio view.",
      },
    },
  },
  "large-scale-solar-panel-cleaning": {
    LargeScaleCleaningPage: {
      cards: {
        card4: {
          title: "Phased mobilisation playbook",
          body: "Zone-by-zone robot deployment on 200 MW+ sites minimises operational disruption. Commissioning playbook includes mapping, connectivity, operator training, and parallel O&M coordination.",
        },
        card5: {
          title: "SECI and CPSU compliance alignment",
          body: "Cleaning SOPs, NECTYR logs, and monthly reconciliation structured for utility tender compliance and lender technical due diligence.",
        },
      },
      steps: {
        eyebrow: "Enterprise deployment",
        heading: "MW-scale solar cleaning robot mobilisation process",
        step0Title: "Enterprise RFQ & portfolio scoping",
        step0Body:
          "Share single-site MW or multi-site portfolio, installation mix, SECI/IPP context, and commercial model preference (CAPEX vs OPEX).",
        step1Title: "Engineering & fleet density model",
        step1Body:
          "Robots-per-MW calculated from row geometry, tracker vs fixed tilt, cycle targets, and CRADYL placement. Not generic industry ratios.",
        step2Title: "Commercial & SLA framework",
        step2Body:
          "Pricing, breakdown response, reporting cadence, and escalation matrix scaled to plant size. OPEX or CAPEX terms issued.",
        step3Title: "Phased fleet deployment",
        step3Body:
          "Zone-by-zone mobilisation on large sites. Operators, spares, and NECTYR onboarding per phase.",
        step4Title: "Production cleaning & governance",
        step4Body:
          "3–10 cycles monthly with monthly panel-volume reconciliation and quarterly programme reviews.",
      },
      eligibility: {
        eyebrow: "Scale fit",
        title: "Large-scale solar panel cleaning — when Taypro fits",
        forTitle: "Built for",
        for0: "Utility solar plants 50 MW to 500 MW single site or portfolio",
        for1: "SECI, state discom, CPSU, and IPP assets with documented MW references",
        for2:
          "Fixed-tilt and single-axis tracker plants requiring multi-robot fleets",
        for3:
          "Procurement teams needing enterprise SLA, NECTYR audit trail, and pan-India service",
        notForTitle: "Below typical scale",
        not0: "Sub-10 MW ground-mount without feasibility exception",
        not1: "Residential or small C&I rooftop (see rooftop guide)",
        not2: "Plants seeking one annual manual wash only",
      },
      highlight: {
        heading: "100 MW is not a pilot.",
        lead: "Large-scale solar panel cleaning requires production fleet operations — not a handful of demo robots.",
        body: "Taypro deploys tens of robots on 200–360 MW sites with NECTYR fleet oversight, regional spares, and dedicated operators. That is the bar for MW-scale cleaning procurement in India.",
      },
      proseSecondary: {
        eyebrow: "References",
        heading: "100MW solar cleaning and beyond — Taypro deployment evidence",
        p1: "Akhadana Rajasthan 360 MW, Bachau DVC Gujarat 300 MW, and Neneva Gujarat 250 MW represent automatic-first Taypro GLYDE fleets at the upper end of Indian utility scale. These are production deployments — not demonstration arrays.",
        p2: "Fleet sizing on 100 MW tracker plants typically involves GLYDE-X or NYUMA-X with CRADYL transfer stations at row ends. Fixed-tilt 200 MW blocks may run coordinated multi-zone GLYDE fleets with NECTYR scheduling across zones.",
        p3: "Request enterprise proposal with plant layout, or browse automatic project case studies filtered by MW capacity.",
        linkPrimary: "Automatic project references",
        linkPrimaryHref: "/projects/automatic",
        linkSecondary: "Solar O&M services",
        linkSecondaryHref: "/solar-om-services",
      },
      resources: {
        eyebrow: "Enterprise guides",
        heading: "MW-scale procurement resources",
        link0Title: "Tracker cleaning robots",
        link0Href: "/solar-panel-cleaning-robot-for-trackers",
        link1Title: "OPEX pricing per MW",
        link1Href: "/solar-cleaning-opex-pricing",
        link2Title: "India cleaning service",
        link2Href: "/solar-panel-cleaning-service-india",
      },
      faq: {
        q8: "What is the largest single-site deployment Taypro has cleaned?",
        a8: "360 MW automatic GLYDE deployment in Rajasthan (Akhadana reference). Contact Taypro for current fleet references matching your MW scale.",
        q9: "How long to mobilise a 200 MW cleaning fleet?",
        a9: "Phased mobilisation over weeks depending on zone count, access, and row geometry. Detailed schedule proposed during commercial engagement.",
        q10: "Can Taypro clean multiple blocks with different installation types on one site?",
        a10: "Yes. Mixed fixed-tilt and tracker blocks within large solar parks are common. Fleet model assigns GLYDE, GLYDE-X, or NYUMA-X per block with unified NECTYR oversight.",
        q11: "What documentation do lenders request for robotic cleaning programmes?",
        a11: "NECTYR cycle logs, coverage maps, monthly panel-volume reconciliation, and cleaning SOPs. Taypro programmes are structured for technical due diligence on utility solar finance.",
      },
    },
  },
};

for (const [module, enrichment] of Object.entries(ENRICHMENTS)) {
  const rel = `messages/pages/en/${module}.json`;
  const data = loadJson(rel);
  deepMerge(data, enrichment);
  saveJson(rel, data);
  console.log(`Enriched ${rel}`);
}

console.log("Done. Run: node scripts/localize-buyer-intent-pages.mjs");
