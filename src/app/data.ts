import { CRADYL_PRODUCT_PATH } from "@/lib/product-cradyl";
import { MINY_PRODUCT_PATH, ORION_PRODUCT_PATH } from "@/lib/product-coming-soon";
import { buildTayproMarketingImpactStats } from "@/lib/esg/format-fleet-marketing-impact";
import { buildTayproPublicProofStats } from "@/lib/marketing/public-proof-stats";
import {
  getRelatedProductCards,
  HARDWARE_PRODUCT_IDS,
  PRODUCT_CATALOG,
  type ProductId,
} from "@/lib/products/catalog";

// import { EnergyResourceCard } from "./utils/extractSlug";
interface EnergyResourceCard {
  title: string;
  imgSrc: string;
  date: string;
  href: string;
}

/** Fleet connectivity to NECTYR (GLYDE, GLYDE-X, NYUMA, NYUMA-X). */
export const tayproRobotConnectivitySummary =
  "LTE, Wi-Fi, hybrid self-healing RF mesh, LoRa, and LoRaWAN";

/**
 * Canonical marketing copy for breakdown / field service, keep aligned across
 * hub, product pages, FAQs, and metadata (same-day pan-India positioning).
 */
export const tayproServiceSlaCopy = {
  panIndiaServiceCardBody:
    "Taypro targets same-day on-site breakdown resolution across India, with immediate remote diagnostics through NECTYR, regional spare inventory, and structured AMC programs so mean time to repair stays predictable.",
  combinedSupportParagraph:
    "Taypro provides same-day on-site breakdown resolution across India along with immediate remote diagnostics from NECTYR, dedicated field engineers, and AMC-backed spare planning.",
} as const;

/**
 * Impact and scale figures for hero strips and sustainability callouts.
 * Computed from fleet ESG assumptions (see `src/lib/esg/`). Sync hardcoded
 * product-page trust stats when `fleetCapacityGw` or assumptions change.
 */
export const tayproMarketingImpactStats = buildTayproMarketingImpactStats();

/** Trusted-by stat row on product marketing pages (four tiles). */
export const tayproTrustedByStatsStrip = [
  tayproMarketingImpactStats.robotCapacityDeployed,
  tayproMarketingImpactStats.co2ReducedAnnually,
  tayproMarketingImpactStats.waterSavedAnnually,
  tayproMarketingImpactStats.robotsManufacturedPerMonth,
] as const;

/** Homepage stat strip, public proof order (capacity → CO₂ → generation → water). */
export const tayproHomeStatsStrip = [
  tayproMarketingImpactStats.robotCapacityDeployed,
  tayproMarketingImpactStats.co2ReducedAnnually,
  tayproMarketingImpactStats.extraCleanEnergyAnnually,
  tayproMarketingImpactStats.waterSavedAnnually,
] as const;

function hardwareRobotFromCatalog(id: ProductId) {
  const p = PRODUCT_CATALOG[id];
  return {
    model: p.itemName,
    marketingName: p.marketingName,
    description: p.description,
    imgPath: p.imagePath,
    href: p.href,
    productId: p.id,
  };
}

export const robots = [
  ...HARDWARE_PRODUCT_IDS.map(hardwareRobotFromCatalog),
  {
    model: "Taypro Opex",
    marketingName: "Robotic solar panel cleaning service",
    description:
      "Pay-per-panel-cleaned Opex, Taypro operates the cleaning robot fleet on your plant with no upfront CAPEX.",
    imgPath: "/tayprorobots/taypro-opex.jpg",
    href: "/solar-panel-cleaning-system/solar-panel-cleaning-service",
  },
  {
    model: "NECTYR",
    marketingName: "Solar cleaning robot monitoring software",
    description:
      "Fleet portal to schedule, monitor, and report on solar panel cleaning robots across your site.",
    imgPath: "/tayproasset/taypro-console.png",
    href: "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
  },
];

export const robotProducts = HARDWARE_PRODUCT_IDS.map(hardwareRobotFromCatalog);
export const robotSolutions = robots.filter(
  (r) => r.model === "Taypro Opex" || r.model === "NECTYR"
);

/** Launched fleet accessories (non-cleaning-robot hardware). */
export const fleetAccessoryProducts = [
  {
    model: "CRADYL",
    marketingName: "Autonomous row-transfer docking station",
    description:
      "Battery-powered movable docking station on end-row rails that autonomously transfers one cleaning robot between rows on scattered plants.",
    imgPath: "/tayprorobots/cradyl-field.png",
    href: CRADYL_PRODUCT_PATH,
  },
] as const;

