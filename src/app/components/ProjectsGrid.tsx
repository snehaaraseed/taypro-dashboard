"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
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
  eagerImages = false,
  className = "",
}: ProjectsGridProps) {
  const t = useTranslations("ProjectsPage");

  if (projects.length === 0) {
    return (
      <div className="py-16 text-center text-[#27415c]">
        <p>{t("projectCard.empty")}</p>
      </div>
    );
  }

  return (
    <div
      className={`grid ${columnClasses[columns]} gap-6 lg:gap-8 ${className}`.trim()}
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
              className="group block h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-[#A8C117]/50 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C117] focus-visible:ring-offset-4"
            >
              <div
                className={`relative overflow-hidden bg-[#eef3f8] ${
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
                      ? "(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 900px"
                      : columns === 3
                        ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                        : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  }
                  quality={eagerImages && idx < 2 ? 70 : 65}
                  priority={eagerImages && idx < 2}
                  loading={eagerImages && idx < 2 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#052638]/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>

              <div className="flex flex-col gap-4 p-5 md:p-6">
                <div className="min-w-0 flex-1">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A8C117]">
                    {eyebrow}
                  </p>
                  <h3 className="text-xl font-semibold leading-snug text-[#052638] transition-colors duration-300 group-hover:text-[#5a8f00] md:text-2xl">
                    {project.title}
                  </h3>
                  {excerpt ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#27415c] md:text-base">
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
                            linkCategories={false}
                            linkClassName="hover:text-[#5a8f00] transition-colors duration-300"
                            spanClassName=""
                          />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5a8f00] transition-all duration-300 group-hover:gap-2.5">
                  {t("projectCard.viewLink")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </Link>
          </AnimateOnScroll>
        );
      })}
    </div>
  );
}
