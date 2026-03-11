/**
 * Product Knowledge Base
 * 
 * This file contains exact, verified specifications for all Taypro products and services.
 * This knowledge base is used in AI prompts to prevent hallucination and ensure accuracy.
 * 
 * IMPORTANT: Only include verified, factual information. Do not add unverified claims.
 */

export interface ProductSpec {
  model: string;
  name: string;
  specifications: Record<string, string | number | string[]>;
  features: string[];
  suitableFor: string[];
  description: string;
}

export interface ServiceSpec {
  name: string;
  description: string;
  features: string[];
  benefits: string[];
}

export const modelA: ProductSpec = {
  model: "Model-A",
  name: "Automatic Solar Panel Cleaning Robot",
  description: "Autonomous Waterless Cleaning Robot with Dual pass cleaning method with AI and ML Capabilities.",
  specifications: {
    cleaningRange: "up to 2.2km on single charge",
    speed: "14 meters per minute",
    technology: "AI-enabled waterless cleaning",
    dustRemoval: "up to 100%",
  },
  features: [
    "AI-enabled waterless cleaning",
    "Dual-pass cleaning method",
    "Microfiber cloths",
    "Extended cleaning range (2.2km)",
    "High-speed cleaning rate (14 m/min)",
    "Smart weather optimization",
  ],
  suitableFor: [
    "Fixed-tilt installations",
    "Seasonal tilt installations",
    "Rooftop installations",
  ],
};

export const modelB: ProductSpec = {
  model: "Model-B",
  name: "Semi-Automatic Solar Panel Cleaning Robot",
  description: "A pick-and-place type portable dry solar panel cleaning robot for scattered utility scale solar power plants.",
  specifications: {
    cleaningRange: "up to 2.2km",
    speed: "10 to 15 meters per minute",
    type: "Pick-and-place portable",
    weight: "Light-weight",
  },
  features: [
    "Pick-and-place type",
    "Portable design",
    "Waterless cleaning",
    "Fall prevention system",
    "Contactless sensors",
    "Light-weight construction",
  ],
  suitableFor: [
    "Fixed-tilt installations",
    "Seasonal-tilt installations",
    "Scattered utility scale solar power plants",
  ],
};

export const modelT: ProductSpec = {
  model: "Model-T",
  name: "Single-Axis Tracker Solar Panel Cleaning Robot",
  description: "Autonomous patented cleaning robot with flexible body and 360° flexible rotational bridge for single-axis trackers.",
  specifications: {
    cleaningRange: "up to 2.2km on single charge",
    bridgeType: "360-degree flexible bridge",
    charging: "Built-in solar panel for charging",
    communication: "High efficiency, smooth communication network",
  },
  features: [
    "360-degree flexible bridge",
    "Built-in solar panel for charging",
    "Autonomous operation",
    "Patented design",
    "Flexible body",
    "High efficiency communication",
  ],
  suitableFor: [
    "Single-axis tracker systems",
  ],
};

export const tayproOPEX: ServiceSpec = {
  name: "Taypro OPEX",
  description: "Solar Panel Cleaning Service - OPEX model with dedicated skilled manpower",
  features: [
    "Dedicated skilled manpower for robot operation",
    "Smart & efficient cleaning",
    "Ensuring panel safety",
    "Enhanced energy output",
    "Environmental sustainability",
    "Seamless integration into plant operations",
    "Cost-effective and long-term solution",
    "Same-day breakdown resolution",
    "Real-time monitoring via Taypro Console",
  ],
  benefits: [
    "No upfront capital investment",
    "Professional service management",
    "Guaranteed uptime",
    "Same-day issue resolution",
  ],
};

export const tayproConsole: ServiceSpec = {
  name: "Taypro Console",
  description: "Monitoring app for Solar Panel Cleaning Robot fleet management",
  features: [
    "Real-time monitoring",
    "Remote control and scheduling",
    "Performance tracking",
    "Fault detection and alerts",
    "Weather-based optimization",
  ],
  benefits: [
    "Centralized fleet management",
    "Proactive maintenance",
    "Data-driven insights",
  ],
};