/** Upcoming products, marketing pages live; hardware not yet GA. */
export const comingSoonRobotProducts = [
  {
    model: "MINY",
    marketingName: "Compact rooftop solar cleaning robot",
    description:
      "A compact cleaning robot for smaller rooftop plants, waterless, lightweight, and sized for distributed commercial rooftops.",
    imgPath: "/tayprorobots/taypro-helyx-semi-automatic-solar-cleaning-robot.png",
    href: MINY_PRODUCT_PATH,
  },
  {
    model: "ORION",
    marketingName: "Solar plant intelligence platform",
    description:
      "Generation-trained plant health monitoring SaaS, SCADA-aware insights enriched by Taypro robot field data on site.",
    imgPath: "/tayproasset/taypro-console.png",
    href: ORION_PRODUCT_PATH,
  },
] as const;

export const ourSolutions = HARDWARE_PRODUCT_IDS.map((id) => {
  const p = PRODUCT_CATALOG[id];
  return {
    model: p.itemName,
    description: p.description,
    imgPath: p.imagePath,
    href: p.href,
  };
});

export const clientLogos = [
  "/tayproclients/taypro-client1.png",
  "/tayproclients/taypro-client2.png",
  "/tayproclients/taypro-client3.png",
  "/tayproclients/taypro-client4.png",
  "/tayproclients/taypro-client5.png",
  "/tayproclients/taypro-client6.png",
  "/tayproclients/taypro-client7.png",
  "/tayproclients/taypro-client8.png",
];

export const features = [
  {
    title: "Maximise plant efficiency",
    description:
      "Waterless robotic cleaning reduces soiling losses on utility-scale plants, recovering generation that manual washing often cannot sustain at scale.",
  },
  {
    title: "Consistent performance ratio",
    description:
      "Scheduled dry cycles help keep performance ratio stable through dusty seasons, without water logistics or crew availability gaps.",
  },
  {
    title: "Highest uptime guarantee",
    description:
      "Taypro targets industry-leading robot availability with pan-India spares, NECTYR remote diagnostics, and structured AMC support.",
  },
  {
    title: "Same-day breakdown resolution",
    description:
      "Field engineers and regional inventory support same-day on-site response across India, backed by NECTYR ticketing.",
  },
];

export const otherFeatures = [
  {
    title: "Patented dual-pass cleaning",
    description:
      "Airflow lifts dry dust first, then microfiber completes the wipe, see our cleaning technology page for the full methodology.",
  },
  {
    title: "RF mesh & fleet connectivity",
    description:
      "LTE, Wi-Fi, hybrid RF mesh, LoRa, and LoRaWAN, sized per site so robots and NECTYR stay connected in the field.",
  },
  {
    title: "AI/ML scheduling",
    description:
      "Automatic cleaning robots adjust cycle cadence from weather and soiling inputs, fewer wasted runs, more predictable O&M.",
  },
  {
    title: "Made in India",
    description:
      "Designed and manufactured at our Chakan, Pune hub with TÜV NORD certified hardware and patents on core cleaning systems.",
  },
];

export const robotFeatures = [
  {
    title: "Maximum Up-time Guarantee -",
    description:
      "Taypro’s solar cleaning robots offer you the highest up-time guarantee. Our advanced cleaning solutions enable maximum functioning and power generation for solar plants.",
  },
  {
    title: "AI and ML Systems -",
    description:
      "Our solar panel cleaning robots provide meticulous cleaning while utilising the intelligence from AI and Machine Learning Systems. This enables real-time tracking & boosts the solar plant’s efficiency.",
  },
  {
    title: "Same-Day Breakdown Solution -",
    description:
      "We assure same-day breakdown solutions for solar panel cleaning robots. Our dedicated team of technicians are available at every site & city to handle the resolution through a dedicated service portal.",
  },
  {
    title: "Dual-Pass Cleaning Method -",
    description:
      "Our robots use our own patented dual-pass cleaning method. First, it cleans the dust from the solar panels through the airflow and then deep cleans it with the microfiber cloth.",
  },
  {
    title: "RF-Based Mesh Communication -",
    description:
      "Our solar panel cleaning robots work on RF-based mesh communication. The cloud-based SCADA ensures complete security and reliability while communicating across a huge area.",
  },
  {
    title: "Predictive Solar Cleaning -",
    description:
      "Our advanced solar cleaning robots clean while sensing the weather. They schedule cleaning cycles based on weather predictions for increased efficiency.",
  },
];

