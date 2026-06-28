"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  PROJECTS_HUB_PORTFOLIO_SECTION_ID,
  parseProjectsHubPage,
} from "@/lib/cms/projects-hub-pagination";

export function ProjectsPortfolioScrollAnchor() {
  const searchParams = useSearchParams();
  const page = parseProjectsHubPage(searchParams.get("page") ?? undefined);

  useEffect(() => {
    if (page <= 1 && window.location.hash !== `#${PROJECTS_HUB_PORTFOLIO_SECTION_ID}`) {
      return;
    }

    const section = document.getElementById(PROJECTS_HUB_PORTFOLIO_SECTION_ID);
    if (!section) return;

    requestAnimationFrame(() => {
      section.scrollIntoView({ block: "start" });
    });
  }, [page]);

  return null;
}
