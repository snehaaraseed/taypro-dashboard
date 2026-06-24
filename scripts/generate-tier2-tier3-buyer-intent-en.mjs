#!/usr/bin/env node
/**
 * Generate EN message JSON for Tier 2–3 buyer-intent landing pages.
 * Run: node scripts/generate-tier2-tier3-buyer-intent-en.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const outDir = path.join(ROOT, "messages/pages/en");

function faq(heading, subheading, qa) {
  const o = { heading, subheading };
  qa.forEach((x, i) => {
    o[`q${i}`] = x.q;
    o[`a${i}`] = x.a;
  });
  return o;
}

const PAGES = {
  "solar-panel-soiling-loss-calculator.json": {
    SoilingLossCalculatorPage: {
      meta: {
        title: "Solar Panel Soiling Loss Calculator India | MWh & Revenue Impact",
        description:
          "Free solar soiling loss calculator for Indian utility plants: estimate annual MWh and ₹ lost to dust by MW, soiling %, and tariff. Regional presets for Rajasthan, Gujarat, and typical India.",
        openGraphTitle: "Solar Soiling Loss Calculator | Taypro",
        openGraphDescription:
          "Quantify energy and revenue lost to panel soiling before choosing a cleaning programme — directional tool for IPP and O&M teams.",
      },
      breadcrumbHub: "Solar panel cleaning robots",
      breadcrumbHubHref: "/solar-panel-cleaning-system",
      breadcrumb: "Soiling loss calculator",
      schema: {
        name: "Taypro Solar Panel Soiling Loss Calculator",
        description:
          "Web calculator estimating annual MWh and revenue loss from solar panel soiling on Indian utility-scale plants.",
        applicationCategory: "BusinessApplication",
      },
      hero: {
        eyebrow: "Tool · Soiling economics",
        title: "Solar panel soiling loss calculator — how much energy are you losing?",
        subtitle:
          "Before comparing robot CAPEX or OPEX, quantify the MWh and ₹ foregone to dust. Enter plant MW, soiling loss %, and tariff — uses India-specific yield assumptions (1,500 kWh/kW-year P50). Site-specific results require a soiling study.",
        ctaPrimary: "Use calculator below",
        ctaPrimaryHref: "#soiling-calculator",
        ctaSecondary: "Full ROI calculator",
        ctaSecondaryHref: "/solar-panel-cleaning-robot-price-calculator#calculator",
      },
      prose: {
        eyebrow: "Why quantify soiling first",
        heading: "Soiling loss is the largest controllable yield leak on Indian utility plants",
        p1: "Soiling suppresses usable output when washing stays calendar-based. Industry discussions cite roughly 8–25% seasonal soiling loss on utility plants in Rajasthan, Gujarat, and other high-dust belts when cleaning is infrequent.",
        p2: "Daily soiling rates of 0.3–0.5% per day are documented in west India dry seasons. Seven days without cleaning can mean 3–5% output loss; ninety days without systematic cleaning can reach 15–25% on desert sites.",
        p3: "This calculator estimates annual generation at your MW capacity, applies your soiling loss assumption, and converts lost MWh to ₹ using your tariff. It does not model cleaning recovery — use the ROI calculator for payback on robotic programmes.",
        p4: "Actual loss depends on tilt, tracker behaviour, rain probability, and dust chemistry. Taypro recommends a site soiling study before binding commercial decisions. See our performance methodology for how we define generation recovery claims.",
        linkPrimary: "Performance methodology",
        linkPrimaryHref: "/performance-and-test-methodology",
        linkSecondary: "Average soiling in Rajasthan & Gujarat",
        linkSecondaryHref:
          "/blog/average-soiling-losses-in-high-dust-regions-of-india-rajasthan-gujarat",
      },
      stats: {
        eyebrow: "India benchmarks",
        heading: "Soiling loss reference figures",
        card0: {
          tag: "Daily rate",
          stat: "0.3–0.5%",
          label: "West India dry season",
          body: "Documented daily soiling on arid utility sites — higher after dust storms.",
        },
        card1: {
          tag: "Seasonal",
          stat: "8–25%",
          label: "Without systematic cleaning",
          body: "Industry range on utility plants when washing cadence is infrequent.",
        },
        card2: {
          tag: "Example",
          stat: "21.6 GWh",
          label: "100 MW at 12% loss",
          body: "~180 GWh annual generation at 1,500 kWh/kW-year — 12% soiling = 21.6 GWh foregone.",
        },
        card3: {
          tag: "Revenue",
          stat: "₹7.6 Cr",
          label: "At ₹3.50/kWh",
          body: "Illustrative annual revenue loss for the 100 MW / 12% example above.",
        },
      },
      soilingCalculator: {
        eyebrow: "Interactive tool",
        heading: "Estimate your annual soiling loss",
        subheading:
          "Directional only — not a guarantee of recoverable MWh. Defaults use India market yield (1,500 kWh/kW-year).",
        disclaimer:
          "Results are illustrative. Site-specific soiling studies, PR baselines, and weather normalization are required for investment-grade models. See performance methodology.",
      },
      soilingTool: {
        capacityLabel: "Plant capacity (MW)",
        soilingLabel: "Annual soiling loss (%)",
        soilingHint: "share of annual generation lost to dust",
        tariffLabel: "Electricity tariff (₹/kWh)",
        tariffHint: "PPA, merchant, or blended portfolio rate",
        presetLow: "Low dust",
        presetTypical: "Typical India",
        presetHigh: "Rajasthan/Gujarat",
        resultsHeading: "Estimated annual impact",
        annualGeneration: "Annual generation",
        annualLoss: "Energy lost to soiling",
        annualRevenueLoss: "Revenue foregone",
        monthlyRevenueLoss: "Monthly revenue foregone",
        disclaimer:
          "Directional estimate only. Does not include cleaning recovery, inverter clipping, or curtailment.",
        ctaRoi: "Model cleaning payback",
        ctaStudy: "Request soiling study",
      },
      steps: {
        eyebrow: "How to use results",
        heading: "From soiling estimate to cleaning decision",
        subheading: "Four steps O&M teams take after quantifying dust loss.",
        step0Title: "Set realistic soiling %",
        step0Body:
          "Use regional presets or PR data. High-dust Rajasthan/Gujarat sites often model 15–25%; milder regions 5–12%.",
        step1Title: "Convert MWh to ₹ at your tariff",
        step1Body:
          "Apply PPA, merchant, or blended ₹/kWh. This is the annual value at risk from dust — not yet net of cleaning cost.",
        step2Title: "Compare cleaning programme cost",
        step2Body:
          "Run the ROI calculator with CAPEX or OPEX. Compare recovered MWh value vs cleaning TCO over 5 years.",
        step3Title: "Validate with site study",
        step3Body:
          "Taypro engineers assess dust sources, cycle count, and robot model before binding commercial terms.",
        step4Title: "Track PR recovery in NECTYR",
        step4Body:
          "Correlate cleaning cycles with block-level PR trends — closing the SCADA blind spot on field action.",
      },
      highlight: {
        heading: "The O&M question",
        lead: "Do you know your annual ₹ at risk from dust?",
        body: "Many plants model inverter availability but not soiling loss in ₹. This calculator gives a directional starting point before RFQ and ROI modelling.",
      },
      proseSecondary: {
        eyebrow: "Regional context",
        heading: "Soiling chemistry varies by Indian state",
        p1: "Rajasthan and Gujarat see loose silica and cementitious films — dry-brush robotic cleaning fits well. Coastal Tamil Nadu and Andhra Pradesh add salt aerosols. Metro-adjacent plants face soot and PM2.5 with different adhesion.",
        p2: "Agri-adjacent sites see harvest dust spikes in October–November. Monsoon rain can reset modules — but pre-monsoon dust seasons often drive the highest annual loss.",
        p3: "Weekly manual cleaning may leave 3–6% residual annual loss; optimised daily robotic programmes target under 2% in field discussions — always site-dependent.",
        linkPrimary: "Seasonal soiling variation in India",
        linkPrimaryHref:
          "/blog/seasonal-variation-in-soiling-rates-and-energy-yield-loss-in-india",
        linkSecondary: "Cleaning technology guide",
        linkSecondaryHref: "/cleaning-technology",
      },
      resources: {
        eyebrow: "Research",
        heading: "Soiling loss articles and tools",
        link0Title: "Soiling losses in Rajasthan & Gujarat",
        link0Href:
          "/blog/average-soiling-losses-in-high-dust-regions-of-india-rajasthan-gujarat",
        link1Title: "Seasonal soiling variation in India",
        link1Href:
          "/blog/seasonal-variation-in-soiling-rates-and-energy-yield-loss-in-india",
        link2Title: "Carbon value of lost solar energy from soiling",
        link2Href:
          "/blog/leveraging-carbon-pricing-for-environmental-and-economic-sustainability",
      },
      faq: faq(
        "Solar soiling loss calculator — FAQ",
        "How to interpret results and next steps.",
        [
          {
            q: "How is annual generation calculated?",
            a: "Plant MW × 1,000 kW × specific yield (default 1,500 kWh/kW-year for India P50). Adjust tariff; yield is held constant unless you request a site-specific study.",
          },
          {
            q: "What soiling % should I use?",
            a: "Use PR history or regional benchmarks: 5–8% mild, 8–15% typical utility India, 15–25% high-dust Rajasthan/Gujarat without frequent cleaning.",
          },
          {
            q: "Does this show recoverable energy after cleaning?",
            a: "No. It estimates loss from dust only. Use the ROI calculator to model cleaning cost vs recovered MWh.",
          },
          {
            q: "Is this the same as the robot price calculator?",
            a: "No. This tool quantifies soiling loss. The price calculator models robot CAPEX/OPEX payback over 20 years.",
          },
          {
            q: "How does soiling relate to PR?",
            a: "Soiling suppresses PR. SCADA shows kWh after loss; this calculator translates assumed soiling % into MWh and ₹ at risk.",
          },
          {
            q: "When is cleaning not economic?",
            a: "When soiling loss is under ~1.5–2% and cleaning cost exceeds recovered PPA value — common on mild sites or during heavy rain seasons.",
          },
          {
            q: "What tariff should I enter?",
            a: "Use your effective ₹/kWh: PPA rate, merchant capture, or blended portfolio average.",
          },
          {
            q: "Can rooftop plants use this?",
            a: "Yes, but yield assumptions differ for rooftop. Utility ground-mount defaults are most accurate above ~1 MW.",
          },
          {
            q: "How often should modules be cleaned in Rajasthan?",
            a: "Many utility programmes run 3–10 dry cycles monthly in dry season. A soiling study sets the right cadence.",
          },
          {
            q: "Where are methodology disclaimers?",
            a: "See /performance-and-test-methodology for how Taypro defines dust removal and generation recovery claims.",
          },
          {
            q: "Can Taypro validate my assumptions?",
            a: "Yes. Request a site soiling study and engineering review before binding cleaning contracts.",
          },
          {
            q: "Does soiling affect carbon reporting?",
            a: "Lost MWh from soiling reduces avoided emissions. See our carbon/soiling blog for portfolio framing.",
          },
        ]
      ),
      cta: {
        heading: "Know your loss — then model the fix",
        body: "Use the ROI calculator to compare cleaning programme economics, or contact Taypro for a site soiling study.",
        primary: "ROI calculator",
        primaryHref: "/solar-panel-cleaning-robot-price-calculator#calculator",
        secondary: "Request soiling study",
        secondaryHref: "/contact",
      },
      related: {
        label: "Related:",
        link0: "CAPEX vs OPEX guide",
        link0Href: "/solar-cleaning-capex-vs-opex",
        link1: "OPEX pricing",
        link1Href: "/solar-cleaning-opex-pricing",
        link2: "ROI calculator",
        link2Href: "/solar-panel-cleaning-robot-price-calculator",
        link3: "Utility operations guide",
        link3Href: "/utility-scale-solar-operations",
      },
    },
  },
};

// Manufacturer, plant data, enterprise — append to PAGES
Object.assign(PAGES, {
  "solar-cleaning-robot-manufacturer-india.json": {
    ManufacturerIndiaPage: {
      meta: {
        title: "Solar Cleaning Robot Manufacturer India | Taypro Pune OEM",
        description:
          "Evaluate Taypro as a Made-in-India solar cleaning robot manufacturer: Chakan Pune factory, GLYDE/NYUMA/HELYX line, TÜV NORD, pan-India AMC, NECTYR fleet software.",
        openGraphTitle: "Solar Cleaning Robot Manufacturer India | Taypro",
        openGraphDescription:
          "Indian OEM for waterless utility cleaning robots — manufacturing, deployment, and service from one accountable vendor.",
      },
      breadcrumbHub: "Solar panel cleaning robots",
      breadcrumbHubHref: "/solar-panel-cleaning-system",
      breadcrumb: "Robot manufacturer India",
      schema: {
        name: "Taypro Solar Cleaning Robot Manufacturer India",
        description:
          "Made-in-India manufacturer of autonomous and semi-automatic waterless solar cleaning robots for utility-scale PV.",
      },
      hero: {
        eyebrow: "Made in India · Pune",
        title: "Solar cleaning robot manufacturer India — OEM, not importer",
        subtitle:
          "Taypro designs and manufactures waterless cleaning robots at Chakan, Pune — GLYDE, GLYDE-X, NYUMA, NYUMA-X, HELYX, and MINY. Among India's largest deployed robotic cleaning fleets with pan-India service, NECTYR software, and both CAPEX and OPEX commercial models.",
        ctaPrimary: "Request vendor RFQ",
        ctaPrimaryHref: "/contact",
        ctaSecondary: "Robot price guide",
        ctaSecondaryHref: "/solar-panel-cleaning-robot-price-india",
      },
      stats: {
        eyebrow: "Manufacturer proof",
        heading: "Why procurement teams shortlist Taypro as an Indian OEM",
        card0: {
          tag: "Manufacturing",
          stat: "Chakan",
          label: "Pune production hub",
          body: "Design, assembly, and test in Maharashtra — not a reseller of imported robots.",
        },
        card1: {
          tag: "Fleet scale",
          stat: "5 GW+",
          label: "Deployed robotic capacity",
          body: "Production-scale fleet across Indian utility and C&I plants.",
        },
        card2: {
          tag: "Sites",
          stat: "150+",
          label: "Live utility deployments",
          body: "Named MW references on SECI, DVC, and IPP projects for due diligence.",
        },
        card3: {
          tag: "Certification",
          stat: "TÜV NORD",
          label: "Field-validated robots",
          body: "Third-party certification plus ISO-aligned manufacturing processes.",
        },
      },
      prose: {
        eyebrow: "Vendor evaluation",
        heading: "What to verify in a solar cleaning robot manufacturer RFQ",
        p1: "Procurement teams searching solar cleaning robot manufacturer India need more than a brochure: validate manufacturing location, tracker-specific SKUs, spare parts logistics, fleet software, and field service density — not just dust removal claims on a datasheet.",
        p2: "Taypro manufactures in Chakan, Pune and deploys the same robots under robot CAPEX + AMC or Taypro OPEX managed service. You get hardware, operators, spares, and NECTYR fleet portal from one accountable vendor.",
        p3: "Product matrix covers fixed tilt (GLYDE dual-pass microfiber, NYUMA PBT single-pass), single-axis trackers (GLYDE-X, NYUMA-X, CRADYL transfer), semi-automatic scattered blocks (HELYX), and compact C&I rooftops (MINY).",
        p4: "Indian patents protect Taypro dual-pass waterless technology. Compare brush philosophy, connectivity (LTE, mesh, LoRa), and NECTYR audit trails when evaluating import alternatives with longer spare lead times.",
        p5: "Request MW references, robots-per-MW modelling, and AMC SLA before committee sign-off. Taypro publishes 132+ project references and indicative pricing tools for finance review.",
        p6: "Manufacturer evaluation should include site visit or video audit of production, field service hubs, and NECTYR demo — especially for 50 MW+ programmes.",
        linkPrimary: "About Taypro",
        linkPrimaryHref: "/company",
        linkSecondary: "Cleaning technology",
        linkSecondaryHref: "/cleaning-technology",
      },
      pillars: {
        eyebrow: "Full stack OEM",
        heading: "Manufacturing plus field operations",
        pillar0: {
          title: "In-house R&D & production",
          body: "Robots engineered for Indian dust, heat, and monsoon — assembled and tested in Pune before field deployment.",
        },
        pillar1: {
          title: "Pan-India service network",
          body: "Regional spares, same-day breakdown targets, and remote diagnostics through NECTYR on multi-MW fleets.",
        },
        pillar2: {
          title: "NECTYR fleet software included",
          body: "Scheduling, coverage audits, and AMC tickets — standard on CAPEX and OPEX programmes, not a separate licence.",
        },
      },
      projects: {
        eyebrow: "MW-scale references",
        heading: "Taypro-manufactured robot deployments in India",
        subheading:
          "Named utility projects with GLYDE and tracker fleets from the Indian OEM.",
      },
      products: {
        eyebrow: "Product line",
        heading: "Taypro robot models by plant type",
        subheading: "Select fixed tilt, tracker, rooftop, or semi-automatic based on row geometry.",
      },
      eligibility: {
        eyebrow: "Fit assessment",
        title: "When Taypro as manufacturer is the right vendor",
        forTitle: "Strong fit",
        for0: "Utility ground-mount or tracker plants from ~10 MW with recurring soiling",
        for1: "Buyers who want Indian OEM with local spares and AMC — not import-only supply",
        for2: "Procurement requiring NECTYR audit trails and named MW references",
        for3: "CAPEX purchase or OPEX managed service from the same manufacturer",
        notForTitle: "Typically not a fit",
        not0: "Residential single-home rooftops without C&I scale",
        not1: "Buyers seeking only generic pressure-washing without robotic programme",
        not2: "Full-plant EPC scope (HV, inverters) — Taypro partners on cleaning layer only",
      },
      highlight: {
        heading: "The vendor question",
        lead: "Can your manufacturer prove field scale — not just factory photos?",
        body: "Taypro cites 150+ live sites, 300–360 MW single-plant references, and NECTYR telemetry on deployed fleets. Ask every vendor for named MW, robots-per-MW, and coverage audit samples.",
      },
      proseSecondary: {
        eyebrow: "Import vs Indian OEM",
        heading: "Why local manufacturing matters at MW scale",
        p1: "Import robots face spare latency, tracker validation gaps, and AMC networks that thin out beyond tier-one cities. Indian OEM production reduces truck-roll time and aligns cleaning SOPs with local dust chemistry.",
        p2: "Taypro dual-pass microfiber (GLYDE) targets sticky cementitious films common in Gujarat industrial belts. PBT single-pass (NYUMA) suits capex-efficient fixed-tilt fleets. Match brush technology to soiling study — not generic desert assumptions.",
        p3: "Mint Tech4Good 2024 recognition reflects field impact of waterless robotics plus data platform work — validate with your own pilot PR data, not awards alone.",
        linkPrimary: "Compare Indian robot companies",
        linkPrimaryHref: "/compare/taypro-vs-indian-solar-cleaning-robot-companies",
        linkSecondary: "Large-scale deployments",
        linkSecondaryHref: "/large-scale-solar-panel-cleaning",
      },
      resources: {
        eyebrow: "Due diligence",
        heading: "Manufacturer research",
        link0Title: "Robot price guide India",
        link0Href: "/solar-panel-cleaning-robot-price-india",
        link1Title: "Performance & test methodology",
        link1Href: "/performance-and-test-methodology",
        link2Title: "Automatic project references",
        link2Href: "/projects/automatic",
      },
      faq: faq(
        "Solar cleaning robot manufacturer India — FAQ",
        "Vendor diligence questions for procurement teams.",
        [
          {
            q: "Where does Taypro manufacture robots?",
            a: "Chakan, Pune, Maharashtra — design, assembly, and testing for utility-scale waterless cleaning robots.",
          },
          {
            q: "Is Taypro an importer or OEM?",
            a: "Taypro is a Made-in-India manufacturer. We design and build GLYDE, NYUMA, HELYX, and related models in Pune.",
          },
          {
            q: "What certifications apply?",
            a: "TÜV NORD field validation, ISO-aligned manufacturing, IP65 environmental rating on deployed platforms.",
          },
          {
            q: "Which robot for single-axis trackers?",
            a: "GLYDE-X or NYUMA-X with CRADYL row-transfer where needed — validated on 250–300 MW Gujarat tracker references.",
          },
          {
            q: "Is NECTYR included with robot purchase?",
            a: "Yes. Fleet portal for scheduling, coverage, and AMC is included on standard utility CAPEX and OPEX programmes.",
          },
          {
            q: "Can we buy robots only without service?",
            a: "Robot CAPEX includes commissioning support; AMC is strongly recommended for utility uptime. OPEX is the fully managed alternative.",
          },
          {
            q: "How does Taypro compare to imported robots?",
            a: "Evaluate spare lead time, tracker SKUs, India field density, and NECTYR audit evidence — not brochure dust-removal % alone.",
          },
          {
            q: "What MW references exist?",
            a: "Named deployments include Akhadana 360 MW, Bachau DVC 300 MW, and Neneva 250 MW — see projects section on this page.",
          },
          {
            q: "Does Taypro offer OPEX as manufacturer?",
            a: "Yes. Same robots deployed under Taypro OPEX — manufacturer owns fleet and bills per panel cleaned.",
          },
          {
            q: "What about rooftop plants?",
            a: "MINY compact robot for commercial C&I rooftops. Utility RFQ focus is ground-mount and tracker.",
          },
          {
            q: "How to request factory or site visit?",
            a: "Contact Taypro with MW, state, and procurement timeline. Engineering and leadership visits available for enterprise RFQs.",
          },
          {
            q: "Where is pricing published?",
            a: "Directional CAPEX bands in the robot price guide and ROI calculator. Binding quotes follow site assessment.",
          },
        ]
      ),
      quoteForm: {
        eyebrow: "Vendor RFQ",
        title: "Request manufacturer proposal",
        placeholder:
          "Plant MW, state, installation type, CAPEX vs OPEX preference, and tender timeline.",
      },
      cta: {
        heading: "Evaluate Taypro as your Indian robot OEM",
        body: "Share your RFQ checklist — we'll respond with product fit, references, and commercial options.",
        primary: "Request RFQ",
        primaryHref: "/contact",
        secondary: "View products",
        secondaryHref: "/solar-panel-cleaning-system",
      },
      related: {
        label: "Related:",
        link0: "Company",
        link0Href: "/company",
        link1: "Robot price India",
        link1Href: "/solar-panel-cleaning-robot-price-india",
        link2: "CAPEX vs OPEX",
        link2Href: "/solar-cleaning-capex-vs-opex",
        link3: "Large-scale cleaning",
        link3Href: "/large-scale-solar-panel-cleaning",
      },
    },
  },
});

// Plant data intelligence + enterprise
Object.assign(PAGES, {
  "solar-plant-data-intelligence.json": {
    PlantDataIntelligencePage: {
      meta: {
        title: "Solar Plant Data Intelligence India | ORION & NECTYR",
        description:
          "Solar plant data intelligence beyond SCADA: Taypro NECTYR cleaning telemetry today, ORION plant health roadmap — PR drift, soiling correlation, and yield analytics for Indian utility fleets.",
        openGraphTitle: "Solar Plant Data Intelligence | Taypro",
        openGraphDescription:
          "Close the soiling-to-action loop with labelled cleaning data and ORION plant intelligence for Taypro fleet customers.",
      },
      breadcrumbHub: "Solar panel cleaning robots",
      breadcrumbHubHref: "/solar-panel-cleaning-system",
      breadcrumb: "Solar plant data intelligence",
      schema: {
        name: "Taypro ORION Plant Data Intelligence",
        description:
          "Plant intelligence layer correlating cleaning, weather, and yield for utility solar — ORION roadmap on NECTYR fleet data.",
        applicationCategory: "BusinessApplication",
      },
      hero: {
        eyebrow: "Data · Plant intelligence",
        title: "Solar plant data intelligence — from SCADA alarms to cleaning action",
        subtitle:
          "SCADA shows kWh after the loss. Taypro's stack adds labelled cleaning telemetry (NECTYR, live) and ORION plant intelligence (roadmap) — correlating soiling, weather, and yield for utility asset owners.",
        ctaPrimary: "Explore ORION",
        ctaPrimaryHref:
          "/solar-panel-cleaning-system/orion-plant-intelligence-platform",
        ctaSecondary: "NECTYR fleet portal",
        ctaSecondaryHref:
          "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
      },
      cards: {
        eyebrow: "Three-layer stack",
        heading: "Physical robots, operations data, plant intelligence",
        subheading:
          "Data intelligence starts with execution proof — then moves to predictive O&M.",
        card0: {
          title: "Robots execute cleaning",
          body: "GLYDE, NYUMA, HELYX fleets generate block-level pass logs every cycle — the raw events SCADA does not capture.",
        },
        card1: {
          title: "NECTYR — live operations data",
          body: "Scheduling, coverage maps, AMC tickets, and monthly OPEX settlement. Live since 2022 on 150+ utility sites.",
        },
        card2: {
          title: "ORION — plant intelligence roadmap",
          body: "Weather-normalised PR drift, dust-storm triggers, yield forecasting. Early access for select IPPs under NDA.",
        },
        card3: {
          title: "SCADA complement, not replacement",
          body: "Inverter and meter data stay in your SCADA. Taypro adds the cleaning and soiling-action layer.",
        },
        card4: {
          title: "Labelled telemetry moat",
          body: "11 billion+ annual panel passes feed models — cleaning events tied to array blocks, not generic weather feeds alone.",
        },
        card5: {
          title: "Attach at AMC renewal",
          body: "ORION designed to upgrade existing Taypro fleets on rails already operating — not a cold-start software sale.",
        },
      },
      stats: {
        eyebrow: "Data scale",
        heading: "Why Taypro's data layer is different from generic monitoring",
        card0: {
          tag: "Telemetry",
          stat: "11B+",
          label: "Panel passes annually",
          body: "Labelled cleaning events across deployed Indian utility fleets.",
        },
        card1: {
          tag: "Live sites",
          stat: "150+",
          label: "NECTYR deployments",
          body: "Recurring AMC relationships generating daily operations data since 2022.",
        },
        card2: {
          tag: "Weather AI",
          stat: "95%",
          label: "Reschedule accuracy",
          body: "Field-verified weather-aware scheduling in NECTYR — skips rain-washed days.",
        },
        card3: {
          tag: "ORION",
          stat: "Early access",
          label: "Utility IPP pilots",
          body: "Plant intelligence roadmap — contact for NDA pilot discussions.",
        },
      },
      pillars: {
        eyebrow: "Capabilities",
        heading: "What plant data intelligence should deliver",
        pillar0: {
          tag: "Execution proof",
          title: "Block-level cleaning proof",
          body: "Which panels were cleaned last night — evidence lenders and O&M governance require at 100 MW scale.",
          link: "ORION platform page",
        },
        pillar1: {
          tag: "Live today",
          title: "PR correlation",
          body: "Tie cleaning cadence to performance ratio recovery trends — not just calendar washing.",
          link: "NECTYR product page",
        },
        pillar2: {
          tag: "Predictive O&M",
          title: "Predictive scheduling (ORION)",
          body: "Dust-storm triggers and yield shortfall alerts — moving from reactive to predictive O&M on Taypro fleets.",
          link: "AI intelligence hub",
        },
      },
      prose: {
        eyebrow: "Beyond SCADA",
        heading: "Why utility plants need cleaning-aware data intelligence",
        p1: "Most plant monitoring stacks were built for inverter availability — not for soiling loss quantification or cleaning coverage audit. When PR drifts, operators debate whether the issue is soiling, curtailment, or equipment — without block-level cleaning evidence.",
        p2: "NECTYR closes the execution gap: route completion, exceptions, robot health, and monthly panel-volume reconciliation for OPEX billing. Asset managers correlate cleaning events with PR recovery instead of dispatching blind crew visits.",
        p3: "ORION extends this into plant intelligence: weather feeds, soiling models, and yield analytics designed for Taypro fleet customers. ORION is on the roadmap with early access for select asset owners — not a separate product for non-Taypro fleets today.",
        p4: "11 billion+ annual panel passes create a labelled dataset competitors cannot replicate without equivalent field presence — but awards and throughput claims require your own pilot PR validation.",
        linkPrimary: "Fleet monitoring software guide",
        linkPrimaryHref: "/solar-fleet-monitoring-software",
        linkSecondary: "AI & intelligence technology",
        linkSecondaryHref: "/technology/ai-intelligence",
      },
      steps: {
        eyebrow: "Adoption path",
        heading: "How plant data intelligence rolls out on Taypro fleets",
        subheading: "From robot deployment to ORION early access.",
        step0Title: "Deploy robots + NECTYR",
        step0Body:
          "Cleaning execution generates block-level telemetry — foundation for all analytics.",
        step1Title: "Establish PR baselines",
        step1Body:
          "Correlate cleaning cycles with SCADA PR trends per block or feeder.",
        step2Title: "Optimise cadence with weather AI",
        step2Body:
          "NECTYR reschedules around rain and dust storms — reducing wasted passes.",
        step3Title: "Portfolio governance reviews",
        step3Body:
          "Monthly reconciliation and quarterly cycle adjustments for multi-site IPPs.",
        step4Title: "ORION early access at renewal",
        step4Body:
          "Plant intelligence pilots for qualifying Taypro AMC customers — NDA required.",
      },
      highlight: {
        heading: "The data question",
        lead: "Can you prove which blocks were cleaned before PR recovered?",
        body: "Generic dashboards show energy after the fact. Taypro ties labelled cleaning events to array geography — the prerequisite for credible plant data intelligence.",
      },
      proseSecondary: {
        eyebrow: "ORION status",
        heading: "Live today vs roadmap",
        p1: "NECTYR is production software on deployed fleets — scheduling, tickets, coverage exports, OPEX settlement. Use it today on Taypro CAPEX and OPEX programmes.",
        p2: "ORION capabilities described on taypro.in — predictive scheduling, enhanced yield analytics, optional sensing — are under active development. Early access is offered to select utility IPPs under NDA.",
        p3: "Do not substitute this page for a product datasheet. Request an ORION briefing for current pilot scope and integration requirements.",
        linkPrimary: "ORION product page",
        linkPrimaryHref:
          "/solar-panel-cleaning-system/orion-plant-intelligence-platform",
        linkSecondary: "Utility operations context",
        linkSecondaryHref: "/utility-scale-solar-operations",
      },
      resources: {
        eyebrow: "Research",
        heading: "Plant data & O&M articles",
        link0Title: "Fleet monitoring vs plant intelligence",
        link0Href: "/solar-fleet-monitoring-software",
        link1Title: "Utility-scale solar operations",
        link1Href: "/utility-scale-solar-operations",
        link2Title: "AI intelligence at Taypro",
        link2Href: "/technology/ai-intelligence",
      },
      faq: faq(
        "Solar plant data intelligence — FAQ",
        "NECTYR live capabilities and ORION roadmap.",
        [
          {
            q: "What is the difference between NECTYR and ORION?",
            a: "NECTYR is live fleet operations software. ORION is the plant intelligence layer on the roadmap — PR analytics, predictive scheduling, yield forecasting.",
          },
          {
            q: "Does ORION replace SCADA?",
            a: "No. ORION complements SCADA and CMMS. Electrical monitoring stays in your existing stack.",
          },
          {
            q: "Is ORION available today?",
            a: "ORION is in active development with early access for select Taypro fleet customers. NECTYR is live on 150+ sites.",
          },
          {
            q: "Can I buy ORION without Taypro robots?",
            a: "ORION is designed for Taypro cleaning telemetry. Enterprise discussions may apply for mixed fleets — contact us.",
          },
          {
            q: "What data does NECTYR capture?",
            a: "Cleaning routes, coverage, robot health, faults, weather reschedules, and monthly panel counts for OPEX billing.",
          },
          {
            q: "How does this relate to fleet monitoring software?",
            a: "Fleet monitoring page focuses on NECTYR ops keywords. This page focuses on plant intelligence and yield analytics positioning.",
          },
          {
            q: "What is the 11 billion passes figure?",
            a: "Cumulative annual cleaning pass volume across deployed fleets — labelled events feeding analytics roadmap.",
          },
          {
            q: "How do IPPs pilot ORION?",
            a: "Early access under NDA for qualifying AMC customers — typically at renewal on existing Taypro fleets.",
          },
          {
            q: "Does data intelligence help SECI compliance?",
            a: "Documented cleaning coverage supports technical due diligence — align with your tender's evidence requirements.",
          },
          {
            q: "Is there an API for portfolio systems?",
            a: "Enterprise integration discussions available — scope depends on deployment model.",
          },
          {
            q: "How is weather AI validated?",
            a: "NECTYR cites 95% field-verified reschedule accuracy — see performance methodology for claim definitions.",
          },
          {
            q: "Where to start?",
            a: "Deploy robots with NECTYR, establish PR baselines, then discuss ORION at AMC renewal.",
          },
        ]
      ),
      quoteForm: {
        eyebrow: "Platform inquiry",
        title: "Request NECTYR demo or ORION briefing",
        placeholder:
          "Portfolio MW, Taypro fleet status, SCADA vendor, and interest in NECTYR vs ORION.",
      },
      cta: {
        heading: "Start with execution data — grow into intelligence",
        body: "NECTYR is live on Taypro fleets today. Ask about ORION early access for your portfolio.",
        primary: "Contact platform team",
        primaryHref: "/contact",
        secondary: "Explore NECTYR",
        secondaryHref:
          "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
      },
      related: {
        label: "Related:",
        link0: "Fleet monitoring software",
        link0Href: "/solar-fleet-monitoring-software",
        link1: "ORION platform",
        link1Href:
          "/solar-panel-cleaning-system/orion-plant-intelligence-platform",
        link2: "Solar O&M services",
        link2Href: "/solar-om-services",
        link3: "AI intelligence",
        link3Href: "/technology/ai-intelligence",
      },
    },
  },
  "enterprise-solar-cleaning-partnership.json": {
    EnterprisePartnershipPage: {
      meta: {
        title: "Enterprise Solar Cleaning Partnership India | Multi-Site IPP",
        description:
          "Enterprise solar cleaning partnership for Indian IPPs and CPSUs: multi-site robotic fleets, pan-India SLAs, NECTYR portfolio governance, SECI-aligned reporting, 50–500 MW references.",
        openGraphTitle: "Enterprise Solar Cleaning Partnership | Taypro",
        openGraphDescription:
          "One accountable partner for robots, operators, spares, and fleet data across utility portfolios.",
      },
      breadcrumbHub: "Solar panel cleaning robots",
      breadcrumbHubHref: "/solar-panel-cleaning-system",
      breadcrumb: "Enterprise cleaning partnership",
      schema: {
        name: "Taypro Enterprise Solar Cleaning Partnership",
        description:
          "Multi-site robotic cleaning partnership for Indian IPP, CPSU, and SECI utility portfolios.",
        serviceType: "Enterprise solar cleaning partnership",
        areaServed: "India",
      },
      hero: {
        eyebrow: "Enterprise · Multi-site",
        title: "Enterprise solar cleaning partnership for IPP & CPSU portfolios",
        subtitle:
          "One vendor for robots, operators, spares, and NECTYR data across 50–500 MW sites — structured SLAs, pan-India mobilisation, and audit-ready reporting for SECI, DVC, and institutional asset owners.",
        ctaPrimary: "Request enterprise proposal",
        ctaPrimaryHref: "/contact",
        ctaSecondary: "Large-scale capability",
        ctaSecondaryHref: "/large-scale-solar-panel-cleaning",
      },
      stats: {
        eyebrow: "Enterprise proof",
        heading: "Why portfolios choose a single cleaning partner",
        card0: {
          tag: "References",
          stat: "360 MW",
          label: "Largest single-site deployment",
          body: "Akhadana Rajasthan — multi-robot GLYDE fleet at production scale.",
        },
        card1: {
          tag: "Response",
          stat: "<24h",
          label: "Breakdown target",
          body: "Regional service teams with NECTYR remote triage on enterprise fleets.",
        },
        card2: {
          tag: "Coverage",
          stat: "Pan-India",
          label: "Multi-state portfolios",
          body: "Rajasthan, Gujarat, MP, Maharashtra, Karnataka, and expanding hubs.",
        },
        card3: {
          tag: "Governance",
          stat: "NECTYR",
          label: "Portfolio-level reporting",
          body: "Block coverage, monthly reconciliation, and lender-ready exports.",
        },
      },
      cards: {
        eyebrow: "Partnership scope",
        heading: "What enterprise solar cleaning partnership includes",
        subheading: "Beyond single-site RFQ — portfolio economics and governance.",
        card0: {
          title: "Standardised commercial framework",
          body: "CAPEX, OPEX, or blended models across plants with consistent NECTYR measurement rules.",
        },
        card1: {
          title: "Phased multi-site mobilisation",
          body: "Zone-by-zone rollout on 200 MW+ sites without disrupting parallel O&M workstreams.",
        },
        card2: {
          title: "SECI & CPSU alignment",
          body: "Cleaning SOPs and audit trails structured for utility tender technical diligence.",
        },
        card3: {
          title: "Single accountable vendor",
          body: "Robots, operators, spares, software — not disconnected crews and spreadsheets per state.",
        },
        card4: {
          title: "Portfolio PR reviews",
          body: "Quarterly soiling and cycle adjustments coordinated across assets.",
        },
        card5: {
          title: "Lender audit package",
          body: "NECTYR logs, coverage maps, and monthly panel-volume reconciliation for project finance.",
        },
      },
      prose: {
        eyebrow: "Partnership model",
        heading: "Multi-site IPP cleaning — why one partner beats state-wise crews",
        p1: "Portfolio asset managers face inconsistent cleaning quality when every state uses a different labour contractor. Enterprise partnership standardises robots, SOPs, NECTYR reporting, and SLA response across plants — one governance model for Rajasthan dust and Karnataka humidity alike.",
        p2: "Taypro deploys on SECI, DVC, state discom, and IPP references from 50 MW to 360 MW single sites. Bachau DVC 300 MW (172 GLYDE), Neneva 250 MW trackers, and Akhadana 360 MW demonstrate robots-per-MW planning at institutional scale.",
        p3: "Commercial models flex per asset: OPEX on balance-sheet-sensitive holdings, CAPEX on core 20-year assets, hybrid transitions after proven PR recovery. Finance committees model both in the ROI calculator before portfolio master agreements.",
        p4: "Scope boundary remains clear: Taypro owns cleaning execution and fleet data. HV switching, inverter maintenance, and tracker mechanical work stay with your EPC or electrical O&M partner — we integrate via schedule coordination, not scope creep.",
        linkPrimary: "National service overview",
        linkPrimaryHref: "/solar-panel-cleaning-service-india",
        linkSecondary: "CAPEX vs OPEX guide",
        linkSecondaryHref: "/solar-cleaning-capex-vs-opex",
      },
      steps: {
        eyebrow: "Onboarding",
        heading: "Enterprise partnership mobilisation — five phases",
        subheading: "From portfolio discovery to governed operations.",
        step0Title: "Portfolio discovery workshop",
        step0Body:
          "MW per site, states, installation mix, current cleaning spend, SECI/IPP context, and target PR assumptions.",
        step1Title: "Master commercial framework",
        step1Body:
          "CAPEX/OPEX per plant or blended enterprise rates — aligned to NECTYR measurement and SLA tiers.",
        step2Title: "Phased deployment schedule",
        step2Body:
          "Prioritise highest-soiling assets first; parallel mobilisation where service hubs exist.",
        step3Title: "NECTYR portfolio dashboard",
        step3Body:
          "Centralised scheduling, coverage audits, and monthly settlement across sites.",
        step4Title: "Quarterly governance cadence",
        step4Body:
          "PR/soiling review, cycle adjustments, and ORION intelligence upgrade discussions at renewal.",
      },
      eligibility: {
        eyebrow: "Partnership fit",
        title: "Who enterprise partnership is built for",
        forTitle: "Ideal fit",
        for0: "IPP or CPSU portfolios with multiple utility sites 50 MW+",
        for1: "Asset managers needing one SLA and NECTYR audit trail across states",
        for2: "SECI or state tender programmes requiring documented cleaning coverage",
        for3: "Teams replacing fragmented state-wise manual contracts",
        notForTitle: "Typically not a fit",
        not0: "Single small C&I rooftop without utility-scale sister plants",
        not1: "One-off annual wash without recurring robotic programme",
        not2: "Buyers seeking full-plant EPC O&M including HV and inverters",
      },
      pillars: {
        eyebrow: "Enterprise pillars",
        heading: "What institutional sponsors evaluate",
        pillar0: {
          title: "Scale evidence",
          body: "Named 250–360 MW references — not pilot-scale marketing.",
        },
        pillar1: {
          title: "Operational SLAs",
          body: "Breakdown response, spare parts, and remote diagnostics at portfolio level.",
        },
        pillar2: {
          title: "Data governance",
          body: "NECTYR exports for lenders, internal audit, and SECI technical reviewers.",
        },
      },
      highlight: {
        heading: "The portfolio question",
        lead: "Can one vendor govern cleaning across every state you operate in?",
        body: "Enterprise partnership replaces fragmented crew contracts with one robotic fleet standard, one software layer, and one commercial counterparty.",
      },
      proseSecondary: {
        eyebrow: "Client types",
        heading: "IPPs, CPSUs, and SECI programmes",
        p1: "Independent power producers optimise portfolio TCO and gearing — often mixing OPEX on new acquisitions and CAPEX on long-hold assets. CPSUs and SECI-tendered plants emphasise compliance evidence and pan-India vendor stability.",
        p2: "DVC and state discom references in Gujarat and Rajasthan demonstrate institutional procurement at 250–300 MW per site. Ask for robots-per-MW models and commissioning timelines in your enterprise RFQ.",
        p3: "Partnership discussions should include ORION roadmap for predictive O&M at AMC renewal — optional upgrade on Taypro-operated fleets.",
        linkPrimary: "Solar O&M services",
        linkPrimaryHref: "/solar-om-services",
        linkSecondary: "View automatic projects",
        linkSecondaryHref: "/projects/automatic",
      },
      resources: {
        eyebrow: "Enterprise research",
        heading: "Partnership due diligence",
        link0Title: "Large-scale MW deployments",
        link0Href: "/large-scale-solar-panel-cleaning",
        link1Title: "Module cleaning CAPEX vs OPEX portfolios",
        link1Href:
          "/blog/module-cleaning-system-capex-vs-opex-models-for-25100-mw-portfolios",
        link2Title: "Utility operations guide",
        link2Href: "/utility-scale-solar-operations",
      },
      faq: faq(
        "Enterprise solar cleaning partnership — FAQ",
        "Multi-site procurement and governance.",
        [
          {
            q: "What is an enterprise cleaning partnership?",
            a: "A master agreement covering robots, operators, spares, and NECTYR across multiple utility sites — one SLA and reporting standard.",
          },
          {
            q: "Minimum portfolio size?",
            a: "Typically multiple sites or single sites 50 MW+. Smaller one-off sites use standard service RFQ.",
          },
          {
            q: "Can we mix CAPEX and OPEX across plants?",
            a: "Yes. Enterprise frameworks often assign OPEX to new assets and CAPEX to long-hold core plants.",
          },
          {
            q: "How does reporting work for lenders?",
            a: "NECTYR block-level logs, coverage maps, and monthly panel-volume reconciliation per site and portfolio roll-up.",
          },
          {
            q: "What SLAs apply?",
            a: "Breakdown response targets under 24 hours on enterprise fleets with regional spares — detailed in commercial proposal.",
          },
          {
            q: "Does Taypro handle electrical O&M?",
            a: "No. Cleaning and fleet data only. Partner with your EPC for HV, inverters, and trackers mechanical.",
          },
          {
            q: "SECI compliance support?",
            a: "Cleaning SOPs and audit exports structured for technical due diligence — align to your tender checklist.",
          },
          {
            q: "Named references?",
            a: "Akhadana 360 MW, Bachau DVC 300 MW, Neneva 250 MW — featured on this page and projects gallery.",
          },
          {
            q: "Mobilisation timeline?",
            a: "Weeks per site depending on row count — phased on 200 MW+ plants. Proposed in enterprise proposal.",
          },
          {
            q: "ORION for portfolios?",
            a: "ORION early access discussed at AMC renewal for qualifying Taypro fleet customers.",
          },
          {
            q: "How to start?",
            a: "Submit portfolio MW, states, and commercial model preference via contact form.",
          },
          {
            q: "Difference vs service India page?",
            a: "Service India is national overview. This page is multi-site enterprise contracting and governance.",
          },
        ]
      ),
      quoteForm: {
        eyebrow: "Enterprise RFQ",
        title: "Request portfolio partnership proposal",
        placeholder:
          "Total MW, number of sites, states, SECI/IPP context, CAPEX/OPEX preference, mobilisation timeline.",
      },
      cta: {
        heading: "One partner across your portfolio",
        body: "Share your multi-site profile for enterprise commercial terms and mobilisation plan.",
        primary: "Request proposal",
        primaryHref: "/contact",
        secondary: "Large-scale references",
        secondaryHref: "/large-scale-solar-panel-cleaning",
      },
      related: {
        label: "Related:",
        link0: "Service India",
        link0Href: "/solar-panel-cleaning-service-india",
        link1: "Large-scale cleaning",
        link1Href: "/large-scale-solar-panel-cleaning",
        link2: "Solar O&M services",
        link2Href: "/solar-om-services",
        link3: "Plant data intelligence",
        link3Href: "/solar-plant-data-intelligence",
      },
    },
  },
});

for (const [file, data] of Object.entries(PAGES)) {
  fs.writeFileSync(path.join(outDir, file), `${JSON.stringify(data, null, 2)}\n`);
  console.log("wrote", file);
}
