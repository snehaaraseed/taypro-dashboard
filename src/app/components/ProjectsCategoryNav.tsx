import { Link } from "@/i18n/navigation";
import type { ProjectCategoryFilter } from "@/lib/cms/project-categories";

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
  return (
    <nav
      className="flex flex-wrap justify-center gap-2"
      aria-label="Project deployment categories"
    >
      <Link
        href="/projects"
        className="inline-flex min-h-[40px] items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#052638] transition-colors hover:border-[#A8C117] hover:text-[#5a8f00]"
      >
        {hubLabel}
      </Link>
      {CATEGORY_LINKS.map(({ key, href }) => {
        const isActive = key === active;
        return (
          <Link
            key={key}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex min-h-[40px] items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-[#A8C117] bg-[#A8C117] text-[#052638]"
                : "border-gray-200 bg-white text-[#052638] hover:border-[#A8C117] hover:text-[#5a8f00]"
            }`}
          >
            {getLabel(key)}
          </Link>
        );
      })}
    </nav>
  );
}
