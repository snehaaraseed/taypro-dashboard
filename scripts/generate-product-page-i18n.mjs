/**
 * Generates messages/pages/en/{slug}.json for model-b, model-t, cleaning-service.
 * Run: node scripts/generate-product-page-i18n.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");

function loadExtracted(slug) {
  return JSON.parse(
    readFileSync(join(root, "scripts", `extracted-${slug}.json`), "utf8")
  );
}

function idx(arr, map = (x) => x) {
  const o = {};
  (arr || []).forEach((item, i) => {
    o[String(i)] = map(item);
  });
  return o;
}

function writeLocale(slug, data) {
  const dir = join(root, "messages/pages/en");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${slug}.json`), JSON.stringify(data, null, 2));
  console.log("wrote", slug);
}

// --- Model B supplements (missing from extractor) ---
const modelBSupplements = {
  usps: {
    "7": {
      title: "TÜV NORD Certified Build",
      description:
        "Independently certified by TÜV NORD for IP55 protection, validated under simulated sandstorms (10 g/m²) and tested for damp-heat and dry-heat extremes.",
    },
  },
  features: {
    "7": {
      title: "Sealed Body, IP65 Protection",
      body: "All electrical components, wiring harnesses and connectors are fully enclosed within the sealed device body, providing IP65-rated protection against dust, moisture and environmental contaminants in extreme field conditions.",
    },
  },
  steps: {
    "5": {
      name: "Recharge and review performance",
      text: "After completing the assigned arrays (up to 3 km per charge), the robot is returned to its docking station for lithium-ion recharging. Cleaning telemetry and operational health data are available via the Taypro Console portal for fleet-wide review.",
    },
  },
  faqs: {
    "9": {
      question: "What kind of after-sales support does Taypro provide for Model-B?",
      answer:
        "Every Model-B deployment is backed by Taypro's pan-India service model: pre-scheduled preventive and corrective maintenance, immediate remote diagnostics upon incident notification, and same-day on-site breakdown resolution targets, anywhere in India. Annual maintenance contracts (AMC) are available for long-term operations.",
    },
  },
};

function buildModelB() {
  const ex = loadExtracted("model-b");
  const usps = { ...idx(ex.modelBUsps), ...modelBSupplements.usps };
  const features = { ...idx(ex.modelBFeatures), ...modelBSupplements.features };
  const steps = { ...idx(ex.modelBSteps), ...modelBSupplements.steps };
  const faqs = { ...idx(ex.modelBFaqs), ...modelBSupplements.faqs };

  return {
    ModelBPage: {
      meta: {
        title:
          "Semi-Automatic Solar Panel Cleaning Robot, Taypro Model-B (Pick-and-Place)",
        description:
          "Taypro Model-B is a 39 kg pick-and-place, semi-automatic Solar Panel Cleaning Robot. Counter-rotating PBT brushes remove 99%+ dust in a single waterless pass, clean a 1 MW plant in under 2 hours, run up to 3 km on a single charge, TÜV NORD certified, built for fixed-tilt and seasonal-tilt plants.",
        openGraphDescription:
          "Pick-and-place Solar Panel Cleaning Robot. 39 kg, waterless, dual counter-rotating PBT brushes, 99%+ dust removal in a single pass, 3 km per charge, TÜV NORD certified.",
        openGraphImageAlt:
          "Taypro Semi-Automatic Solar Panel Cleaning Robot Model-B, Pick-and-place type, waterless",
        twitterDescription:
          "39 kg pick-and-place Solar Panel Cleaning Robot. Waterless, dual counter-rotating PBT brushes, 99%+ dust removal per pass, TÜV NORD certified.",
      },
      breadcrumbs: {
        robots: "Solar Panel Cleaning Robots",
        current: "Semi-Automatic Solar Panel Cleaning Robot",
      },
      schema: {
        productName: "Semi-Automatic Solar Panel Cleaning Robot - Model-B",
        productDescription:
          "Taypro Model-B is a 39 kg pick-and-place, semi-automatic Solar Panel Cleaning Robot. Counter-rotating UV-stable PBT brushes remove 99%+ dust in a single pass, clean a 1 MW plant in under 2 hours, run up to 3 km on a single charge, TÜV NORD certified, and built for fixed tilt, seasonal tilt and horizontal single-axis tracker plants.",
        offersPrice: "Contact for pricing",
        howToName:
          "How to clean solar panels with the Taypro Model-B Semi-Automatic Solar Panel Cleaning Robot",
        howToDescription:
          "Step-by-step deployment of the Taypro Model-B pick-and-place semi-automatic solar panel cleaning robot, from lifting the robot onto the first row through recharging at the docking station.",
      },
      hero: {
        title: "Semi-Automatic Solar Panel Cleaning Robot, Model-B",
        subtitleBefore:
          "A 39 kg pick-and-place, waterless Solar Panel Cleaning Robot engineered for utility-scale solar power plants. Dual counter-rotating UV-stable PBT brushes lift over",
        subtitleStrong: "99% of dust in a single pass",
        subtitleAfter:
          ", cleaning a 1 MW block in under 2 hours and running up to 3 km on a single charge, operable by any two-person site team.",
        imgAlt:
          "Taypro Model-B, Semi-Automatic Solar Panel Cleaning Robot, pick-and-place waterless cleaner for utility-scale solar plants",
        ctaText: "Request a quote",
      },
      usps,
      features,
      specs: idx(ex.modelBSpecs),
      steps,
      faqs,
      misc: {
        modelCardsTitle: "Looking for more solutions?",
        callbackLine1: "Schedule Online Demo For Semi-Automatic Solar",
        callbackLine2: "Panel Cleaning Robots",
        faqTitle: "Frequently Asked Questions",
        faqSubtitle:
          "Common questions about the Taypro Model-B Semi-Automatic Solar Panel Cleaning Robot.",
        product360Label:
          "Taypro Model-B, Semi-Automatic Solar Panel Cleaning Robot",
      },
    },
    Common: {
      breadcrumbHome: "Home",
      connectivitySummary:
        "LTE, Wi-Fi, hybrid self-healing RF mesh, LoRa, and LoRaWAN",
      breadcrumbRobots: "Solar Panel Cleaning Robots",
    },
  };
}

const modelTSupplements = {
  usps: {
    "7": {
      title: "TÜV NORD Certified Build",
      description:
        "Independently tested and certified by TÜV NORD for IP55 protection and validated under simulated sandstorm and damp-heat/dry-heat extremes.",
    },
  },
  features: {
    "7": {
      title: "Battery-Aware Return Safety",
      body: "The system monitors battery levels in real time and only commits to a cleaning distance it can complete safely, ensuring the robot returns to its docking station without stopping midway on the tracker row.",
    },
    "8": {
      title: "Sealed IP65 Body, Wind-Safe at Dock",
      body: "All electrical components and wiring are fully enclosed within the sealed IP65 device body. While docked, the robot is securely locked and can withstand wind speeds of up to 180 km/hr, with operational cleaning permitted up to 40 km/hr wind.",
    },
  },
  steps: {
    "5": {
      name: "Recharge and cloud telemetry sync",
      text: "Lithium-ion charging starts automatically. Battery level, charging status, cycle telemetry and overall performance are continuously synced to the Taypro Console over {connectivity} for fleet-wide visibility.",
    },
  },
  faqs: {
    "9": {
      question:
        "How is Model-T monitored and controlled across a large tracker plant?",
      answer:
        "All Model-T robots connect to the Taypro Console using {connectivity}. The portal provides a unified interface to schedule cleaning, adjust settings, monitor battery levels, view cycle telemetry, receive weather alerts and roll up performance across hundreds of robots and plants, from any device, anywhere.",
    },
  },
};

function buildModelT() {
  const ex = loadExtracted("model-t");
  return {
    ModelTPage: {
      meta: {
        title:
          "Solar Panel Cleaning Robot for Single-Axis Trackers, Taypro Model-T",
        description:
          "Taypro Model-T is an AI- and ML-powered, waterless autonomous Solar Panel Cleaning Robot purpose-built for single-axis tracker solar farms. 99%+ dust removal per dual-pass run, up to 3,600 modules per charge, ±15° flex between tables, NEXTracker and Gamechanger compatible (-52° to +52° module tilt), TÜV NORD certified.",
        openGraphDescription:
          "Autonomous AI-powered Solar Panel Cleaning Robot for single-axis tracker plants. 99%+ dust removal per cycle, up to 3,600 modules per charge, Taypro Console via LTE/Wi-Fi/RF mesh/LoRa/LoRaWAN, NEXTracker & Gamechanger compatible, TÜV NORD certified.",
        openGraphImageAlt:
          "Taypro Single-Axis Tracker Solar Panel Cleaning Robot Model-T, AI-powered, waterless",
        twitterDescription:
          "Autonomous Solar Panel Cleaning Robot for tracker plants. 3,600 modules per charge, LTE/Wi-Fi/RF mesh/LoRa/LoRaWAN, NEXTracker & Gamechanger compatible.",
      },
      breadcrumbs: {
        robots: "Solar Panel Cleaning Robots",
        current: "Solar Panel Cleaning Robot for Single-Axis Trackers",
      },
      schema: {
        productName:
          "Solar Panel Cleaning Robot for Single-Axis Trackers - Model-T",
        productDescription:
          "Taypro Model-T is an AI- and ML-powered autonomous, waterless Solar Panel Cleaning Robot purpose-built for single-axis tracker installations. Dual-pass dry cleaning removes 99%+ dust per cycle, cleans up to 3,600 modules per charge, flexes ±15° between tables, connects via {connectivity}, is compatible with NEXTracker and Gamechanger, supports module tilts from -52° to +52°, TÜV NORD certified.",
        offersPrice: "Contact for pricing",
        howToName:
          "How does the Taypro Model-T Single-Axis Tracker Solar Panel Cleaning Robot clean tracker plants?",
        howToDescription:
          "Step-by-step autonomous cleaning cycle of the Taypro Model-T solar panel cleaning robot for single-axis tracker installations, from AI-scheduled deployment through self-docking and cloud telemetry sync.",
      },
      hero: {
        title:
          "Solar Panel Cleaning Robot for Single-Axis Trackers, Model-T",
        subtitleBefore:
          "An AI- and ML-powered, waterless autonomous Solar Panel Cleaning Robot purpose-built for single-axis tracker solar farms. Cleans up to 3,600 modules per charge,",
        subtitleStrong: "flexes ±15° between tables",
        subtitleAfter:
          ", supports module tilts from -52° to +52°, and is compatible with NEXTracker, Gamechanger and equivalent trackers.",
        imgAlt:
          "Taypro Single-Axis Tracker Solar Panel Cleaning Robot Model-T - Autonomous robotic cleaning system for tracking solar panel installations",
        ctaText: "Request a quote",
      },
      usps: { ...idx(ex.modelTUsps), ...modelTSupplements.usps },
      features: {
        ...idx(ex.modelTFeatures),
        ...modelTSupplements.features,
      },
      specs: idx(ex.modelTSpecs),
      steps: { ...idx(ex.modelTSteps), ...modelTSupplements.steps },
      faqs: { ...idx(ex.modelTFaqs), ...modelTSupplements.faqs },
      misc: {
        modelCardsTitle: "Looking for more solutions?",
        callbackLine1: "Schedule Online Demo For Single-Axis Tracker",
        callbackLine2: "Solar Panel Cleaning Robots",
        faqTitle: "Frequently Asked Questions",
        faqSubtitle:
          "Common questions about the Taypro Model-T Solar Panel Cleaning Robot for single-axis tracker installations.",
        product360Label:
          "Taypro Model-T, Solar Panel Cleaning Robot for Single-Axis Trackers",
      },
    },
    Common: {
      breadcrumbHome: "Home",
      connectivitySummary:
        "LTE, Wi-Fi, hybrid self-healing RF mesh, LoRa, and LoRaWAN",
    },
  };
}

function buildCleaningService() {
  const ex = loadExtracted("cleaning-service");
  return {
    CleaningServicePage: {
      meta: {
        title:
          "Robotic Solar Panel Cleaning Service, Pay Per Panel | Taypro OPEX",
        description:
          "Taypro OPEX is a monthly robotic solar panel cleaning service for utility-scale plants (typically 50 MW+). We deploy Model-A, Model-B or Model-T as needed, recommend 3–10 waterless dry cycles per month from a full plant soiling study, and bill only for panels cleaned. Includes cleaning SOPs, robot paths, rest zones, dedicated parking, and daily reports via Taypro Console.",
        openGraphDescription:
          "Monthly waterless robotic cleaning: plant-specific 3–10 cycles, detailed cleaning plans, daily reports, billing per panels cleaned. Model-A, B or T.",
        openGraphImageAlt:
          "Taypro OPEX robotic solar panel cleaning service at utility-scale solar plant",
        twitterDescription:
          "Pay per panel cleaned monthly. Plant study, 3–10 dry cycles, SOPs, paths, rest zones, Taypro Console reports.",
      },
      breadcrumbs: {
        robots: "Solar Panel Cleaning Robots",
        current: "Taypro OPEX, Solar Panel Cleaning Service",
      },
      schema: {
        name: "Taypro OPEX, Robotic Solar Panel Cleaning Service",
        description:
          "Monthly robotic solar panel cleaning service for utility-scale plants: pay per panel cleaned, plant-specific soiling study, 3–10 recommended waterless dry cycles per month, detailed cleaning plans with paths and robot rest zones, daily reports via Taypro Console, deployment of Taypro Model-A, Model-B or Model-T robots with dedicated operators.",
        serviceType: "Solar panel cleaning service",
      },
      hero: {
        title: "Taypro OPEX, Robotic Solar Panel Cleaning Service",
        subtitlePanels: "solar panels we clean each month",
        subtitleCycles: "3–10 waterless dry cleaning cycles per month",
        modelA: "Model-A",
        modelB: "Model-B",
        modelT: "Model-T",
        console: "Taypro Console",
        imgAlt:
          "Taypro OPEX solar panel cleaning service, robotic waterless cleaning at utility-scale solar plant",
        ctaText: "Request a quote",
      },
      faqs: idx(ex.opexServiceFaqs),
      howToSteps: idx(ex.opexHowToSteps),
      plantStudy: idx(ex.plantStudyFactors),
      benefits: {
        "0": "Plant-specific soiling study & 3–10 dry cycles / month",
        "1": "Billing based on panels cleaned each month",
        "2": "Detailed SOP: timing, paths, idle & dedicated rest zones",
        "3": "Daily cleaning reports & Taypro Console transparency",
        "4": "Model-A, Model-B or Model-T matched to your site",
        "5": "Dedicated operators + nationwide technical support",
      },
      misc: {
        modelCardsTitle: "Looking for more solutions?",
        projectsHeader: "Our Projects",
        faqTitle: "Frequently asked questions",
        faqSubtitle:
          "Taypro OPEX service questions, plus broader Taypro programme FAQs below.",
      },
    },
    Common: {
      breadcrumbHome: "Home",
      connectivitySummary:
        "LTE, Wi-Fi, hybrid self-healing RF mesh, LoRa, and LoRaWAN",
    },
  };
}

writeLocale("model-b", buildModelB());
writeLocale("model-t", buildModelT());
writeLocale("cleaning-service", buildCleaningService());

// Clone to hi/ar/ja/bn with breadcrumbHome only (body stays EN until translated)
for (const slug of ["model-b", "model-t", "cleaning-service", "taypro-console"]) {
  const enPath = join(root, "messages/pages/en", `${slug}.json`);
  const en = JSON.parse(readFileSync(enPath, "utf8"));
  for (const [loc, home] of [
    ["hi", "होम"],
    ["ar", "الرئيسية"],
    ["ja", "ホーム"],
    ["bn", "হোম"],
  ]) {
    const out = JSON.parse(JSON.stringify(en));
    out.Common = { ...out.Common, breadcrumbHome: home };
    const dir = join(root, "messages/pages", loc);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${slug}.json`), JSON.stringify(out, null, 2));
  }
}

console.log("done");
