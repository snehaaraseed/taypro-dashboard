import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";

type CompetitorLandscapeFile = {
  meta?: { disclaimer?: string };
  indiaMarketContext?: {
    summary?: string;
    commonBuyerCriteria?: string[];
  };
  tayproPositioning?: {
    category?: string;
    differentiators?: string[];
    whenTayproWins?: string[];
  };
};

/** Approved competitor/market facts for insight prompts, no live web scraping of vendor specs. */
export function loadCompetitorContextForPrompt(): string {
  const filePath = path.join(
    getDeploymentRoot(),
    "data",
    "competitor-landscape.json"
  );
  if (!fs.existsSync(filePath)) {
    return "COMPETITOR CONTEXT: (file unavailable, omit market-share rankings; focus on buyer criteria only.)";
  }

  const raw = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  ) as CompetitorLandscapeFile;

  const lines = [
    "APPROVED MARKET CONTEXT (use for buyer framing; cite source year if mentioning share estimates from briefs only):",
    raw.indiaMarketContext?.summary ?? "",
  ];

  if (raw.indiaMarketContext?.commonBuyerCriteria?.length) {
    lines.push(
      "Common buyer criteria in India:", ...raw.indiaMarketContext.commonBuyerCriteria.map((c) => `- ${c}`)
    );
  }

  if (raw.tayproPositioning) {
    lines.push(`Taypro category: ${raw.tayproPositioning.category ?? "Indian OEM + Opex"}`);
    if (raw.tayproPositioning.differentiators?.length) {
      lines.push(
        "Taypro differentiators (factual, from Taypro site, not third-party claims):", ...raw.tayproPositioning.differentiators.map((d) => `- ${d}`)
      );
    }
    if (raw.tayproPositioning.whenTayproWins?.length) {
      lines.push(
        "When Taypro is a strong fit:", ...raw.tayproPositioning.whenTayproWins.map((w) => `- ${w}`)
      );
    }
  }

  if (raw.meta?.disclaimer) {
    lines.push(`Disclaimer: ${raw.meta.disclaimer}`);
  }

  lines.push(
    "Do NOT invent competitor product specs or market-share percentages unless they appear in FACT RESEARCH with a source hint."
  );

  return lines.filter(Boolean).join("\n");
}