export const toDoFeatures = [
  {
    title:
      "Keep track of your solar panel cleaning schedule for maximum benefits.",
  },
  {
    title:
      "Thoughtfully choose the perfect time when the sun is down and solar panels are cooler for efficient cleaning.",
  },
  {
    title:
      "The roof and its surface should be properly assessed before operating the cleaning robots over it.",
  },
  {
    title: "Cleaning and maintaining the robots consistently is necessary.",
  },
  {
    title:
      "Charge the batteries from time to time to ensure the longevity of the cleaning robots.",
  },
];

export const robotsAdvantages = [
  {
    title: "AI and ML Integration -",
    description:
      "Integrating AI-oriented and machine learning systems leads to immaculate cleaning solutions. These ML-driven robotics enable maximum power generation in a cost-effective manner.",
  },
  {
    title: "Waterless Cleaning Technology -",
    description:
      "Taypro’s solar panel cleaning robots work on waterless cleaning technology for fixed tilt, seasonal tilt, and rooftop installations. It rather uses a dual-pass cleaning method, consisting of airflow and microfiber cloth.",
  },
  {
    title: "Fast and Safe Cleaning -",
    description:
      "The tech-oriented and dual-pass solar panel cleaning method allows faster cleaning with the utmost efficiency and zero scratches. The solar panels are safely cleaned through airflow and microfiber cloth.",
  },
  {
    title: "Faster and More Returns -",
    description:
      "The quick and efficient functionality of solar panel cleaning robots ensures seamless operations while saving energy. This gives faster returns on investment. It helps reduce operational time, effort, and labour costs.",
  },
  {
    title: "Battery Power -",
    description:
      "The waterless solar panel cleaning robots are powered by advanced batteries. It comprises maximum battery power compared to its charging time. The cleaning length can be increased by customising the battery capacity.",
  },
];

export const projects = [
  {
    img: "/tayprosolarfirm/banda-solar.jpg",
    title: "Banda Solar Project – 70 MW",
    details: "Automatic, Capex, Semi-Automatic",
    href: "/projects/banda-solar-project",
    date: "January 28, 2025",
  },
  {
    img: "/tayprosolarfirm/yadgir-solar.jpg",
    title: "Yadgir Solar Project – 50 MW",
    details: "Automatic, Capex, Semi-Automatic",
    href: "/projects/yadgir-solar-project-50-mw",
    date: "January 28, 2025",
  },
];

export const faqs = [
  {
    question:
      "Who looks after the Automatic Solar Panel Cleaning System after Installation?",
    answer:
      "After installation, the system can be remotely monitored and controlled through the TAYPRO console. The TAYPRO team provides technical support and troubleshooting issues.",
  },
  {
    question:
      "Does the automatic solar module cleaning system require water for cleaning?",
    answer:
      "No, the TAYPRO GLYDE operates using waterless cleaning technology. It uses a rotating microfiber cloth to remove the dust and debris efficiently.",
  },
  {
    question:
      "How often does the Automatic Solar Panel Cleaning Robot need to be maintained?",
    answer:
      "The TAYPRO GLYDE requires minimal maintenance due to its self-cleaning microfiber cloth and automated fault detection system.",
  },
  {
    question:
      "What Is the Cleaning Schedule Followed by the Automatic Solar Cleaning Robots?",
    answer:
      "The robots operate after solar energy production hours to avoid power loss and optimise the cleaning efficiency.",
  },
  {
    question: "Does Taypro Provide AMC for Solar Panel Cleaning?",
    answer:
      "Yes, TAYPRO offers AMC services for its solar panel cleaning services The AMC includes regular maintenance, real-time monitoring and onsite support targeting same-day resolution to ensure continuous operation.",
  },
  {
    question:
      "Does the Automatic Solar Panel Cleaning Robot require an external power connection?",
    answer:
      "No, TAYPRO’s GLYDE does not require an external power connection. It is self -powered system.",
  },
  {
    question:
      "How Do You Manage the Functioning of Automatic Solar Panel Cleaning Robots?",
    answer:
      "The cleaning robots are managed through a remote monitoring portal which allows users to schedule cleaning cycles, adjust speed and monitor system performance.",
  },
];

