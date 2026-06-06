import { getTranslations } from "next-intl/server";
import { Container } from "./Container";
import { AnimateOnScroll } from "./AnimateOnScroll";
import ProjectsGrid from "./ProjectsGrid";
import type { ProjectGridItem } from "@/lib/cms/project-card-display";

interface RelatedProjectsSectionProps {
  projects: ProjectGridItem[];
}

export async function AllRelatedProjectsSection({
  projects,
}: RelatedProjectsSectionProps) {
  const t = await getTranslations("ProjectDetailPage");

  return (
    <section className="w-full bg-[#f4f7f9] border-t border-gray-200 py-14 md:py-20 overflow-x-hidden">
      <Container>
        <AnimateOnScroll animation="fadeInUp" className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
            {t("relatedEyebrow")}
          </p>
          <h3 className="text-[#052638] font-semibold text-2xl sm:text-3xl mb-3">
            {t("relatedHeading")}
          </h3>
          <p className="text-[#27415c] text-base">{t("relatedSubheading")}</p>
        </AnimateOnScroll>
        <ProjectsGrid projects={projects} columns={3} />
      </Container>
    </section>
  );
}

export default AllRelatedProjectsSection;
