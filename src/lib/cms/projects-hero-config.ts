import type { ProjectCategoryFilter } from "@/lib/cms/project-categories";

export type ProjectsHeroTone = "hub" | ProjectCategoryFilter;

export const PROJECTS_HERO_BASE = "/tayprobglayout/projects-hero";

export type ProjectsHeroImage = {
  src: string;
  alt: string;
  objectPosition?: string;
};

export const PROJECTS_HERO_IMAGES: Record<ProjectsHeroTone, ProjectsHeroImage> =
  {
    hub: {
      src: `${PROJECTS_HERO_BASE}/hub.png`,
      alt: "Utility-scale solar plant at golden hour with Taypro robotic cleaning deployments across India",
      objectPosition: "55% 45%",
    },
    automatic: {
      src: `${PROJECTS_HERO_BASE}/automatic.png`,
      alt: "Autonomous Taypro cleaning robots scheduled on utility-scale solar panel rows",
      objectPosition: "50% 65%",
    },
    semiAutomatic: {
      src: `${PROJECTS_HERO_BASE}/semi-automatic.png`,
      alt: "Taypro semi-automatic portable cleaning robot operated on a multi-megawatt solar plant",
      objectPosition: "50% 55%",
    },
    capex: {
      src: `${PROJECTS_HERO_BASE}/capex.png`,
      alt: "Developer-owned Taypro robot fleet commissioned on a large ground-mount solar installation",
      objectPosition: "45% 50%",
    },
    opex: {
      src: `${PROJECTS_HERO_BASE}/opex.png`,
      alt: "Taypro operator-led Opex cleaning service on utility-scale photovoltaic arrays",
      objectPosition: "50% 60%",
    },
  };

export const PROJECTS_HERO_ACCENT: Record<
  ProjectsHeroTone,
  { bar: string; glow: string }
> = {
  hub: { bar: "from-[#A8C117] to-[#7a9a12]", glow: "bg-[#A8C117]/20" },
  automatic: { bar: "from-[#A8C117] to-[#6d8f0f]", glow: "bg-[#A8C117]/25" },
  semiAutomatic: { bar: "from-[#7ec8e3] to-[#4a9fd4]", glow: "bg-[#7ec8e3]/20" },
  capex: { bar: "from-[#e8c547] to-[#c9a227]", glow: "bg-[#e8c547]/15" },
  opex: { bar: "from-[#b2cb19] to-[#8fa014]", glow: "bg-[#b2cb19]/20" },
};