export const moreFaqs = [
  {
    question:
      "Does the Solar Panel Robot require an external power connection?",
    answer:
      "Solar panel cleaning robot works on the internal power system. They have in-built batteries for smooth automated cleaning of solar panels. The battery life can be customised depending on the length of the solar panel cleaning area.",
  },
  {
    question:
      "Does the solar module cleaning system require water for cleaning?",
    answer:
      "No, the solar module cleaning system does not require water for cleaning. Our robots work on the complete waterless dual-pass cleaning method. This method includes airflow and microfibre cloth for deep and safe cleaning of the solar panels.",
  },
  {
    question:
      "Who looks after the solar panel cleaning system after the installation?",
    answer:
      "A trained expert or technician is required to look after the operations, efficacy, and maintenance of the solar panel cleaning system after its installation. We at TAYPRO have a team of skilled technicians across a site or a city, who look after the functioning and redressals of the solar panel cleaning robots.",
  },
  {
    question:
      "How do you manage the functioning of solar panel cleaning robots?",
    answer:
      "The solar panel cleaning robots function through the automated systems. They have integrated microcontrollers or sensors that inspect their movements from one panel to another. These robots come in automated and semi-automated types. A skilled technician has to occasionally look after the operations of these cleaning robots.",
  },
  {
    question: "What is the cleaning schedule followed by the cleaning robots?",
    answer:
      "The cleaning schedule by the cleaning robots may vary based on the site location and environmental factors. If the site of the solar panels is located in a dry and dusty area, then the panels need to be cleaned more often.",
  },
  {
    question: "Does TAYPRO provide AMC?",
    answer:
      "Yes, TAYPRO provides an annual maintenance contract for their solar panel cleaning robots. It provides a comprehensive package, ensuring optimal efficiency and power generation.",
  },
];

export const modelCards = getRelatedProductCards("glyde");
export const modelBCards = getRelatedProductCards("helyx");
export const modelTCards = getRelatedProductCards("glydeX");
export const nyumaCards = getRelatedProductCards("nyuma");
export const nyumaXCards = getRelatedProductCards("nyumaX");

export const resources = [
  {
    title: "The Complete Guide to Solar Panel Maintenance",
    href: "/blog/the-complete-guide-to-solar-panel-maintenance",
  },
  {
    title: "New Solar Panel Technologies 2025",
    href: "/blog/new-solar-panel-technologies-2025",
  },
  {
    title: "What Are The Different Types Of Solar Panels",
    href: "/blog/what-are-the-different-types-of-solar-panels-2",
  },
  {
    title: "How to calculate Solar Plant ROI and PayBack Period",
    href: "/blog/how-to-calculate-solar-plant-roi-and-payback-period",
  },
];

export const items = [
  {
    label: "Who we are",
    heading:
      "Engineering-led robotics for solar asset owners and operators across India.",
    body:
      "Taypro Private Limited designs, manufactures, and supports autonomous solar panel cleaning robots for fixed tilt, seasonal tilt, rooftop, and single-axis tracker installations. Our Made-in-India systems combine waterless dual-pass cleaning, resilient field connectivity, and cloud monitoring through NECTYR, so plants can sustain higher performance ratios with predictable operations and maintenance.",
  },
  {
    label: "Vision",
    heading: "Unlock the full economic and environmental value of every solar megawatt.",
    body:
      "Soiling is one of the largest avoidable drags on generation. We believe renewable energy only scales when performance is dependable year after year. Taypro exists to give IPPs, developers, and O&M teams a repeatable way to protect yield, labour safety, and water resources on the same assets that power communities and industry.",
  },
  {
    label: "Mission",
    heading:
      "Ship reliable robots, transparent service, and measurable outcomes, site by site.",
    body:
      "We invest in R&D, manufacturing capacity, and nationwide logistics so customers receive consistent quality, rapid spare availability, and responsive support. From GLYDE and HELYX for distributed layouts to GLYDE-X for trackers, plus Taypro Opex for operator-led cleaning, our roadmap stays tied to one question: does it improve plant uptime, safety, and total cost of ownership?",
  },
];

const publicProofScale = buildTayproPublicProofStats();

export const metrics = [
  {
    value: publicProofScale.cleaningEfficiency.value,
    label: publicProofScale.cleaningEfficiency.label,
  },
  {
    value: publicProofScale.robotsManufacturedPerMonth.value,
    label: publicProofScale.robotsManufacturedPerMonth.label,
  },
  {
    value: publicProofScale.warehouses.value,
    label: publicProofScale.warehouses.label,
  },
];

