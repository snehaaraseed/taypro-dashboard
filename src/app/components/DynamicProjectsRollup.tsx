import { Link as I18nLink } from "@/i18n/navigation";

import { Container } from "./Container";
import { AnimateOnScroll } from "./AnimateOnScroll";
import ProjectsGrid from "./ProjectsGrid";
import { getAllFileProjects } from "@/app/utils/projectFileUtils";
import { enrichProjectsForGrid } from "@/lib/cms/projectService";

interface DynamicProjectsRollupProps {
  locale?: string;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  limit?: number;
  background?: "white" | "cream";
  showViewAll?: boolean;
}

export default async function DynamicProjectsRollup({
  locale,
  eyebrow = "Deployed at utility scale",
  heading = "Solar Panel Cleaning Robots already at work across India",
  subheading = "Taypro robots clean panels at multi-megawatt plants across India. A small sample of recent installations is below.",
  limit = 4,
  background = "cream",
  showViewAll = true,
}: DynamicProjectsRollupProps) {
  const projects = await getAllFileProjects(locale);

  if (!projects || projects.length === 0) return null;

  const sorted = [...projects]
    .sort(
      (a, b) =>
        new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    )
    .slice(0, limit);

  if (sorted.length === 0) return null;

  const gridProjects = await enrichProjectsForGrid(sorted, locale);
  const bgClass = background === "white" ? "bg-white" : "bg-[#f4f7f9]";

  return (
    <section className={`${bgClass} py-16 sm:py-20`}>
      <Container>
        <AnimateOnScroll animation="fadeInUp" className="mb-12 md:mb-16 max-w-3xl">
          {eyebrow ? (
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-[0.18em] mb-4">
              {eyebrow}
            </p>
          ) : null}
          {heading ? (
            <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
              {heading}
            </h2>
          ) : null}
          {subheading ? (
            <p className="text-[#27415c] text-base sm:text-lg leading-relaxed mt-5">
              {subheading}
            </p>
          ) : null}
        </AnimateOnScroll>

        <ProjectsGrid projects={gridProjects} columns={2} />

        {showViewAll ? (
          <AnimateOnScroll animation="fadeInUp" className="text-center mt-12 md:mt-16">
            <I18nLink
              href="/projects"
              className="inline-flex items-center justify-center min-h-[48px] bg-[#052638] text-white font-medium px-7 py-3.5 rounded-md hover:bg-[#0c3d56] transition"
            >
              See all solar projects
            </I18nLink>
          </AnimateOnScroll>
        ) : null}
      </Container>
    </section>
  );
}
