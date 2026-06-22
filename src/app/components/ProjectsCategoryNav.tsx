"use client";

import { Link } from "@/i18n/navigation";
import type { ProjectCategoryFilter } from "@/lib/cms/project-categories";
import { trackNavigationClick } from "@/lib/analytics/track-event";

const CATEGORY_LINKS: {
  key: ProjectCategoryFilter;
  href: `/projects/${string}`;
}[] = [
  { key: "automatic", href: "/projects/automatic" },
  { key: "semiAutomatic", href: "/projects/semi-automatic" },
  { key: "capex", href: "/projects/capex" },
  { key: "opex", href: "/projects/opex" },
];

type ProjectsCategoryNavProps = {
  active: ProjectCategoryFilter;
  getLabel: (key: ProjectCategoryFilter) => string;
  hubLabel?: string;
};

export function ProjectsCategoryNav({
  active,
  getLabel,
  hubLabel = "All projects",
}: ProjectsCategoryNavProps) {
  const trackNav = (label: string, href: string) => {
    trackNavigationClick({
      label,
      href,
      location: "projects_category_nav",
    });
  };

  return (
    <nav
      className="flex flex-wrap justify-center gap-2"
      aria-label="Project deployment categories"
    >
      <Link
        href="/projects"
        onClick={() => trackNav(hubLabel, "/projects")}
        className="inline-flex min-h-[40px] items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#052638] transition-colors hover:border-[#A8C117] hover:text-[#5a8f00]"
      >
        {hubLabel}
      </Link>
      {CATEGORY_LINKS.map(({ key, href }) => {
        const isActive = key === active;
        const label = getLabel(key);
        return (
          <Link
            key={key}
            href={href}
            aria-current={isActive ? "page" : undefined}
            onClick={() => trackNav(label, href)}
            className={`inline-flex min-h-[40px] items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-[#A8C117] bg-[#A8C117] text-[#052638]"
                : "border-gray-200 bg-white text-[#052638] hover:border-[#A8C117] hover:text-[#5a8f00]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
