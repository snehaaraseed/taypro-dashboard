"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AnimateOnScroll } from "./AnimateOnScroll";
import { ProjectDetailChips } from "./ProjectDetailChips";
import { getProjectHeroImageAlt } from "../utils/imageAlt";
import {
  prioritizeProjectCardDetails,
  projectCardCategoryEyebrow,
  projectCardExcerpt,
  type ProjectGridItem,
  type ProjectsGridLayout,
} from "@/lib/cms/project-card-display";

function projectImageAlt(project: ProjectGridItem): string {
  return getProjectHeroImageAlt({
    title: project.title,
    imageAlt: project.imageAlt,
    description: project.description,
    details: project.details,
  });
}

const columnClasses: Record<2 | 3, string> = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
};

export type ProjectsGridProps = ProjectsGridLayout & {
  projects: ProjectGridItem[];
  className?: string;
};

export default function ProjectsGrid({
  projects,
  featuredFirst = false,
  columns = 2,
  className = "",
}: ProjectsGridProps) {
  const t = useTranslations("ProjectsPage");

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 text-[#27415c]">
        <p>{t("projectCard.empty")}</p>
      </div>
    );
  }

  return (
    <div
      className={`grid ${columnClasses[columns]} gap-x-10 gap-y-14 lg:gap-x-14 lg:gap-y-20 ${className}`.trim()}
    >
      {projects.map((project, idx) => {
        const isFeatured = featuredFirst && idx === 0 && columns === 2;
        const displayTags = prioritizeProjectCardDetails(
          project.details,
          project.title
        );
        const eyebrow =
          projectCardCategoryEyebrow(project.details) ??
          t("projectCard.defaultEyebrow");
        const excerpt =
          project.cardExcerpt || projectCardExcerpt(project.description);

        return (
          <AnimateOnScroll
            key={project.id}
            animation="fadeInUp"
            delay={Math.min(idx * 80, 400)}
            className={isFeatured ? "md:col-span-2" : undefined}
          >
            <Link
              href={project.href}
              title={project.title}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C117] focus-visible:ring-offset-4 rounded-sm"
            >
              <div
                className={`relative overflow-hidden bg-[#eef3f8] mb-5 ${
                  isFeatured ? "aspect-[21/9] md:aspect-[2.4/1]" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={project.img}
                  alt={projectImageAlt(project)}
                  title={project.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  sizes={
                    isFeatured
                      ? "(max-width: 768px) 100vw, 100vw"
                      : columns === 3
                        ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        : "(max-width: 768px) 100vw, 50vw"
                  }
                  priority={idx < 2}
                />
                <div className="absolute inset-0 bg-[#052638]/0 group-hover:bg-[#052638]/5 transition-colors duration-500" />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0 flex-1">
                  <p className="text-[#A8C117] text-xs font-medium uppercase tracking-[0.2em] mb-2">
                    {eyebrow}
                  </p>
                  <h3 className="text-[#052638] font-semibold text-xl md:text-2xl leading-snug group-hover:text-[#5a8f00] transition-colors duration-300">
                    {project.title}
                  </h3>
                  {excerpt ? (
                    <p className="mt-3 text-[#27415c] text-sm md:text-base leading-relaxed line-clamp-2">
                      {excerpt}
                    </p>
                  ) : null}
                  {displayTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-y-1 text-sm text-[#27415c]">
                      {displayTags.map((item, detailIdx) => (
                        <span
                          key={`${item}-${detailIdx}`}
                          className="inline-flex items-center"
                        >
                          {detailIdx > 0 && (
                            <span className="mx-2 text-[#27415c]/35" aria-hidden>
                              ·
                            </span>
                          )}
                          <ProjectDetailChips
                            items={[item]}
                            linkClassName="hover:text-[#5a8f00] transition-colors duration-300"
                            spanClassName=""
                          />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="shrink-0 text-[#5a8f00] text-sm font-medium mt-1 sm:mt-8 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  {t("projectCard.viewLink")}
                </span>
              </div>
            </Link>
          </AnimateOnScroll>
        );
      })}
    </div>
  );
}
