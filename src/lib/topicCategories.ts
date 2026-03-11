export interface TopicCategory {
  name: string;
  description: string;
  keywords: string[];
}

export const topicCategories: TopicCategory[] = [
  {
    name: "Cleaning Methods & Technology",
    description: "Topics about cleaning methods, technologies, and innovations",
    keywords: [
      "waterless cleaning benefits",
      "dual-pass cleaning system",
      "AI-powered scheduling",
      "weather-based cleaning optimization",
      "microfiber cleaning technology",
      "automated cleaning systems",
    ],
  },
  {
    name: "Robot Models & Features",
    description: "Topics about specific robot models and their features",
    keywords: [
      "Model A automatic features",
      "Model B semi-automatic benefits",
      "Model T single-axis tracker specifications",
      "robot model comparison",
      "cleaning robot capabilities",
    ],
  },
  {
    name: "Efficiency & Performance",
    description: "Topics about efficiency improvements and performance optimization",
    keywords: [
      "cleaning increases efficiency",
      "performance ratio improvements",
      "energy output optimization",
      "dust impact on solar panels",
      "efficiency gains from cleaning",
    ],
  },
  {
    name: "Solar Power Plant Operations & Maintenance (O&M)",
    description: "Topics about overall solar power plant operations and maintenance",
    keywords: [
      "daily O&M best practices",
      "preventive maintenance schedules",
      "performance monitoring and tracking",
      "troubleshooting common plant issues",
      "inverter maintenance and optimization",
      "transformer and electrical system maintenance",
      "SCADA system monitoring",
      "performance ratio PR management",
      "plant availability optimization",
      "safety protocols in solar plants",
      "grid integration and compliance",
    ],
  },
  {
    name: "Maintenance & Operations (Robots)",
    description: "Topics about robot-specific maintenance and operations",
    keywords: [
      "robot preventive maintenance schedules",
      "robot troubleshooting common issues",
      "uptime guarantee importance",
      "same-day breakdown resolution",
      "battery maintenance for robots",
      "RF communication system maintenance",
    ],
  },
  {
    name: "ROI & Cost Analysis",
    description: "Topics about return on investment and cost analysis",
    keywords: [
      "cost savings calculations",
      "labor cost reduction",
      "water savings quantification",
      "payback period analysis",
      "O&M cost optimization strategies",
      "ROI of cleaning robots",
    ],
  },
  {
    name: "Installation & Commissioning",
    description: "Topics about installation and commissioning processes",
    keywords: [
      "solar plant installation process",
      "robot installation procedures",
      "commissioning checklists",
      "site preparation requirements",
      "integration with existing systems",
    ],
  },
  {
    name: "Industry Trends & Innovations",
    description: "Topics about industry trends and innovations",
    keywords: [
      "latest solar cleaning technologies",
      "market trends in India",
      "future of autonomous cleaning",
      "ESG and sustainability impact",
      "solar industry innovations",
    ],
  },
  {
    name: "Regional & Climate-Specific",
    description: "Topics about regional and climate-specific considerations",
    keywords: [
      "cleaning needs in different Indian regions",
      "weather impact on cleaning schedules",
      "dust-prone area solutions",
      "monsoon season considerations",
      "regional O&M challenges",
      "climate-specific maintenance",
    ],
  },
  {
    name: "Technical Deep Dives",
    description: "In-depth technical topics",
    keywords: [
      "solar panel degradation and prevention",
      "electrical system optimization",
      "grid integration and compliance",
      "data analytics for plant performance",
      "predictive maintenance strategies",
      "technical analysis of cleaning systems",
    ],
  },
];

/**
 * Get a random category from the list
 */
export function getRandomCategory(): TopicCategory {
  const randomIndex = Math.floor(Math.random() * topicCategories.length);
  return topicCategories[randomIndex];
}

/**
 * Get category by name
 */
export function getCategoryByName(name: string): TopicCategory | undefined {
  return topicCategories.find((cat) => cat.name === name);
}
