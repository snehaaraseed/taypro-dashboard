export type PressCoverageKind =
  | "interview"
  | "news"
  | "market"
  | "award";

export type PressCoverageItem = {
  title: string;
  outlet: string;
  url: string;
  date: string;
  summary: string;
  kind: PressCoverageKind;
};

/** Third-party press and industry coverage (outbound links only). Newest first within each kind. */
export const PRESS_COVERAGE: PressCoverageItem[] = [
  {
    kind: "interview",
    title:
      "Robotic Cleaning Cuts O&M Costs by 40%, Boosts Solar Generation by Up to 15%, Interview",
    outlet: "Mercom India",
    url: "https://www.mercomindia.com/robotic-cleaning-cuts-om-costs-by-40-boosts-solar-generation-by-up-to-15-interview/",
    date: "2026-05",
    summary:
      "CEO Yogesh Kudale on how Taypro's waterless robotic cleaning reduces O&M spend, recovers generation, and scales across 5 GW+ of Indian utility and C&I solar plants.",
  },
  {
    kind: "interview",
    title: "Interview: Yogesh Kudale, Co-Founder and CEO, TAYPRO",
    outlet: "EPC World",
    url: "https://www.epcworld.in/interview-yogesh-kudale-co-founder-and-ceo-taypro/",
    date: "2026-04",
    summary:
      "CEO interview on dual-pass dry cleaning, hybrid LoRa mesh fleet connectivity, and Taypro's path to becoming a solar asset performance partner.",
  },
  {
    kind: "interview",
    title:
      "Waterless Robotics Can Recover Up to 12% Lost Solar Generation, Says TAYPRO's Yogesh Kudale",
    outlet: "Energetica India",
    url: "https://www.energetica-india.net/powerful-thoughts/online/yogesh-kudale",
    date: "2026-03",
    summary:
      "Yogesh Kudale (Co-Founder & CEO, Taypro) on waterless robotic cleaning, CAPEX/OPEX models, and performance recovery on utility-scale solar plants.",
  },
  {
    kind: "interview",
    title: "We See Taypro Evolving Into a Solar Asset Performance Partner",
    outlet: "T&D India",
    url: "https://www.tndindia.com/we-see-taypro-evolving-into-a-solar-asset-performance-partner/",
    date: "2026-03",
    summary:
      "Yogesh Kudale (Co-Founder & CEO, Taypro) on Taypro's shift from hardware vendor to performance partner for IPPs and large Indian solar portfolios.",
  },
  {
    kind: "interview",
    title:
      "The Future of Solar Cleaning Robots Is as Mobile Health Monitoring Tools for Solar Plants",
    outlet: "Saur Energy",
    url: "https://www.saurenergy.com/solar-energy-conversation/the-future-of-solar-cleaning-robots-is-as-mobile-health-monitoring-tools-for-solar-plants-yogesh-kudale-taypro-11208821",
    date: "2026-03",
    summary:
      "Yogesh Kudale (Co-Founder & CEO, Taypro) on waterless cleaning, AI-driven schedules, mesh networking, and robots evolving into plant health monitors.",
  },
  {
    kind: "interview",
    title: "How Taypro's AI Robots Are Redefining Solar Plant Performance",
    outlet: "TimesTech",
    url: "https://timestech.in/how-taypros-ai-robots-are-redefining-solar-plant-performance/",
    date: "2026",
    summary:
      "Yogesh Kudale (Co-Founder & CEO, Taypro) on AI-driven scheduling, dual-pass dry cleaning, CAPEX/OPEX models, and fleet operations at Tata Power, Avaada, and Amplus.",
  },
  {
    kind: "interview",
    title:
      "Taypro Aims to Be a Performance-Driven Automation Provider: Yogesh Kudale",
    outlet: "IPF Online",
    url: "https://ipfonline.com/news/detail/interviews/taypro-aims-to-be-a-performance-driven-automation-provider-yogesh-kudale/18611",
    date: "2026-02",
    summary:
      "Interview with Yogesh Kudale on Taypro's automation roadmap, predictive maintenance, and deployments across Indian utility-scale solar plants.",
  },
  {
    kind: "interview",
    title:
      "Why the Next Wave of Solar Innovation Will Focus on Operations Rather Than Panels",
    outlet: "TimesTech",
    url: "https://timestech.in/why-the-next-wave-of-solar-innovation-will-focus-on-operations-rather-than-panels/",
    date: "2026",
    summary:
      "Opinion piece by Yogesh Kudale (Co-Founder & CEO, Taypro) on O&M automation, robotic cleaning, and asset performance as the next solar frontier.",
  },
  {
    kind: "interview",
    title:
      "Robotic Solar Module Cleaning Is Six Times Cheaper Than Traditional Means",
    outlet: "Mercom India",
    url: "https://www.mercomindia.com/robotic-solar-module-cleaning-is-six-times-cheaper-than-traditional-means",
    date: "2025-06",
    summary:
      "Panel discussion featuring Yogesh Kudale (CEO, Taypro) on the economics of robotic vs manual solar module cleaning and AI-driven cleaning plans.",
  },
  {
    kind: "market",
    title: "Top Robotic Solar Module Cleaning Equipment Suppliers in 2024",
    outlet: "Mercom India",
    url: "https://www.mercomindia.com/top-robotic-solar-module-cleaning-equipment-suppliers-in-2024",
    date: "2025-06",
    summary:
      "Mercom's India Solar Market Leaderboard 2025 ranks Taypro as the #1 supplier of robotic solar module cleaning equipment in India for 2024, with 27.5% market share.",
  },
  {
    kind: "award",
    title: "Mint Tech4Good Awards 2024: Taypro Wins Gold",
    outlet: "Live Mint",
    url: "https://www.livemint.com/ai/mint-tech4good-awards-2024-taypro-and-ugam-gramin-vikas-sansthas-green-ai-solutions-win-big-11734689821094.html",
    date: "2024-12",
    summary:
      "Live Mint coverage of Mint Tech4Good Awards 2024: Taypro recognised with a Gold award for green AI solutions in solar energy.",
  },
  {
    kind: "news",
    title:
      "Union Budget 2026-27 Unveils INR 20,000 Cr CCUS Plan, Customs Relief for Solar and Storage",
    outlet: "Energetica India",
    url: "https://www.energetica-india.net/news/union-budget-2026-27-unveils-inr-20000-cr-ccus-plan-customs-relief-for-solar-and-storage",
    date: "2026-02",
    summary:
      "Post-budget industry reactions, Yogesh Kudale (Co-Founder & CEO, Taypro) on PFC/REC restructuring, the Infrastructure Risk Guarantee Fund, and transmission and green corridor investments.",
  },
  {
    kind: "news",
    title:
      "Union Budget 2026: Industry Seeks Stronger Fiscal Support on Renewables, Storage and Domestic RE Manufacturing",
    outlet: "Energetica India",
    url: "https://www.energetica-india.net/news/union-budget-2026-industry-seeks-stronger-fiscal-support-on-renewables-storage-and-domestic-re-manufacturing",
    date: "2026-01",
    summary:
      "Pre-budget roundup quoting Yogesh Kudale (Co-Founder & CEO, Taypro) on fiscal support needed to reach India's 500 GW renewable energy target.",
  },
  {
    kind: "news",
    title: "Taypro Launches Movable Docking Station for Solar Cleaning Robots",
    outlet: "Energetica India",
    url: "https://www.energetica-india.net/news/taypro-launches-movable-docking-station-for-solar-cleaning-robots",
    date: "2026-03",
    summary:
      "Product news on Taypro's movable docking station (MDS) for autonomous row transfer, quoted Yogesh Kudale.",
  },
  {
    kind: "news",
    title: "Taypro Launches Movable Docking Station for Solar Cleaning Robots",
    outlet: "IPF Online",
    url: "https://ipfonline.com/news/detail/articles/taypro-launches-movable-docking-station-for-solar-cleaning-robots/18703",
    date: "2026-03",
    summary:
      "IPF Online product news on Taypro's MDS launch for enhanced autonomous robot mobility across solar rows.",
  },
  {
    kind: "news",
    title:
      "Taypro Launches a Revolutionary MDS to Enhance Autonomous Mobility",
    outlet: "TimesTech",
    url: "https://timestech.in/taypro-launches-a-revolutionary-mds-to-enhance-autonomous-mobility/",
    date: "2026-03",
    summary:
      "TimesTech coverage of Taypro's movable docking station for improved robot mobility across solar rows.",
  },
  {
    kind: "news",
    title:
      "Taypro Introduces Movable Docking Station to Improve Mobility of Solar Cleaning Robots",
    outlet: "BW Sustainability World",
    url: "https://www.bwsustainabilityworld.com/article/taypro-introduces-movable-docking-station-to-improve-mobility-of-solar-cleaning-robots-596234",
    date: "2026-03",
    summary:
      "Industry news on Taypro's movable docking station for utility-scale cleaning robot fleets.",
  },
  {
    kind: "news",
    title: "Taypro Launches Movable Docking Station for Solar Cleaning Robots",
    outlet: "Aaroka Tech",
    url: "https://aarokatech.com/taypro-launches-movable-docking-station-for-solar-cleaning-robots/",
    date: "2026-03",
    summary:
      "Product launch coverage quoting Yogesh Kudale on autonomous mobility for solar cleaning robots.",
  },
  {
    kind: "news",
    title:
      "Taypro Launches a Revolutionary MDS to Enhance Autonomous Mobility",
    outlet: "AutoEV Times",
    url: "https://autoevtimes.com/taypro-launches-a-revolutionary-mds-to-enhance-autonomous-mobility/",
    date: "2026-03",
    summary:
      "AutoEV Times report on Taypro's movable docking station for row-transfer robot operations.",
  },
  {
    kind: "news",
    title:
      "Bot Benefits: Innovative Cleaning Solutions Enhance Module Efficiency",
    outlet: "Renewable Watch",
    url: "https://renewablewatch.in/2024/02/20/bot-benefits-innovative-cleaning-solutions-enhance-module-efficiency/",
    date: "2024-02",
    summary:
      "Industry roundup of robotic solar cleaning providers, features Taypro's waterless autonomous and semi-automatic cleaning robots.",
  },
  {
    kind: "news",
    title:
      "Taypro Private Limited: Pioneering Waterless Solar Cleaning for a Sustainable Future",
    outlet: "Killer Startups",
    url: "https://killerstartups.com/taypro-private-limited-pioneering-waterless-solar-cleaning-for-a-sustainable-future/",
    date: "2024-03",
    summary:
      "Company profile of Taypro and its waterless solar cleaning robots; founders Yogesh Kudale, Tejas Memane, Akshay Auti, and Abhishek Masurkar.",
  },
];

export const PRESS_PAGE_PATH = "/press";