export const founders = [
  {
    name: "Yogesh Kudale",
    role: "CEO",
    img: "/tayprofounders/taypro-yogesh.png",
    linkedin: "https://www.linkedin.com/in/yogesh-kudale/",
  },
  {
    name: "Tejas Memane",
    role: "COO",
    img: "/tayprofounders/taypro-tejas.png",
    linkedin: "https://www.linkedin.com/in/tejas-memane-600523151/",
  },
  {
    name: "Akshay Auti",
    role: "CTO",
    img: "/tayprofounders/taypro-akshay.png",
    linkedin: "https://www.linkedin.com/in/akshay-auti/",
  },
  {
    name: "Abhishek Masurkar",
    role: "CMO",
    img: "/tayprofounders/taypro-abhishek.png",
    linkedin: "https://www.linkedin.com/in/abhi-masurkar/",
  },
];

export const bandaMetrics = [
  {
    number: "127273",
    label: "Number Of Modules Cleaned Annually",
  },
  {
    number: "7636380",
    label: "Liters Water Saved Annually",
  },
  {
    number: "₹1272730",
    label: "Annual Labour Cost Savings",
  },
  {
    number: "20665.95",
    label: "Metric Tons Annual CO₂ Emissions Saved",
  },
];

export const yadgirMetrics = [
  {
    number: "90909",
    label: "Number Of Modules Cleaned Annually",
  },
  {
    number: "5454540",
    label: "Liters Water Saved Annually",
  },
  {
    number: "₹909090",
    label: "Annual Labour Cost Savings",
  },
  {
    number: "14761.35",
    label: "Metric Tons Annual CO₂ Emissions Saved",
  },
];

export const soyegaonMetrics = [
  {
    number: "181818",
    label: "Number Of Modules Cleaned Annually",
  },
  {
    number: "10909080",
    label: "Liters Water Saved Annually",
  },
  {
    number: "₹1818180",
    label: "Annual Labour Cost Savings",
  },
  {
    number: "29522.7",
    label: "Metric Tons Annual CO₂ Emissions Saved",
  },
];

export const agarMetrics = [
  {
    number: "454545",
    label: "Number Of Modules Cleaned Annually",
  },
  {
    number: "27272700",
    label: "Liters Water Saved Annually",
  },
  {
    number: "₹45,45,450",
    label: "Annual Labour Cost Savings",
  },
  {
    number: "73806.75",
    label: "Metric Tons Annual CO₂ Emissions Saved",
  },
];