export const generalFeatures = {
  allModels: [
    "Waterless cleaning technology",
    "Patented dual-pass cleaning method (airflow + microfiber)",
    "RF-based mesh communication",
    "Cloud-based SCADA",
    "AI & ML integration",
    "Weather sensing and predictive cleaning",
    "Highest uptime guarantee",
  ],
  certifications: [
    "ISO 9001 (Quality Management)",
    "ISO 14001 (Environmental Management)",
    "UL standards compliant",
    "IEC standards compliant",
  ],
  patents: [
    "Dual Pass Cleaning System",
    "RF Mesh Communication",
  ],
};

/**
 * Get formatted product knowledge base string for use in AI prompts
 */
export function getProductKnowledgeBase(): string {
  return `
TAYPRO PRODUCT KNOWLEDGE BASE - VERIFIED INFORMATION ONLY

MODEL A (Automatic Solar Panel Cleaning Robot):
- Model Name: Model-A
- Description: Autonomous Waterless Cleaning Robot with Dual pass cleaning method with AI and ML Capabilities
- Cleaning Range: Up to 2.2km on single charge
- Speed: 14 meters per minute
- Technology: AI-enabled waterless cleaning
- Dust Removal: Up to 100%
- Suitable For: Fixed-tilt, seasonal tilt, and rooftop installations
- Key Features: AI-enabled waterless cleaning, dual-pass cleaning method, microfiber cloths, extended cleaning range, high-speed cleaning rate, smart weather optimization

MODEL B (Semi-Automatic Solar Panel Cleaning Robot):
- Model Name: Model-B
- Description: A pick-and-place type portable dry solar panel cleaning robot for scattered utility scale solar power plants
- Cleaning Range: Up to 2.2km
- Speed: 10 to 15 meters per minute
- Type: Pick-and-place portable
- Weight: Light-weight
- Suitable For: Fixed-tilt, seasonal-tilt, scattered utility scale solar power plants
- Key Features: Pick-and-place type, portable design, waterless cleaning, fall prevention system, contactless sensors, light-weight construction

MODEL T (Single-Axis Tracker Solar Panel Cleaning Robot):
- Model Name: Model-T
- Description: Autonomous patented cleaning robot with flexible body and 360° flexible rotational bridge for single-axis trackers
- Cleaning Range: Up to 2.2km on single charge
- Bridge: 360-degree flexible bridge
- Charging: Built-in solar panel for charging
- Communication: High efficiency, smooth communication network
- Suitable For: Single-axis tracker systems
- Key Features: 360-degree flexible bridge, built-in solar panel for charging, autonomous operation, patented design, flexible body, high efficiency communication

TAYPRO OPEX SERVICE:
- Service Model: OPEX (Operational Expenditure)
- Description: Solar Panel Cleaning Service with dedicated skilled manpower
- Features: Dedicated skilled manpower, smart & efficient cleaning, panel safety, enhanced energy output, environmental sustainability, seamless integration, cost-effective solution, same-day breakdown resolution, real-time monitoring via Taypro Console
- Benefits: No upfront capital investment, professional service management, guaranteed uptime, same-day issue resolution

TAYPRO CONSOLE:
- Description: Monitoring app for Solar Panel Cleaning Robot fleet management
- Features: Real-time monitoring, remote control and scheduling, performance tracking, fault detection and alerts, weather-based optimization
- Benefits: Centralized fleet management, proactive maintenance, data-driven insights

GENERAL FEATURES (All Models):
- Waterless cleaning technology
- Patented dual-pass cleaning method (airflow + microfiber)
- RF-based mesh communication
- Cloud-based SCADA
- AI & ML integration
- Weather sensing and predictive cleaning
- Highest uptime guarantee

CERTIFICATIONS:
- ISO 9001 (Quality Management)
- ISO 14001 (Environmental Management)
- UL standards compliant
- IEC standards compliant

PATENTS:
- Dual Pass Cleaning System
- RF Mesh Communication

IMPORTANT NOTES:
- DO NOT invent or add any specifications not listed above
- DO NOT make up model numbers or product names
- If information is not in this knowledge base, either omit it or state it generically
- Always verify any technical claims against this knowledge base
`;
}