export const energyResourceCards: EnergyResourceCard[] = [
  {
    title: "The Complete Guide to Solar Panel Maintenance",
    imgSrc: "/tayproenergyresource/taypro-energy-resource1.webp",
    date: "July 27, 2025",
    href: "/blog/the-complete-guide-to-solar-panel-maintenance",
  },
  {
    title: "New Solar Panel Technologies 2025",
    imgSrc: "/tayproenergyresource/taypro-energy-resource2.webp",
    date: "July 23, 2025",
    href: "/blog/new-solar-panel-technologies-2025",
  },
  {
    title: "What Are The Different Types Of Solar Panels",
    imgSrc: "/tayproenergyresource/taypro-energy-resource3.webp",
    date: "July 21, 2025",
    href: "/blog/what-are-the-different-types-of-solar-panels-2",
  },
  {
    title: "How to calculate Solar Plant ROI and PayBack Period",
    imgSrc: "/blogs/taypro-energy-resource4.webp",
    date: "July 1, 2025",
    href: "/blog/how-to-calculate-solar-plant-roi-and-payback-period",
  },
  {
    title: "Solar Panel Maintenance Checklist 2025",
    imgSrc: "/blogs/taypro-energy-resource5.webp",
    date: "July 1, 2025",
    href: "/blog/solar-panel-maintenance-checklist-2025",
  },
  {
    title: "What are the different types of Solar Panels?",
    imgSrc: "/blogs/taypro-energy-resource6.webp",
    date: "June 29, 2025",
    href: "/blog/what-are-the-different-types-of-solar-panels",
  },
  {
    title: "How To Calculate A Performance Ratio Of A Solar Plant?",
    imgSrc: "/blogs/taypro-energy-resource7.webp",
    date: "June 28, 2025",
    href: "/blog/how-to-calculate-a-performance-ratio-of-a-solar-plant",
  },
  {
    title: "Top 15 Solar Power Plants In India",
    imgSrc: "/blogs/taypro-energy-resource8.webp",
    date: "June 24, 2025",
    href: "/blog/top-15-solar-power-plants-in-india",
  },
  {
    title: "How AI Can Improve Solar Energy Output?",
    imgSrc: "/blogs/taypro-energy-resource9.webp",
    date: "June 16, 2025",
    href: "/blog/how-ai-can-improve-solar-energy-output",
  },
  {
    title: "The Ultimate Guide to Designing a Solar Power Plant",
    imgSrc: "/blogs/taypro-energy-resource10.webp",
    date: "May 31, 2025",
    href: "/blog/the-ultimate-guide-to-designing-a-solar-power-plant",
  },
  {
    title: "What is Solar Panel Efficiency?",
    imgSrc: "/blogs/taypro-energy-resource11.webp",
    date: "May 31, 2025",
    href: "/blog/what-is-solar-panel-efficiency",
  },
  {
    title: "What is the Solar Panel Efficiency in 2025?",
    imgSrc: "/blogs/taypro-energy-resource12.webp",
    date: "May 21, 2025",
    href: "/blog/what-is-the-solar-panel-efficiency-in-2025",
  },
  {
    title: "Solar Panel Installation Cost For Utility Scale In India",
    imgSrc: "/blogs/taypro-energy-resource13.webp",
    date: "May 19, 2025",
    href: "/blog/solar-panel-installation-cost-for-utility-scale-in-india",
  },
  {
    title: "How to Make Solar Panels More Efficient?",
    imgSrc: "/blogs/taypro-energy-resource14.webp",
    date: "May 18, 2025",
    href: "/blog/how-to-make-solar-panels-more-efficient",
  },
  {
    title: "How Are PV Panel Cleaning Robots Installed?",
    imgSrc: "/blogs/taypro-energy-resource16.webp",
    date: "April 27, 2025",
    href: "/blog/how-are-pv-panel-cleaning-robots-installed",
  },
  {
    title: "Benefits Of Using Solar Panel Cleaning Robot In A Solar Plant",
    imgSrc: "/blogs/taypro-energy-resource16.webp",
    date: "April 21, 2025",
    href: "/blog/benefits-of-using-solar-panel-cleaning-robot-in-a-solar-plant",
  },
  {
    title: "How Does A Solar Panel Cleaning Robot Work? ",
    imgSrc: "/blogs/taypro-energy-resource17.webp",
    date: "April 18, 2025",
    href: "/blog/how-does-a-solar-panel-cleaning-robot-work",
  },
  {
    title: "What is a Solar Panel Cleaning Robot?",
    imgSrc: "/blogs/taypro-energy-resource18.webp",
    date: "April 12, 2025",
    href: "/blog/what-is-a-solar-panel-cleaning-robot",
  },
  {
    title: "Importance Of Keeping Your Solar Panels Clean",
    imgSrc: "/blogs/taypro-energy-resource19.webp",
    date: "April 10, 2025",
    href: "/blog/importance-of-keeping-your-solar-panels-clean",
  },
  {
    title: "What Are The Best Practices Of Cleaning Solar Panels?",
    imgSrc: "/blogs/taypro-energy-resource20.webp",
    date: "April 3, 2025",
    href: "/blog/what-are-the-best-practices-of-cleaning-solar-panels",
  },
  {
    title: "How Does Cleaning A Solar Panel Increase Efficiency?",
    imgSrc: "/blogs/taypro-energy-resource21.webp",
    date: "March 29, 2025",
    href: "/blog/how-does-cleaning-a-solar-panel-increase-efficiency",
  },
  {
    title: "What Are The Benefits Of Cleaning Solar Panels Regularly?",
    imgSrc: "/blogs/taypro-energy-resource22.png",
    date: "March 29, 2025",
    href: "/blog/what-are-the-benefits-of-cleaning-solar-panels-regularly",
  },
  {
    title:
      "What Is Solar Panel Cleaning? Why Is It Necessary To Clean Solar Panels?",
    imgSrc: "/blogs/taypro-energy-resource23.webp",
    date: "March 22, 2025",
    href: "/blog/what-is-solar-panel-cleaning",
  },
  {
    title:
      "India’s Solar Energy Boom in 2024: What It Means for You and the Planet",
    imgSrc: "/blogs/taypro-energy-resource24.jpg",
    date: "March 18, 2025",
    href: "/blog/indias-solar-energy-boom-in-2024-what-it-means-for-you-and-the-planet",
  },
  {
    title: "What Are The Different Methods Used For Solar Panel Cleaning?",
    imgSrc: "/blogs/taypro-energy-resource25.webp",
    date: "March 11, 2025",
    href: "/blog/what-are-the-different-methods-used-for-solar-panel-cleaning",
  },
  {
    title:
      "RF Communication in Solar Farms: How Taypro Ensures Real-Time Robot-to-Control Room Connectivity Using Mesh Networks",
    imgSrc: "/blogs/taypro-energy-resource26.jpg",
    date: "March 10, 2025",
    href: "/blog/rf-communication-in-solar-farms-how-taypro-ensures-real-time-robot-to-control-room-connectivity-using-mesh-networks",
  },
  {
    title:
      "The Impact of Weather on Solar Panel Cleanliness in India: Tips for Optimal Performance",
    imgSrc: "/blogs/taypro-energy-resource27.webp",
    date: "March 10, 2025",
    href: "/blog/the-impact-of-weather-on-solar-panel-cleanliness-in-india-tips-for-optimal-performance",
  },
  {
    title:
      "The Evolution of Solar Panel Cleaning Brushes: Why Microfiber is the New Standard",
    imgSrc: "/blogs/taypro-energy-resource28.jpg",
    date: "March 9, 2025",
    href: "/blog/the-evolution-of-solar-panel-cleaning-brushes-why-microfiber-is-the-new-standard",
  },
  {
    title:
      "Microfiber vs. Traditional Brushes: Why Taypro’s Patented Dual Pass Solar Panel Cleaning System Outperforms",
    imgSrc: "/blogs/taypro-energy-resource29.jpg",
    date: "March 8, 2025",
    href: "/blog/microfiber-vs-traditional-brushes-why-taypros-patented-dual-pass-solar-panel-cleaning-system-outperforms",
  },
  {
    title:
      "How AI Predicts Dust Storms: The Science Behind Taypro’s Smart Solar Panel Cleaning System",
    imgSrc: "/blogs/taypro-energy-resource30.jpg",
    date: "March 7, 2025",
    href: "/blog/how-ai-predicts-dust-storms-the-science-behind-taypros-smart-solar-panel-cleaning-system",
  },
  {
    title:
      "The Importance of Solar Panel Cleaning Across Different Regions of India: Tailoring Solutions for Diverse Climates",
    imgSrc: "/blogs/taypro-energy-resource31.webp",
    date: "March 6, 2025",
    href: "/blog/the-importance-of-solar-panel-cleaning-across-different-regions-of-india",
  },
  {
    title:
      "The Crucial Role of Regular Solar Panel Cleaning for Efficiency: Keeping Performance High in a Dusty World",
    imgSrc: "/blogs/taypro-energy-resource32.jpg",
    date: "March 5, 2025",
    href: "/blog/the-importance-of-regular-solar-panel-cleaning-for-efficiency",
  },
  {
    title: "Cost-Benefit Analysis of Solar Panel Cleaning Services in India",
    imgSrc: "/blogs/taypro-energy-resource33.webp",
    date: "March 4, 2025",
    href: "/blog/cost-benefit-analysis-of-solar-panel-cleaning-services-in-india",
  },
  {
    title: "Seasonal Solar Panel Maintenance Tips: A Comprehensive Guide",
    imgSrc: "/blogs/taypro-energy-resource34.jpg",
    date: "March 3, 2025",
    href: "/blog/seasonal-solar-panel-maintenance-tips-a-comprehensive-guide",
  },
  {
    title:
      "The Importance of Solar Panel Cleaning: Maximizing Efficiency and Energy Production",
    imgSrc: "/blogs/taypro-energy-resource35.jpg",
    date: "March 2, 2025",
    href: "/blog/the-importance-of-solar-panel-cleaning-maximizing-efficiency-and-energy-production",
  },
  {
    title:
      "Beyond Cleaning: How Taypro’s Robots are Paving the Way for Autonomous Solar Farms in India",
    imgSrc: "/blogs/taypro-energy-resource36.jpeg",
    date: "March 1, 2025",
    href: "/blog/beyond-cleaning-how-taypros-robots-are-paving-the-way-for-autonomous-solar-farms-in-india",
  },
  {
    title:
      "5 Signs Your Solar Plant Needs Automated Cleaning Before Revenue Starts Dropping",
    imgSrc: "/blogs/taypro-energy-resource37.jpg",
    date: "February 27, 2025",
    href: "/blog/5-signs-your-solar-plant-needs-automated-cleaning-before-revenue-drops",
  },
  {
    title:
      "Innovations in Solar Cleaning Systems: What India’s Top Farms Are Using",
    imgSrc: "/blogs/taypro-energy-resource38.jpg",
    date: "February 26, 2025",
    href: "/blog/innovations-in-solar-cleaning-systems-what-indias-top-farms-are-using",
  },
  {
    title: "Why Solar Power Plants Need Robotic Cleaning for Maximum ROI",
    imgSrc: "/blogs/taypro-energy-resource39.jpg",
    date: "February 25, 2025",
    href: "/blog/why-solar-power-plants-need-robotic-cleaning-for-maximum-roi",
  },
  {
    title: "5 Costly Mistakes to Avoid in Solar Panel Cleaning",
    imgSrc: "/blogs/taypro-energy-resource40.jpg",
    date: "February 24, 2025",
    href: "/blog/5-costly-mistakes-to-avoid-in-solar-panel-cleaning",
  },
  {
    title:
      "The Science Behind Effective Solar Module Cleaning Systems: A Technical Comparison of Traditional and Modern Approaches",
    imgSrc: "/blogs/taypro-energy-resource41.jpg",
    date: "February 23, 2025",
    href: "/blog/the-science-behind-effective-solar-module-cleaning-systems-a-technical-comparison-of-traditional-and-modern-approaches",
  },
  {
    title:
      "A Comparative Analysis of Traditional Solar Panel Cleaning Methods vs Taypro’s Autonomous Waterless Robots",
    imgSrc: "/blogs/taypro-energy-resource36.jpeg",
    date: "February 22, 2025",
    href: "/blog/a-comparative-analysis-of-traditional-solar-panel-cleaning-methods-vs-taypros-autonomous-waterless-robots",
  },
  {
    title:
      "Why Modern Solar Farms Need Autonomous Solar Panel Cleaning Systems",
    imgSrc: "/blogs/taypro-energy-resource29.jpg",
    date: "February 21, 2025",
    href: "/blog/why-modern-solar-farms-need-autonomous-solar-panel-cleaning-systems",
  },
  {
    title:
      "The Role of Data Analytics in Solar Panel Cleaning: Improving Efficiency with Taypro",
    imgSrc: "/blogs/taypro-energy-resource42.webp",
    date: "January 20, 2025",
    href: "/blog/the-role-of-data-analytics-in-solar-panel-cleaning-improving-efficiency-with-taypro",
  },
  {
    title:
      "Beyond Cleaning: How Automated Systems Can Monitor Solar Panel Performance",
    imgSrc: "/blogs/taypro-energy-resource43.webp",
    date: "January 19, 2025",
    href: "/blog/beyond-cleaning-how-automated-systems-can-monitor-solar-panel-performance",
  },
  {
    title:
      "Leveraging Carbon Pricing for Environmental and Economic Sustainability",
    imgSrc: "/blogs/taypro-energy-resource27.webp",
    date: "January 18, 2025",
    href: "/blog/leveraging-carbon-pricing-for-environmental-and-economic-sustainability",
  },
  {
    title:
      "Understanding ESG: A Definitive Exploration into Environmental, Social, and Governance Principles",
    imgSrc: "/blogs/taypro-energy-resource44.jpg",
    date: "January 17, 2025",
    href: "/blog/understanding-esg-a-definitive-exploration-into-environmental-social-and-governance-principles",
  },
  {
    title: "How Often Should You Clean Your Solar Panels in India?",
    imgSrc: "/blogs/taypro-energy-resource45.jpg",
    date: "January 9, 2025",
    href: "/blog/how-often-should-you-clean-your-solar-panels-in-india",
  },
  {
    title:
      "Mint Tech4Good Awards 2024: Taypro’s Green AI Solutions Win Big in Mumbai, India",
    imgSrc: "/blogs/taypro-energy-resource46.jpg",
    date: "December 21, 2024",
    href: "/blog/mint-tech4good-awards-2024-taypros-green-ai-solutions-win-big-in-mumbai-india",
  },
  {
    title:
      "TAYPRO Wins Historic Patent for Revolutionary Solar Panel Cleaning System",
    imgSrc: "/blogs/taypro-energy-resource47.jpg",
    date: "April 24, 2024",
    href: "/blog/taypro-wins-historic-patent-for-revolutionary-solar-panel-cleaning-system",
  },
];
